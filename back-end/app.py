import os
import logging
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

def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Configure the app
    if test_config is None:
        # Load the config from environment variables
        app.config.from_mapping(
            SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
            SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URI', 'sqlite:///group_savings.db'),
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
    
    # Configure CORS based on environment
    if flask_env == 'development' or railway_env == 'development':
        # Development: Allow all origins for easier testing
        logger.info("Development mode: Enabling permissive CORS")
        CORS(app, supports_credentials=True)
    else:
        # Production: Restrict to only the production frontend
        allowed_origins = [
            "https://group-savings-app-mu.vercel.app",
        ]
        logger.info(f"Production mode: Restricting CORS to origins: {allowed_origins}")
        CORS(app, 
             resources={r"/*": {"origins": allowed_origins}}, 
             supports_credentials=True)
    
    # Handle direct browser access and health checks in production
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        user_agent = request.headers.get('User-Agent', '')
        
        # Allow direct browser access and Railway health checks
        if not origin or 'RailwayHealthCheck' in user_agent:
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return response
    
    # Log CORS-related information
    @app.before_request
    def log_request_info():
        logger.info(f"Request: {request.method} {request.path}")
        logger.info(f"Origin: {request.headers.get('Origin', 'None')}")
        logger.info(f"User-Agent: {request.headers.get('User-Agent', 'None')}")
        logger.info(f"Headers: {dict(request.headers)}")
    
    # Log response headers
    @app.after_request
    def log_response_info(response):
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
                "environment": os.environ.get('FLASK_ENV', 'production'),
                "railway_environment": os.environ.get('RAILWAY_ENVIRONMENT', 'production')
            })
        except Exception as e:
            logger.error(f"Error in health check: {str(e)}")
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500
    
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

    @app.route('/')
    def index():
        return {"message": "Welcome to Group Savings API"}

    return app