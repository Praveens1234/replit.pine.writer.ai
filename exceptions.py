"""
The Pine Forge v4.0 - Custom Exceptions
File: exceptions.py
Description: Defines custom exceptions for the application.
"""

class PineForgeException(Exception):
    """Base exception for all application-specific errors."""
    pass

class APIException(PineForgeException):
    """Custom exception for API related errors."""
    pass

class ValidationException(PineForgeException):
    """Custom exception for code validation errors."""
    pass
