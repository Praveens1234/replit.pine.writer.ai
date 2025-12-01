"""
Tests for the Pine Forge Static Analysis Engine (`analyzer.py`)
"""

import pytest
from analyzer import (
    validate_version,
    validate_declaration,
    validate_brackets,
    validate_assignments,
    validate_ternary_operators,
    comprehensive_check,
    _strip_comments
)

# --- Test Fixtures ---

@pytest.fixture
def sample_code_lines():
    """Provides a sample of stripped code lines for testing."""
    code = """
    //@version=5
    indicator("My Script", overlay=true)
    a = 1
    b := a + 1
    (c) = 5 // Invalid assignment
    d = b > 0 ? b : 0
    """
    return _strip_comments(code)

# --- Granular Unit Tests for Each Validation Function ---

class TestValidateVersion:
    def test_valid_version(self):
        code = "//@version=5\nindicator('Test', overlay=true)"
        is_valid, err = validate_version(code, _strip_comments(code))
        assert is_valid is True

    def test_missing_version(self):
        code = "indicator('Test', overlay=true)"
        is_valid, err = validate_version(code, _strip_comments(code))
        assert is_valid is False
        assert "E002" in err


    def test_version_not_first(self):
        code = "\n//@version=5\nindicator('Test', overlay=true)"
        is_valid, err = validate_version(code, _strip_comments(code))
        assert is_valid is True # Whitespace is ok

    def test_code_before_version(self):
        code = "indicator('Test', overlay=true)\n//@version=5"
        is_valid, err = validate_version(code, _strip_comments(code))
        assert is_valid is False
        assert "E002" in err

class TestValidateDeclaration:
    def test_valid_indicator(self):
        lines = _strip_comments("indicator('Test', overlay=true)")
        is_valid, err = validate_declaration(lines)
        assert is_valid is True

    def test_missing_declaration(self):
        lines = _strip_comments("a = 1")
        is_valid, err = validate_declaration(lines)
        assert is_valid is False
        assert "E003" in err

    def test_multiple_declarations(self):
        lines = _strip_comments("indicator('a', overlay=true)\nstrategy('b')")
        is_valid, err = validate_declaration(lines)
        assert is_valid is False
        assert "E004" in err

    def test_missing_title(self):
        lines = _strip_comments("indicator(overlay=true)")
        is_valid, err = validate_declaration(lines)
        assert is_valid is False
        assert "E005" in err
        
    def test_missing_overlay_is_warning(self):
        lines = _strip_comments("indicator('My Script')")
        is_valid, msg = validate_declaration(lines)
        assert is_valid is True # Should be valid, but return a warning message
        assert "W001" in msg

class TestValidateBrackets:
    def test_balanced_brackets(self):
        is_valid, err = validate_brackets("a = (b + c[1])")
        assert is_valid is True

    def test_unclosed_bracket(self):
        is_valid, err = validate_brackets("a = (b + c[1]")
        assert is_valid is False
        assert "E203" in err

    def test_unmatched_closing_bracket(self):
        is_valid, err = validate_brackets("a = b + c)")
        assert is_valid is False
        assert "E201" in err
        
    def test_mismatched_brackets(self):
        is_valid, err = validate_brackets("a = (b + c[1})")
        assert is_valid is False
        assert "E202" in err

class TestValidateAssignments:
    def test_valid_assignment(self):
        lines = _strip_comments("myVar := close")
        errors = validate_assignments(lines)
        assert not errors

    def test_invalid_assignment_literal(self):
        lines = _strip_comments("10 := close")
        errors = validate_assignments(lines)
        assert len(errors) == 1
        assert "E301" in errors[0]["code"]

    def test_invalid_assignment_expression(self):
        lines = _strip_comments("(high - low) := myRange")
        errors = validate_assignments(lines)
        assert len(errors) == 1
        assert "E301" in errors[0]["code"]

class TestValidateTernary:
    def test_valid_ternary(self):
        lines = _strip_comments("c = a > b ? a : b")
        warnings = validate_ternary_operators(lines)
        assert not warnings

    def test_malformed_ternary(self):
        lines = _strip_comments("c = a > b ? a")
        warnings = validate_ternary_operators(lines)
        assert len(warnings) == 1
        assert "W201" in warnings[0]["code"]

class TestFunctionValidation:
    def test_valid_function_call_args(self):
        code = "//@version=5\nindicator('Test', overlay=true)\nplot(close)"
        result = comprehensive_check(code)
        assert result["is_valid"] is True

    def test_nested_function_call_is_valid(self):
        """Tests that a valid call with a nested function doesn't trigger a false positive."""
        code = "//@version=5\nindicator('Test', overlay=true)\nplot(ta.sma(close, 14))"
        result = comprehensive_check(code)
        assert result["is_valid"] is True

    def test_missing_required_argument(self):
        code = "//@version=5\nindicator('Test', overlay=true)\nplot()"
        result = comprehensive_check(code)
        assert result["is_valid"] is False, "Result should be invalid when a required argument is missing."
        assert len(result["errors"]) > 0, "Errors list should not be empty."
        assert any(e["code"] == "E103" and "plot" in e["message"] and "Expected at least 1, but got 0" in e["message"] for e in result["errors"]), "Specific error for plot() not found."

    def test_too_few_arguments_sma(self):
        code = "//@version=5\nindicator('Test', overlay=true)\nta.sma(close)"
        result = comprehensive_check(code)
        assert result["is_valid"] is False, "Result should be invalid with too few arguments."
        assert len(result["errors"]) > 0, "Errors list should not be empty."
        assert any(e["code"] == "E103" and "ta.sma" in e["message"] and "Expected at least 2, but got 1" in e["message"] for e in result["errors"]), "Specific error for ta.sma() not found."

    def test_deprecated_function_call(self):
        code = "//@version=5\nstudy('My Old Script', overlay=true)"
        result = comprehensive_check(code)
        assert result["is_valid"] is False, "Using a deprecated function should result in an invalid state."
        assert len(result["errors"]) > 0, "Errors list should contain the deprecation error."
        assert not result["warnings"], "There should be no warnings, as deprecation is now an error."
        assert any(e["code"] == "E102" and "study" in e["message"] and "indicator() or strategy()" in e["message"] for e in result["errors"]), "Specific error for deprecated study() call not found."

# --- High-Level Comprehensive Tests ---

class TestComprehensiveCheck:
    def test_full_valid_script(self):
        code = """
        //@version=5
        indicator("My Valid Script", overlay=true)
        plot(ta.sma(close, 14))
        """
        result = comprehensive_check(code)
        assert result["is_valid"] is True
        assert not result["errors"]

    def test_script_with_multiple_errors(self):
        code = """
        indicator("My Invalid Script") // Missing version, missing overlay
        a = (b + c] // Mismatched bracket
        10 := a // Invalid assignment
        """
        result = comprehensive_check(code)
        assert result["is_valid"] is False
        # The comprehensive_check is designed to fail fast on critical syntax errors like brackets.
        # So, we expect it to find the bracket error and stop, not find all subsequent errors.
        assert len(result["errors"]) == 1
        assert "E202" in result["errors"][0]["code"]
