# This script serves as an entrypoint for starting the Django server when working with Node.js apps

import os
import sys
import subprocess
from pathlib import Path

# Configure environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_manager.settings')

# Create media and static directories if they don't exist
Base_DIR = Path(__file__).resolve().parent
STATIC_DIR = Base_DIR / 'static'
MEDIA_DIR = Base_DIR / 'media'

STATIC_DIR.mkdir(exist_ok=True)
MEDIA_DIR.mkdir(exist_ok=True)

# Run migrations first
print("Applying database migrations...")
try:
    subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)
    subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
    subprocess.run([sys.executable, 'manage.py', 'collectstatic', '--noinput'], check=True)
    print("Migrations applied successfully!")
except subprocess.CalledProcessError as e:
    print(f"Error applying migrations: {e}")
    sys.exit(1)

# Run Django development server
port = int(os.environ.get('PORT', 8000))
host = os.environ.get('HOST', '0.0.0.0')

print(f"Starting Django server on {host}:{port}...")
try:
    subprocess.run([sys.executable, 'manage.py', 'runserver', f"{host}:{port}"])
except KeyboardInterrupt:
    print("\nServer stopped.")
except Exception as e:
    print(f"Error starting server: {e}")
    sys.exit(1)
