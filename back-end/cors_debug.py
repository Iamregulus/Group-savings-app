#!/usr/bin/env python3
"""
CORS Debugging Utility for Group Savings App
This script creates a simple debugging endpoint that logs CORS request details.
"""

import os
import logging
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('cors_debug')

# Create app
app = Flask(__name__)

# Define allowed origins
allowed_origins = [
    "https://group-savings-app-mu.vercel.app",
    "https://group-savings-app.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

# Enable CORS with specific configuration
CORS(app, 
     resources={r"/*": {"origins": allowed_origins}}, 
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"],
     expose_headers=["Content-Type", "Authorization"],
     max_age=3600)

# Log every request with detailed information
@app.before_request
def log_request_info():
    logger.info("=== NEW REQUEST ===")
    logger.info(f"Request Method: {request.method}")
    logger.info(f"Request Path: {request.path}")
    logger.info(f"Request Headers: {dict(request.headers)}")
    logger.info(f"Origin: {request.headers.get('Origin', 'None')}")
    logger.info(f"Referer: {request.headers.get('Referer', 'None')}")
    logger.info(f"User-Agent: {request.headers.get('User-Agent', 'None')}")
    logger.info(f"Content-Type: {request.headers.get('Content-Type', 'None')}")
    if request.method == 'OPTIONS':
        logger.info(f"OPTIONS request detected - preflight")
        logger.info(f"Access-Control-Request-Method: {request.headers.get('Access-Control-Request-Method', 'None')}")
        logger.info(f"Access-Control-Request-Headers: {request.headers.get('Access-Control-Request-Headers', 'None')}")
    logger.info("=== END REQUEST INFO ===")

# Add after-request handler to log response headers
@app.after_request
def log_response_info(response):
    logger.info("=== RESPONSE HEADERS ===")
    for header, value in response.headers:
        logger.info(f"{header}: {value}")
    logger.info("=== END RESPONSE HEADERS ===")
    return response

# Define routes
@app.route('/cors-test')
def cors_test():
    """Simple endpoint to test CORS configuration"""
    origin = request.headers.get('Origin')
    logger.info(f"CORS Test for origin: {origin}")
    
    if origin and origin in allowed_origins:
        response = make_response(jsonify({
            "message": "CORS test successful",
            "origin": origin,
            "allowed": True
        }))
        return response
    else:
        response = make_response(jsonify({
            "message": "CORS test failed - origin not allowed",
            "origin": origin,
            "allowed": False,
            "allowed_origins": allowed_origins
        }))
        return response

@app.route('/')
def index():
    """Root endpoint"""
    return jsonify({
        "message": "CORS Debug Server",
        "endpoints": [
            "/cors-test",
            "/echo-headers"
        ]
    })

@app.route('/echo-headers')
def echo_headers():
    """Echo back all request headers for debugging"""
    return jsonify({
        "headers": dict(request.headers),
        "origin": request.headers.get('Origin'),
        "host": request.headers.get('Host')
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 