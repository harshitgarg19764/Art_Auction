#!/usr/bin/env python3
"""
Debug Add Artwork Functionality
Test the add artwork API endpoint step by step
"""

import requests
import json

def test_login():
    """Test login with an artist account"""
    print("🔐 Testing Login...")
    
    # Try to login with an artist account
    login_data = {
        "username": "harshit_garg80",  # This should be an artist
        "password": "your_password_here"  # You'll need to provide the actual password
    }
    
    try:
        response = requests.post('http://localhost:5000/api/auth/login', 
                               json=login_data,
                               headers={'Content-Type': 'application/json'})
        
        print(f"Login Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"User: {data['user']['username']}")
            print(f"Is Artist: {data['user']['is_artist']}")
            return data['access_token']
        else:
            print("❌ Login failed:")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_add_artwork(token):
    """Test adding an artwork with the token"""
    print("\n🎨 Testing Add Artwork...")
    
    artwork_data = {
        "title": "Debug Test Artwork",
        "description": "Testing artwork upload functionality",
        "starting_price": 999.99,
        "image_url": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
        "category": "contemporary"
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    try:
        response = requests.post('http://localhost:5000/api/artworks',
                               json=artwork_data,
                               headers=headers)
        
        print(f"Add Artwork Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Artwork added successfully!")
            print(f"Artwork ID: {data['artwork']['id']}")
            print(f"Title: {data['artwork']['title']}")
            print(f"Artist: {data['artwork']['artist']}")
            return True
        else:
            print("❌ Add artwork failed:")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Add artwork error: {e}")
        return False

def test_backend_health():
    """Test if backend is healthy"""
    print("🏥 Testing Backend Health...")
    
    try:
        response = requests.get('http://localhost:5000/api/health')
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is healthy!")
            print(f"Status: {data['status']}")
            print(f"Timestamp: {data['timestamp']}")
            return True
        else:
            print("❌ Backend health check failed")
            return False
            
    except Exception as e:
        print(f"❌ Backend connection error: {e}")
        return False

def test_artworks_endpoint():
    """Test the artworks GET endpoint"""
    print("\n📋 Testing Artworks Endpoint...")
    
    try:
        response = requests.get('http://localhost:5000/api/artworks')
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Artworks endpoint working!")
            print(f"Total artworks: {data['pagination']['total']}")
            
            if data['artworks']:
                print("Sample artwork:")
                artwork = data['artworks'][0]
                print(f"  - {artwork['title']} by {artwork['artist']} (${artwork['price']})")
            
            return True
        else:
            print("❌ Artworks endpoint failed")
            return False
            
    except Exception as e:
        print(f"❌ Artworks endpoint error: {e}")
        return False

def main():
    """Run all tests"""
    print("🔧 DEBUGGING ADD ARTWORK FUNCTIONALITY")
    print("=" * 50)
    
    # Test 1: Backend health
    if not test_backend_health():
        print("❌ Backend is not running or has issues")
        return
    
    # Test 2: Artworks endpoint
    if not test_artworks_endpoint():
        print("❌ Artworks endpoint has issues")
        return
    
    # Test 3: Login (you'll need to provide password)
    print("\n" + "=" * 50)
    print("🔐 LOGIN TEST")
    print("To test login, you need to provide the password for harshit_garg80")
    print("Check your database or try common passwords like:")
    print("- The password you used when creating the account")
    print("- 'password123' (if it's a test account)")
    
    password = input("Enter password for harshit_garg80 (or press Enter to skip): ").strip()
    
    if password:
        login_data = {
            "username": "harshit_garg80",
            "password": password
        }
        
        try:
            response = requests.post('http://localhost:5000/api/auth/login', 
                                   json=login_data,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Login successful!")
                token = data['access_token']
                
                # Test 4: Add artwork
                test_add_artwork(token)
            else:
                print("❌ Login failed:")
                print(response.text)
        except Exception as e:
            print(f"❌ Login error: {e}")
    else:
        print("⏭️ Skipping login test")
    
    print("\n" + "=" * 50)
    print("🔍 DEBUGGING SUGGESTIONS:")
    print("1. Make sure you're logged in as an artist account")
    print("2. Check browser console for JavaScript errors")
    print("3. Verify the auth token is being stored correctly")
    print("4. Check if CORS is properly configured")
    print("5. Ensure all form fields are filled correctly")

if __name__ == "__main__":
    main()