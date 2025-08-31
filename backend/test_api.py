#!/usr/bin/env python3
"""
Simple API test script for Kunsthaus Canvas Bids Backend
"""

import requests
import json

BASE_URL = 'http://localhost:5000'

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f'{BASE_URL}/api/health')
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_register():
    """Test user registration"""
    try:
        user_data = {
            "username": "test_user",
            "email": "test@example.com",
            "password": "TestPassword123!",
            "is_artist": True,
            "artist_name": "Test Artist",
            "bio": "Test artist bio",
            "specialty": "Digital Art"
        }
        
        response = requests.post(f'{BASE_URL}/api/auth/register', json=user_data)
        print(f"Registration: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 201
    except Exception as e:
        print(f"Registration failed: {e}")
        return False

def test_login():
    """Test user login"""
    try:
        login_data = {
            "username": "test_user",
            "password": "TestPassword123!"
        }
        
        response = requests.post(f'{BASE_URL}/api/auth/login', json=login_data)
        print(f"Login: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")
        
        if response.status_code == 200:
            return result.get('access_token')
        return None
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def test_artworks():
    """Test artworks endpoint"""
    try:
        response = requests.get(f'{BASE_URL}/api/artworks')
        print(f"Artworks: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Artworks test failed: {e}")
        return False

def test_sample_data():
    """Test sample data creation"""
    try:
        response = requests.post(f'{BASE_URL}/api/create-sample-data')
        print(f"Sample Data: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 201
    except Exception as e:
        print(f"Sample data creation failed: {e}")
        return False

def main():
    print("=" * 50)
    print("Kunsthaus Canvas Bids - API Test Suite")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing Health Endpoint...")
    if not test_health():
        print("❌ Backend server is not running!")
        print("Please start the backend server first:")
        print("cd backend && python run.py")
        return
    
    print("✅ Backend server is running!")
    
    # Test sample data creation
    print("\n2. Creating Sample Data...")
    test_sample_data()
    
    # Test registration
    print("\n3. Testing User Registration...")
    test_register()
    
    # Test login
    print("\n4. Testing User Login...")
    token = test_login()
    if token:
        print("✅ Login successful!")
    
    # Test artworks
    print("\n5. Testing Artworks Endpoint...")
    test_artworks()
    
    print("\n" + "=" * 50)
    print("API Test Complete!")
    print("You can now test the frontend at: http://localhost:8000")
    print("=" * 50)

if __name__ == '__main__':
    main()