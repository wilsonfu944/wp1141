"""
Vercel Serverless Function Entry Point for Flask App
This file is required for Vercel to properly deploy the Flask application.
"""
import sys
import os

# Get absolute paths
current_file = os.path.abspath(__file__)  # /path/to/hw6/api/index.py
api_dir = os.path.dirname(current_file)   # /path/to/hw6/api
hw6_dir = os.path.dirname(api_dir)        # /path/to/hw6 (project root)

# Add hw6 directory to Python path (must be first for imports to work)
if hw6_dir not in sys.path:
    sys.path.insert(0, hw6_dir)

# Change working directory to hw6 (where app.py is located)
# This ensures relative imports and file paths work correctly
os.chdir(hw6_dir)

# Import Flask app
# Vercel's Python runtime will automatically handle the Flask app
try:
    from app import app
    print(f"✅ Successfully imported Flask app from {hw6_dir}")
except ImportError as e:
    print(f"❌ Failed to import app: {e}")
    print(f"   Current directory: {os.getcwd()}")
    print(f"   Python path: {sys.path[:3]}")
    import traceback
    traceback.print_exc()
    # Create a fallback app to prevent complete failure
    from flask import Flask
    app = Flask(__name__)
    @app.route("/")
    def fallback():
        return {"error": "Failed to import main app", "details": str(e)}, 500

# Export app for Vercel
# Vercel expects the app object to be available at module level
__all__ = ['app']
