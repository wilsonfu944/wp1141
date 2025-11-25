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
hw6_dir = os.path.join(project_root, 'hw6')  # /path/to/hw6

# Add both project root and hw6 directory to Python path
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if hw6_dir not in sys.path:
    sys.path.insert(0, hw6_dir)

# Change working directory to hw6 (where app.py is located)
# This ensures relative imports and file paths work correctly
if os.path.exists(hw6_dir):
    os.chdir(hw6_dir)
else:
    os.chdir(project_root)

# Import Flask app
# Vercel's Python runtime will automatically handle the Flask app
try:
    # Try importing from hw6 directory first
    try:
        from hw6.app import app
        print(f"✅ Successfully imported Flask app from hw6.app")
    except ImportError:
        # Fallback to direct import
        from app import app
        print(f"✅ Successfully imported Flask app from app")
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
