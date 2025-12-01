"""
Pytest configuration file.

This file adds the project root to the system path so that tests can
import the application modules correctly.
"""

import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
