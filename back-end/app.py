import os
import logging
import sys
from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('group_savings_app')

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

def _get_database_uri():
    """Return the database URI, normalizing Render/Heroku style postgres URLs."""
    uri = os.environ.get('DATABASE_URI') or os.environ.get('DATABASE_URL')
    if uri and uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)
    return uri or 'sqlite:///group_savings.db'


def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Configure the app
    if test_config is None:
        # Load the config from environment variables
        app.config.from_mapping(
            SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
            SQLALCHEMY_DATABASE_URI=_get_database_uri(),
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'dev'),
            JWT_ACCESS_TOKEN_EXPIRES=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)),
            MAIL_SERVER=os.environ.get('MAIL_SERVER'),
            MAIL_PORT=int(os.environ.get('MAIL_PORT', 587)),
            MAIL_USE_TLS=os.environ.get('MAIL_USE_TLS', 'True').lower() in ('true', '1', 't'),
            MAIL_USERNAME=os.environ.get('MAIL_USERNAME'),
            MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD'),
            MAIL_DEFAULT_SENDER=os.environ.get('MAIL_DEFAULT_SENDER')
        )
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    
    # Get the current environment
    flask_env = os.environ.get('FLASK_ENV', 'production').lower()
    railway_env = os.environ.get('RAILWAY_ENVIRONMENT', 'production').lower()
    
    # Log the environment for debugging
    logger.info(f"Flask Environment: {flask_env}")
    logger.info(f"Railway Environment: {railway_env}")
    
    # Configure CORS for allowed origins (env override supported)
    allowed_origins = os.environ.get('ALLOWED_ORIGINS')
    if allowed_origins:
        allowed_origins = [origin.strip() for origin in allowed_origins.split(',') if origin.strip()]
    else:
        allowed_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://group-savings-app-mu.vercel.app",
            "https://group-savings-app.vercel.app",
            "https://group-savings-app.onrender.com"
        ]
    
    # Include Render service URL automatically if available (useful for quick tests)
    render_external_url = os.environ.get('RENDER_EXTERNAL_URL')
    if render_external_url:
        allowed_origins.append(render_external_url.rstrip('/'))

    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"],
        expose_headers=["Content-Type", "Authorization"],
        max_age=3600
    )
    logger.info(f"Configured CORS for origins: {allowed_origins}")
    
    # Log CORS-related information
    @app.before_request
    def log_request_info():
        logger.info(f"Request: {request.method} {request.path}")
        logger.info(f"Origin: {request.headers.get('Origin', 'None')}")
        logger.info(f"Headers: {dict(request.headers)}")
        
    # Log response headers for debugging
    @app.after_request
    def log_response_headers(response):
        # Only log in development to avoid spam
        if flask_env == 'development':
            logger.info("=== RESPONSE HEADERS ===")
            for header, value in response.headers:
                logger.info(f"{header}: {value}")
        
        return response

    # Health check endpoint
    @app.route('/health')
    def health_check():
        try:
            origin = request.headers.get('Origin', 'Unknown')
            logger.info(f"Health check from origin: {origin}")
            return jsonify({
                "status": "healthy",
                "version": "1.0.0", 
                "origin": origin,
                "environment": os.environ.get('FLASK_ENV', 'production')
            })
        except Exception as e:
            logger.error(f"Error in health check: {str(e)}")
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500
    
    # Debug endpoint to verify app is running
    @app.route('/debug')
    def debug():
        logger.info("Debug endpoint accessed")
        return jsonify({
            "status": "debug",
            "message": "Debug endpoint is working",
            "python_version": sys.version,
            "port": os.environ.get('PORT', 'Not set'),
            "flask_env": os.environ.get('FLASK_ENV', 'Not set'),
            "railway_env": os.environ.get('RAILWAY_ENVIRONMENT', 'Not set')
        })
    
    # Root endpoint
    @app.route('/')
    def index():
        logger.info("Root endpoint accessed")
        return jsonify({
            "message": "Welcome to Group Savings API",
            "status": "running"
        })

    # Echo endpoint for testing
    @app.route('/api/echo', methods=['POST'])
    def echo():
        try:
            origin = request.headers.get('Origin', 'Unknown')
            logger.info(f"Echo request from origin: {origin}")
            data = request.get_json(silent=True) or {}
            response_data = {
                "echoed_data": data,
                "origin": origin,
                "headers": dict(request.headers),
                "method": request.method
            }
            return jsonify(response_data)
        except Exception as e:
            logger.error(f"Error in echo endpoint: {str(e)}")
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500

    # Register blueprints
    from api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from api.groups import groups_bp
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    
    from api.users import users_bp
    app.register_blueprint(users_bp, url_prefix='/api/users')
    
    from api.transactions import transactions_bp
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    
    from api.notifications import notifications_bp
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    from api.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    return app