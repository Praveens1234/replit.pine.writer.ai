"""
The Pine Forge v4.0 - Static Analysis Engine
File: analyzer.py
Description: This module contains the static analysis engine for Pine Script v5 code.
             It performs deterministic checks without using an LLM.
"""
import re
from typing import List, Tuple, Dict, Any
from memory_manager import load_pine_rules

# A list of standard built-in colors in Pine Script v5
PINE_V5_STANDARD_COLORS = {
    "color.aqua", "color.black", "color.blue", "color.fuchsia", "color.gray",
    "color.green", "color.lime", "color.maroon", "color.navy", "color.olive",
    "color.orange", "color.purple", "color.red", "color.silver", "color.teal",
    "color.white", "color.yellow"
}

# Load Pine Script rules for the validator
PINE_RULES = load_pine_rules()
FUNCTION_SIGNATURES = PINE_RULES.get("function_signatures", {})

def _strip_comments(code: str) -> List[Tuple[int, str]]:
    """Removes comments from code and returns a list of (line_number, line_content) tuples."""
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    lines = code.splitlines()
    code_lines = []
    for i, line in enumerate(lines):
        stripped_line = re.sub(r'//.*', '', line).strip()
        if stripped_line:
            code_lines.append((i + 1, stripped_line))
    return code_lines

def validate_version(code: str, code_lines: List[Tuple[int, str]]) -> Tuple[bool, str]:
    """Validate that `//@version=5` is the first non-comment, non-whitespace line."""
    if not code_lines:
        return False, "E001: Code is empty or only contains comments."
    raw_lines = code.splitlines()
    first_meaningful_raw_line = ""
    line_number_of_first_line = 1
    for i, line in enumerate(raw_lines):
        stripped_line = line.strip()
        if stripped_line and not stripped_line.startswith("/*") and not stripped_line.endswith("*/"):
            first_meaningful_raw_line = stripped_line
            line_number_of_first_line = i + 1
            break
    if not first_meaningful_raw_line.startswith("//@version=5"):
        return False, f"E002: Line {line_number_of_first_line}: The script must start with `//@version=5`."
    return True, ""

def validate_declaration(code_lines: List[Tuple[int, str]]) -> Tuple[bool, str]:
    """Ensure exactly one script declaration exists and has required parameters."""
    declarations = []
    # `study()` is deprecated and handled by `_validate_function_calls`
    declaration_starters = ("indicator(", "strategy(", "library(")
    for line_num, line in code_lines:
        if any(line.startswith(starter) for starter in declaration_starters):
            declarations.append((line_num, line))

    # Also search for `study` to provide a more specific error than just "missing declaration"
    if not declarations:
        for line_num, line in code_lines:
            if line.startswith("study("):
                return False, f"E102: Line {line_num}: The function `study()` is deprecated. Use `indicator()` or `strategy()` instead."

    if len(declarations) == 0:
        return False, "E003: Missing script declaration. Use `indicator()`, `strategy()`, or `library()`."
    if len(declarations) > 1:
        return False, f"E004: Multiple script declarations found on lines {[d[0] for d in declarations]}."
    declaration_line = declarations[0][1]
    has_title_param = 'title=' in declaration_line
    has_positional_title = bool(re.search(r'^\s*\w+\s*\(\s*["\']', declaration_line))
    if not (has_title_param or has_positional_title):
        return False, f"E005: Line {declarations[0][0]}: The script declaration is missing a `title` parameter."
    # Return true but pass back a warning for missing overlay
    if declaration_line.startswith("indicator(") and 'overlay=' not in declaration_line:
        return True, f"W001: Line {declarations[0][0]}: The `indicator()` declaration is missing the `overlay` parameter."
    if declaration_line.startswith("library(") and 'format=' not in declaration_line:
        return False, f"W002: Line {declarations[0][0]}: The `library()` declaration is missing the `format` parameter."
    return True, ""

