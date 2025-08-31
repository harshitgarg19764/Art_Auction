#!/usr/bin/env python3
"""
Test script for Kunsthaus Canvas Bids Full Stack Application
This script tests the backend API endpoints to ensure everything is working.
"""

import requests
import json
import time
import sys

API_BASE_URL = 'http://localhost:5000/api'

def test_health_check():
    """Test if the backend is running"""
    try:
        response = requests.get(f'{API_BASE_URL}/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy - Status: {data['status']}")
            return True
        else:
            print(f"❌ Health check failed - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False

def test_create_sample_data():
    """Test creating sample data"""
    try:
        response = requests.post(f'{API_BASE_URL}/create-sample-data', timeout=10)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Sample data created - Users: {data.get('users_created', 0)}, Artworks: {data.get('artworks_created', 0)}")
            return True
        else:
            print(f"❌ Sample data creation failed - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Sample data creation error: {e}")
        return False

def test_get_artworks():
    """Test getting artworks"""
    try:
        response = requests.get(f'{API_BASE_URL}/artworks', timeout=5)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get('artworks', []))
            print(f"✅ Artworks endpoint working - Found {count} artworks")
            return True
        else:
            print(f"❌ Artworks endpoint failed - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Artworks endpoint error: {e}")
        return False

def test_get_artists():
    """Test getting artists"""
    try:
        response = requests.get(f'{API_BASE_URL}/artists', timeout=5)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get('artists', []))
            print(f"✅ Artists endpoint working - Found {count} artists")
            return True
        else:
            print(f"❌ Artists endpoint failed - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Artists endpoint error: {e}")
        return False

def test_get_auctions():
    """Test getting auctions"""
    try:
        response = requests.get(f'{API_BASE_URL}/auctions', timeout=5)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get('auctions', []))
            print(f"✅ Auctions endpoint working - Found {count} auctions")
            return True
        else:
            print(f"❌ Auctions endpoint failed - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Auctions endpoint error: {e}")
        return False

def test_search():
    """Test search functionality"""
    try:
        response = requests.get(f'{API_BASE_URL}/search?q=art', timeout=5)
        if response.status_code == 200:
            data = response.json()
            artwork_count = len(data.get('artworks', []))
            artist_count = len(data.get('artists', []))
            print(f"✅ Search endpoint working - Found {artwork_count} artworks, {artist_count} artists")
            return True
        else:
            print(f"❌ Search endpoint failed - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Search endpoint error: {e}")
        return False

def test_stats():
    """Test statistics endpoint"""
    try:
        response = requests.get(f'{API_BASE_URL}/stats', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stats endpoint working - Users: {data.get('total_users', 0)}, Artworks: {data.get('total_artworks', 0)}")
            return True
        else:
            print(f"❌ Stats endpoint failed - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Stats endpoint error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Kunsthaus Canvas Bids Backend API")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Create Sample Data", test_create_sample_data),
        ("Get Artworks", test_get_artworks),
        ("Get Artists", test_get_artists),
        ("Get Auctions", test_get_auctions),
        ("Search", test_search),
        ("Statistics", test_stats)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_func():
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The backend is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the backend server and try again.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {e}")
        sys.exit(1)