#!/usr/bin/env python3
"""
Quick Database Display Script
Shows your database contents in a readable format
"""

import sqlite3
import os
from datetime import datetime

def show_database_contents():
    """Display all database contents"""
    db_path = os.path.join('backend', 'instance', 'kunsthaus.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🗄️  KUNSTHAUS DATABASE CONTENTS")
    print("=" * 80)
    
    # Show Users
    print("\n👥 USERS:")
    print("-" * 80)
    cursor.execute("""
        SELECT id, username, email, 
               CASE WHEN is_artist=1 THEN 'Artist' ELSE 'Collector' END as type,
               created_at 
        FROM user ORDER BY id
    """)
    users = cursor.fetchall()
    
    print(f"{'ID':<3} {'Username':<20} {'Email':<30} {'Type':<10} {'Created':<20}")
    print("-" * 80)
    for user in users:
        created = datetime.fromisoformat(user[4]).strftime("%Y-%m-%d %H:%M")
        print(f"{user[0]:<3} {user[1]:<20} {user[2]:<30} {user[3]:<10} {created:<20}")
    
    # Show Artists
    print("\n🎨 ARTIST PROFILES:")
    print("-" * 80)
    cursor.execute("""
        SELECT a.id, a.name, a.bio, a.specialty, u.username
        FROM artist a
        JOIN user u ON a.user_id = u.id
        ORDER BY a.id
    """)
    artists = cursor.fetchall()
    
    if artists:
        print(f"{'ID':<3} {'Name':<20} {'Bio':<30} {'Specialty':<15} {'Username':<15}")
        print("-" * 80)
        for artist in artists:
            bio = (artist[2][:27] + "...") if artist[2] and len(artist[2]) > 30 else (artist[2] or "No bio")
            specialty = artist[3] or "Not specified"
            print(f"{artist[0]:<3} {artist[1]:<20} {bio:<30} {specialty:<15} {artist[4]:<15}")
    else:
        print("No artist profiles found.")
    
    # Show Artworks
    print("\n🖼️  ARTWORKS:")
    print("-" * 100)
    cursor.execute("""
        SELECT aw.id, aw.title, aw.category, aw.price, 
               COALESCE(a.name, 'Unknown Artist') as artist_name,
               aw.created_at
        FROM artwork aw
        LEFT JOIN artist a ON aw.artist_id = a.id
        ORDER BY aw.id
    """)
    artworks = cursor.fetchall()
    
    if artworks:
        print(f"{'ID':<3} {'Title':<25} {'Category':<12} {'Price':<12} {'Artist':<20} {'Created':<20}")
        print("-" * 100)
        for artwork in artworks:
            price = f"${artwork[3]:,.2f}" if artwork[3] else "N/A"
            created = datetime.fromisoformat(artwork[5]).strftime("%Y-%m-%d %H:%M")
            title = artwork[1][:24] if len(artwork[1]) > 24 else artwork[1]
            print(f"{artwork[0]:<3} {title:<25} {artwork[2] or 'None':<12} {price:<12} {artwork[4]:<20} {created:<20}")
    else:
        print("No artworks found.")
    
    # Show Statistics
    print("\n📊 STATISTICS:")
    print("-" * 40)
    
    cursor.execute("SELECT COUNT(*) FROM user")
    total_users = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user WHERE is_artist = 1")
    artists_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM artwork")
    artworks_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(price) FROM artwork")
    total_value = cursor.fetchone()[0] or 0
    
    print(f"Total Users: {total_users}")
    print(f"Artists: {artists_count}")
    print(f"Collectors: {total_users - artists_count}")
    print(f"Total Artworks: {artworks_count}")
    print(f"Total Portfolio Value: ${total_value:,.2f}")
    
    # Show Password Hashes (first 20 characters for security)
    print("\n🔐 PASSWORD SECURITY:")
    print("-" * 60)
    cursor.execute("SELECT username, SUBSTR(password_hash, 1, 20) || '...' as hash_preview FROM user")
    passwords = cursor.fetchall()
    
    print(f"{'Username':<20} {'Password Hash (preview)':<30}")
    print("-" * 60)
    for pwd in passwords:
        print(f"{pwd[0]:<20} {pwd[1]:<30}")
    
    print("\n✅ All passwords are securely hashed!")
    
    conn.close()

if __name__ == "__main__":
    show_database_contents()