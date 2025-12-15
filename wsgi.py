import os
import sys

# Add the back-end directory to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'back-end')))

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)