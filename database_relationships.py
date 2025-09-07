#!/usr/bin/env python3
"""
Database Relationships Explorer
Shows how your database tables are connected
"""

import sqlite3
import os
from datetime import datetime

def show_relationships():
    """Show database relationships and connections"""
    db_path = os.path.join('backend', 'instance', 'kunsthaus.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🔗 KUNSTHAUS DATABASE RELATIONSHIPS")
    print("=" * 80)
    
    # Show User -> Artist relationship
    print("\n👥 USER → ARTIST RELATIONSHIP:")
    print("-" * 50)
    cursor.execute("""
        SELECT u.id, u.username, u.is_artist,
               CASE WHEN a.id IS NOT NULL THEN 'Has Profile' ELSE 'No Profile' END as profile_status,
               a.name as artist_name
        FROM user u
        LEFT JOIN artist a ON u.id = a.user_id
        ORDER BY u.id
    """)
    user_artists = cursor.fetchall()
    
    for ua in user_artists:
        status = "🎨 Artist" if ua[2] else "👤 Collector"
        profile = ua[3]
        artist_name = ua[4] or "N/A"
        print(f"User {ua[0]} ({ua[1]}) - {status} - Profile: {profile} - Artist Name: {artist_name}")
    
    # Show User -> Artwork relationship
    print("\n👥 USER → ARTWORK RELATIONSHIP:")
    print("-" * 50)
    cursor.execute("""
        SELECT u.id, u.username, COUNT(aw.id) as artwork_count,
               GROUP_CONCAT(aw.title, ', ') as artworks
        FROM user u
        LEFT JOIN artwork aw ON u.id = aw.user_id
        GROUP BY u.id, u.username
        ORDER BY u.id
    """)
    user_artworks = cursor.fetchall()
    
    for ua in user_artworks:
        artworks = ua[3] if ua[3] else "No artworks"
        print(f"User {ua[0]} ({ua[1]}) - {ua[2]} artworks: {artworks}")
    
    # Show Artist -> Artwork relationship
    print("\n🎨 ARTIST → ARTWORK RELATIONSHIP:")
    print("-" * 50)
    cursor.execute("""
        SELECT a.id, a.name, COUNT(aw.id) as artwork_count,
               GROUP_CONCAT(aw.title, ', ') as artworks
        FROM artist a
        LEFT JOIN artwork aw ON a.id = aw.artist_id
        GROUP BY a.id, a.name
        ORDER BY a.id
    """)
    artist_artworks = cursor.fetchall()
    
    for aa in artist_artworks:
        artworks = aa[3] if aa[3] else "No artworks"
        print(f"Artist {aa[0]} ({aa[1]}) - {aa[2]} artworks: {artworks}")
    
    # Show complete user journey
    print("\n🚀 COMPLETE USER JOURNEYS:")
    print("-" * 60)
    cursor.execute("""
        SELECT u.id, u.username, u.email, u.is_artist,
               a.name as artist_name, a.bio,
               COUNT(aw.id) as artwork_count,
               SUM(aw.price) as total_value
        FROM user u
        LEFT JOIN artist a ON u.id = a.user_id
        LEFT JOIN artwork aw ON u.id = aw.user_id
        GROUP BY u.id
        ORDER BY u.id
    """)
    journeys = cursor.fetchall()
    
    for journey in journeys:
        print(f"\n👤 User Journey #{journey[0]}:")
        print(f"   Username: {journey[1]}")
        print(f"   Email: {journey[2]}")
        print(f"   Account Type: {'Artist' if journey[3] else 'Collector'}")
        
        if journey[3]:  # If artist
            print(f"   Artist Name: {journey[4] or 'Not set'}")
            print(f"   Bio: {(journey[5][:50] + '...') if journey[5] and len(journey[5]) > 50 else (journey[5] or 'No bio')}")
            print(f"   Artworks Created: {journey[6]}")
            if journey[7]:
                print(f"   Portfolio Value: ${journey[7]:,.2f}")
        else:
            print(f"   Role: Art Collector")
            print(f"   Can bid on artworks and build collections")
    
    # Show orphaned records
    print("\n🔍 DATA INTEGRITY CHECK:")
    print("-" * 40)
    
    # Artists without users (shouldn't happen)
    cursor.execute("""
        SELECT a.id, a.name FROM artist a
        LEFT JOIN user u ON a.user_id = u.id
        WHERE u.id IS NULL
    """)
    orphaned_artists = cursor.fetchall()
    
    if orphaned_artists:
        print("⚠️  Orphaned Artists (no user account):")
        for artist in orphaned_artists:
            print(f"   Artist {artist[0]}: {artist[1]}")
    else:
        print("✅ All artists have valid user accounts")
    
    # Artworks without users (shouldn't happen)
    cursor.execute("""
        SELECT aw.id, aw.title FROM artwork aw
        LEFT JOIN user u ON aw.user_id = u.id
        WHERE u.id IS NULL
    """)
    orphaned_artworks = cursor.fetchall()
    
    if orphaned_artworks:
        print("⚠️  Orphaned Artworks (no user account):")
        for artwork in orphaned_artworks:
            print(f"   Artwork {artwork[0]}: {artwork[1]}")
    else:
        print("✅ All artworks have valid user accounts")
    
    # Artists marked as artists but no artist profile
    cursor.execute("""
        SELECT u.id, u.username FROM user u
        LEFT JOIN artist a ON u.id = a.user_id
        WHERE u.is_artist = 1 AND a.id IS NULL
    """)
    missing_profiles = cursor.fetchall()
    
    if missing_profiles:
        print("⚠️  Artists without profiles:")
        for user in missing_profiles:
            print(f"   User {user[0]}: {user[1]} (marked as artist but no profile)")
    else:
        print("✅ All artist users have artist profiles")
    
    conn.close()

def show_database_schema_visual():
    """Show a visual representation of the database schema"""
    print("\n" + "=" * 80)
    print("🏗️  DATABASE SCHEMA VISUALIZATION")
    print("=" * 80)
    
    schema = """
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │      USER       │       │     ARTIST      │       │    ARTWORK      │
    ├─────────────────┤       ├─────────────────┤       ├─────────────────┤
    │ id (PK)         │◄─────►│ id (PK)         │       │ id (PK)         │
    │ username        │       │ user_id (FK)    │       │ title           │
    │ email           │       │ name            │       │ description     │
    │ password_hash   │       │ bio             │       │ category        │
    │ is_artist       │       │ specialty       │       │ price           │
    │ created_at      │       │ profile_image   │       │ image_url       │
    └─────────────────┘       │ featured        │       │ user_id (FK)    │◄──┐
            │                 │ created_at      │       │ artist_id (FK)  │◄──┼──┐
            │                 └─────────────────┘       │ created_at      │   │  │
            │                                           └─────────────────┘   │  │
            └───────────────────────────────────────────────────────────────┘  │
                                                                               │
                                                                               │
    Relationships:                                                             │
    • USER (1) ←→ (0..1) ARTIST     (One user can have one artist profile)   │
    • USER (1) ←→ (0..*) ARTWORK    (One user can create many artworks)      │
    • ARTIST (1) ←→ (0..*) ARTWORK  (One artist can have many artworks) ◄────┘
    
    Key Points:
    • Every ARTIST must have a USER account (user_id FK)
    • Every ARTWORK must have a USER owner (user_id FK)
    • ARTWORK can optionally link to ARTIST profile (artist_id FK)
    • Users can be either Artists (is_artist=1) or Collectors (is_artist=0)
    """
    
    print(schema)

if __name__ == "__main__":
    show_relationships()
    show_database_schema_visual()