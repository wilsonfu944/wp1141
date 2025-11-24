"""
Vercel Serverless Function Entry Point for Flask App
This file is required for Vercel to properly deploy the Flask application.
"""
import sys
import os

# Get absolute paths
current_file = os.path.abspath(__file__)  # /path/to/api/index.py
api_dir = os.path.dirname(current_file)   # /path/to/api
project_root = os.path.dirname(api_dir)   # /path/to (project root)

# Add project root to Python path (must be first for imports to work)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Change working directory to project root
# This ensures relative imports and file paths work correctly
os.chdir(project_root)

# Import Flask app
# Vercel's Python runtime will automatically handle the Flask app
from app import app

# Export app for Vercel
# Vercel expects the app object to be available at module level
__all__ = ['app']
