"""
Vercel Serverless Function Entry Point for Flask App
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Flask app
from app import app

# Vercel Python runtime expects the app to be exported
# The app will be automatically handled by Vercel
