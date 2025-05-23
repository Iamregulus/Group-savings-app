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

# Log important environment variables
logger.info(f"PORT: {os.environ.get('PORT', 'Not set')}")
logger.info(f"FLASK_ENV: {os.environ.get('FLASK_ENV', 'Not set')}")
logger.info(f"RAILWAY_ENVIRONMENT: {os.environ.get('RAILWAY_ENVIRONMENT', 'Not set')}")

# Force development mode for debugging
os.environ['FLASK_ENV'] = 'development'
os.environ['FLASK_DEBUG'] = '1'

try:
    app = create_app()
    logger.info("App created successfully")
    
    # Debug routes
    logger.info("Registered routes:")
    for rule in app.url_map.iter_rules():
        logger.info(f"{rule.endpoint}: {rule.methods} - {rule}")
        
except Exception as e:
    logger.error(f"Error creating app: {str(e)}", exc_info=True)
    raise

# Add a test endpoint to verify the app is running
@app.route('/debug')
def debug():
    return {
        "status": "debug",
        "message": "Debug endpoint is working",
        "python_version": sys.version,
        "environment": dict(os.environ)
    }

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
