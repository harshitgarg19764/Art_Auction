#!/usr/bin/env python3
"""
Kunsthaus Canvas Bids - Backend Server
Simple startup script for the Flask application
"""

from app import app, db

if __name__ == '__main__':
    print("Starting Kunsthaus Canvas Bids Backend...")
    print("Server will be available at: http://localhost:5000")
    print("API endpoints:")
    print("  - GET  /api/health")
    print("  - POST /api/auth/register")
    print("  - POST /api/auth/login")
    print("  - GET  /api/artworks")
    print("  - GET  /api/artists")
    print("  - GET  /api/auctions")
    print("  - GET  /api/search")
    print("  - POST /api/create-sample-data")
    print("\nPress Ctrl+C to stop the server")
    
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")
    
    app.run(debug=True, host='0.0.0.0', port=5000)