def _validate_function_calls(code_lines: List[Tuple[int, str]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Validates function calls against the signatures in pine_rules.json."""
    errors = []
    warnings = []
    # This regex is a significant improvement, but not a full-blown parser.
    # It finds function names and captures the full argument block inside the first-level parentheses.
    func_call_regex = re.compile(r'\b([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+|[a-zA-Z0-9_]+)\s*\((.*)\)')

    for line_num, line in code_lines:
        # We only want to match from the start of a potential function call, not in the middle of a line
        clean_line = line.strip()
        match = func_call_regex.match(clean_line)
        if not match:
            continue

        func_name = match.group(1)
        args_str = match.group(2)

        # Basic balancing check for the captured arguments string to avoid parsing malformed parts
        if args_str.count('(') != args_str.count(')'):
             continue # This will be caught by the main bracket checker

        if func_name in FUNCTION_SIGNATURES:
            signature = FUNCTION_SIGNATURES[func_name]

            # 1. Check for deprecation
            if signature.get("deprecated"):
                errors.append({ # Deprecation is an error, not a warning
                    "code": "E102", "line": line_num,
                    "message": f"Function `{func_name}` is deprecated. Use `{signature.get('replacement', 'a newer function')}` instead."
                })
                # If it's deprecated, we don't need to check its arguments
                continue

            # 2. Argument Count Validation (more robust)
            # This logic splits arguments by comma, but ignores commas inside nested parentheses.
            # It's a significant improvement over a simple split.
            args = []
            if args_str.strip():
                balance = 0
                current_arg = ""
                for char in args_str:
                    if char == '(': balance += 1
                    elif char == ')': balance -= 1
                    
                    if char == ',' and balance == 0:
                        args.append(current_arg.strip())
                        current_arg = ""
                    else:
                        current_arg += char
                args.append(current_arg.strip())
            
            provided_args_count = len(args) if args != [''] else 0

            required_params = [p for p, v in signature.get("parameters", {}).items() if v.get("required")]

            if provided_args_count < len(required_params):
                errors.append({
                    "code": "E103", "line": line_num,
                    "message": f"Invalid argument count for `{func_name}`. Expected at least {len(required_params)}, but got {provided_args_count}."
                })
    return errors, warnings

def validate_v5_syntax(code_lines: List[Tuple[int, str]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Validate Pine Script v5 specific syntax rules."""
    errors, warnings = _validate_function_calls(code_lines)
    for line_num, line in code_lines:
        # `study()` deprecation is handled by `_validate_function_calls`
        if re.search(r'\binput\s*\(', line) and not re.search(r'input\.\w+\s*\(', line):
            errors.append({"code": "E104", "line": line_num, "message": "Naked `input()` is deprecated. Specify a type, e.g., `input.int()`."})
    return errors, warnings

def validate_brackets(code: str) -> Tuple[bool, str]:
    """Stack-based bracket matching for `()`, `[]`, `{}`."""
    stack, in_string_double, in_string_single = [], False, False
    bracket_map = {')': '(', ']': '[', '}': '{'}
    open_brackets = set(['(', '[', '{'])
    for line_num, line in enumerate(code.splitlines(), 1):
        for col_num, char in enumerate(line, 1):
            if char == '"' and not in_string_single: in_string_double = not in_string_double
            elif char == "'" and not in_string_double: in_string_single = not in_string_single
            if in_string_double or in_string_single: continue
            if char in open_brackets: stack.append((char, line_num, col_num))
            elif char in bracket_map:
                if not stack: return False, f"E201: Unmatched closing bracket '{char}' at line {line_num}, column {col_num}."
                last_open, _, _ = stack.pop()
                if last_open != bracket_map[char]: return False, f"E202: Mismatched brackets. Expected '{last_open}' but found '{char}' at line {line_num}, column {col_num}."
    if stack:
        last_open, line_num, col_num = stack.pop()
        return False, f"E203: Unclosed opening bracket '{last_open}' at line {line_num}, column {col_num}."
    return True, ""

def validate_assignments(code_lines: List[Tuple[int, str]]) -> List[Dict[str, Any]]:
    """Checks for invalid assignment targets."""
    errors = []
    # A simple regex to find assignment targets. A real parser would be more robust.
    assignment_regex = re.compile(r'^\s*([^=]+?)\s*:=')
    valid_target_regex = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')

    for line_num, line in code_lines:
        match = assignment_regex.match(line)
        if match:
            target = match.group(1).strip()
            if not valid_target_regex.match(target):
                errors.append({
                    "code": "E301", "line": line_num,
                    "message": f"Invalid assignment target: `{target}`. The target of an assignment must be a valid variable name."
                })
    return errors

def validate_ternary_operators(code_lines: List[Tuple[int, str]]) -> List[Dict[str, Any]]:
    """Checks for malformed ternary operators."""
    warnings = []
    for line_num, line in code_lines:
        if '?' in line and ':' not in line:
            warnings.append({
                "code": "W201", "line": line_num,
                "message": "Potential malformed ternary operator: found `?` without a matching `:`. Ensure the structure is `condition ? value_if_true : value_if_false`."
            })
    return warnings

def comprehensive_check(code: str) -> Dict[str, Any]:
    """Orchestrates all validation checks and returns a structured result."""
    results = {"is_valid": True, "errors": [], "warnings": [], "score": 100}
    brackets_valid, brackets_err = validate_brackets(code)
    if not brackets_valid:
        code, msg = brackets_err.split(':', 1)
        line_match = re.search(r'line (\d+)', msg)
        line = int(line_match.group(1)) if line_match else 0
        results["errors"].append({"code": code, "line": line, "message": msg.strip()})
        results["is_valid"] = False; results["score"] = 0; return results
    
    code_lines = _strip_comments(code)
    version_valid, version_err = validate_version(code, code_lines)
    if not version_valid:
        code, msg = version_err.split(':', 1)
        results["errors"].append({"code": code, "line": 1, "message": msg.strip()})
    
    declaration_valid, declaration_msg = validate_declaration(code_lines)
    if not declaration_valid:
        code, msg = declaration_msg.split(':', 1)
        line_match = re.search(r'Line (\d+)', msg)
        line = int(line_match.group(1)) if line_match else 0
        results["errors"].append({"code": code, "line": line, "message": msg.strip()})
    elif declaration_msg: # It's a warning
        code, msg = declaration_msg.split(':', 1)
        line_match = re.search(r'Line (\d+)', msg)
        line = int(line_match.group(1)) if line_match else 0
        results["warnings"].append({"code": code, "line": line, "message": msg.strip()})

    syntax_errors, syntax_warnings = validate_v5_syntax(code_lines)
    results["errors"].extend(syntax_errors)
    results["warnings"].extend(syntax_warnings)

    # Add new validation checks
    results["errors"].extend(validate_assignments(code_lines))
    results["warnings"].extend(validate_ternary_operators(code_lines))

    results["score"] -= (len(results["errors"]) * 20 + len(results["warnings"]) * 5)
    results["score"] = max(0, results["score"])
    if results["errors"]: results["is_valid"] = False; results["score"] = 0
    return results
