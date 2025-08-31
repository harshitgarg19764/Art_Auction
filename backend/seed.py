#!/usr/bin/env python3
"""
Seed script to populate the database with sample data
"""

import os
import sys
from datetime import datetime

# Add parent directory to path for imports
if __package__ is None or __package__ == "":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if BASE_DIR not in sys.path:
        sys.path.insert(0, BASE_DIR)

from backend.app import create_app, db, Artist, Artwork, User, Bid
from werkzeug.security import generate_password_hash

def seed_database():
    app = create_app()
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # Create sample users
        print("Creating sample users...")
        users = [
            User(
                name="John Collector",
                email="john@example.com",
                password_hash=generate_password_hash("password123"),
                user_type="collector",
                bio="Art enthusiast and collector at kunstHaus"
            ),
            User(
                name="Sarah Bidder",
                email="sarah@example.com", 
                password_hash=generate_password_hash("password123"),
                user_type="both",
                bio="Artist and art collector at kunstHaus"
            ),
            User(
                name="Mike Artist",
                email="mike@example.com",
                password_hash=generate_password_hash("password123"),
                user_type="artist",
                bio="Artist and creator at kunstHaus"
            )
        ]
        
        for user in users:
            db.session.add(user)
        
        # Create sample artists
        print("Creating sample artists...")
        artists = [
            Artist(name="Sarah Mitchell", bio="Abstract expressionist with a passion for color and emotion"),
            Artist(name="David Chen", bio="Urban contemporary artist capturing city life"),
            Artist(name="Elena Rodriguez", bio="Surreal landscape painter exploring dreams and reality"),
            Artist(name="Marcus Thompson", bio="Digital artist pushing the boundaries of technology and art"),
            Artist(name="Luna Santos", bio="Abstract artist expressing emotions through bold strokes"),
            Artist(name="Alex Rivera", bio="Nature-inspired artist celebrating the beauty of the natural world")
        ]
        
        for artist in artists:
            db.session.add(artist)
        
        db.session.commit()
        
        # Create sample artworks
        print("Creating sample artworks...")
        artworks = [
            Artwork(
                title="Sunset Dreams",
                description="A vibrant abstract piece capturing the essence of a perfect sunset",
                starting_price=3200.00,
                image_url="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
                artist_id=1
            ),
            Artwork(
                title="Urban Poetry",
                description="Street art meets fine art in this contemporary masterpiece",
                starting_price=1800.00,
                image_url="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
                artist_id=2
            ),
            Artwork(
                title="Ocean Depths",
                description="Dive into the mysterious depths of the ocean through surreal imagery",
                starting_price=2750.00,
                image_url="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
                artist_id=3
            ),
            Artwork(
                title="Digital Horizons",
                description="Where technology meets art in this stunning digital creation",
                starting_price=4100.00,
                image_url="https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=300&fit=crop",
                artist_id=4
            ),
            Artwork(
                title="Abstract Emotions",
                description="Raw emotion translated into bold abstract forms and colors",
                starting_price=2200.00,
                image_url="https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop",
                artist_id=5
            ),
            Artwork(
                title="Nature's Symphony",
                description="A harmonious blend of natural elements in perfect composition",
                starting_price=3800.00,
                image_url="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
                artist_id=6
            )
        ]
        
        for artwork in artworks:
            db.session.add(artwork)
        
        db.session.commit()
        
        # Create sample bids
        print("Creating sample bids...")
        bids = [
            Bid(amount=3300.00, bidder_name="John Collector", artwork_id=1),
            Bid(amount=3400.00, bidder_name="Sarah Bidder", artwork_id=1),
            Bid(amount=1900.00, bidder_name="Mike Artist", artwork_id=2),
            Bid(amount=2800.00, bidder_name="John Collector", artwork_id=3),
        ]
        
        for bid in bids:
            db.session.add(bid)
        
        db.session.commit()
        
        print("Database seeded successfully!")
        print("\nSample login credentials:")
        print("Email: john@example.com, Password: password123")
        print("Email: sarah@example.com, Password: password123") 
        print("Email: mike@example.com, Password: password123")

if __name__ == "__main__":
    seed_database()