import os
import sys
import logging
from app import create_app

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('run')

# Log python information
logger.info(f"Python version: {sys.version}")
logger.info(f"Python path: {sys.path}")
logger.info(f"Current directory: {os.getcwd()}")
logger.info(f"Environment variables: {os.environ}")

try:
    app = create_app()
    logger.info("App created successfully")
except Exception as e:
    logger.error(f"Error creating app: {str(e)}", exc_info=True)
    raise

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
