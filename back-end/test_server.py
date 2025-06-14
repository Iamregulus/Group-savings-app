#!/usr/bin/env python3
"""
Simple test script to verify the backend server is working
"""

import requests
import json
import sys

def test_backend(base_url):
    """Test basic backend functionality"""
    print(f"Testing backend at: {base_url}")
    
    # Test health endpoint
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ Health check passed")
        else:
            print("   ❌ Health check failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
        return False
    
    # Test CORS preflight
    try:
        print("2. Testing CORS preflight...")
        response = requests.options(
            f"{base_url}/api/echo",
            headers={
                'Origin': 'https://group-savings-app-mu.vercel.app',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers: {dict(response.headers)}")
        
        if response.status_code in [200, 204]:
            print("   ✅ CORS preflight passed")
        else:
            print("   ❌ CORS preflight failed")
            
    except Exception as e:
        print(f"   ❌ CORS preflight error: {e}")
    
    # Test echo endpoint
    try:
        print("3. Testing echo endpoint...")
        response = requests.post(
            f"{base_url}/api/echo",
            json={"test": "data"},
            headers={
                'Origin': 'https://group-savings-app-mu.vercel.app',
                'Content-Type': 'application/json'
            },
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ Echo endpoint passed")
        else:
            print("   ❌ Echo endpoint failed")
            
    except Exception as e:
        print(f"   ❌ Echo endpoint error: {e}")
    
    return True

if __name__ == "__main__":
    # Test production backend
    production_url = "https://group-savings-app-production.up.railway.app"
    
    print("=" * 50)
    print("Backend Connectivity Test")
    print("=" * 50)
    
    if test_backend(production_url):
        print("\n✅ Backend tests completed")
    else:
        print("\n❌ Backend tests failed")
        sys.exit(1) 