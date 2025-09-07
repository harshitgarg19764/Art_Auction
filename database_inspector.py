#!/usr/bin/env python3
"""
Database Inspector for kunstHaus Auction Platform
This script helps you explore your SQLite database structure and data.
"""

import sqlite3
import os
from datetime import datetime
from tabulate import tabulate

def connect_to_database():
    """Connect to the SQLite database"""
    db_path = os.path.join('backend', 'instance', 'kunsthaus.db')
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        print("Make sure you've run the backend server at least once to create the database.")
        return None
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # This allows us to access columns by name
        print(f"✅ Connected to database: {db_path}")
        return conn
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return None

def show_database_info(conn):
    """Show general database information"""
    print("\n" + "="*60)
    print("📊 DATABASE OVERVIEW")
    print("="*60)
    
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print(f"📁 Database Tables: {len(tables)}")
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"   • {table_name}: {count} records")

def show_table_structure(conn, table_name):
    """Show the structure of a specific table"""
    print(f"\n🏗️  TABLE STRUCTURE: {table_name.upper()}")
    print("-" * 50)
    
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    headers = ["Column", "Type", "Not Null", "Default", "Primary Key"]
    table_data = []
    
    for col in columns:
        table_data.append([
            col[1],  # name
            col[2],  # type
            "YES" if col[3] else "NO",  # not null
            col[4] if col[4] else "NULL",  # default
            "YES" if col[5] else "NO"   # primary key
        ])
    
    print(tabulate(table_data, headers=headers, tablefmt="grid"))

def show_users_table(conn):
    """Show all users in the database"""
    print(f"\n👥 USERS TABLE")
    print("-" * 50)
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, email, is_artist, created_at 
        FROM user 
        ORDER BY id
    """)
    users = cursor.fetchall()
    
    if not users:
        print("No users found in the database.")
        return
    
    headers = ["ID", "Username", "Email", "Is Artist", "Created At"]
    table_data = []
    
    for user in users:
        created_at = datetime.fromisoformat(user[4]).strftime("%Y-%m-%d %H:%M")
        table_data.append([
            user[0],  # id
            user[1],  # username
            user[2],  # email
            "✅ Artist" if user[3] else "👤 Collector",  # is_artist
            created_at  # created_at
        ])
    
    print(tabulate(table_data, headers=headers, tablefmt="grid"))

def show_artists_table(conn):
    """Show all artists in the database"""
    print(f"\n🎨 ARTISTS TABLE")
    print("-" * 50)
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.id, a.name, a.bio, a.specialty, u.username, a.created_at
        FROM artist a
        JOIN user u ON a.user_id = u.id
        ORDER BY a.id
    """)
    artists = cursor.fetchall()
    
    if not artists:
        print("No artists found in the database.")
        return
    
    headers = ["ID", "Artist Name", "Bio", "Specialty", "Username", "Created At"]
    table_data = []
    
    for artist in artists:
        created_at = datetime.fromisoformat(artist[5]).strftime("%Y-%m-%d %H:%M")
        bio = (artist[2][:30] + "...") if artist[2] and len(artist[2]) > 30 else (artist[2] or "No bio")
        table_data.append([
            artist[0],  # id
            artist[1],  # name
            bio,        # bio (truncated)
            artist[3] or "Not specified",  # specialty
            artist[4],  # username
            created_at  # created_at
        ])
    
    print(tabulate(table_data, headers=headers, tablefmt="grid"))

def show_artworks_table(conn):
    """Show all artworks in the database"""
    print(f"\n🖼️  ARTWORKS TABLE")
    print("-" * 50)
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT aw.id, aw.title, aw.category, aw.price, a.name as artist_name, aw.created_at
        FROM artwork aw
        LEFT JOIN artist a ON aw.artist_id = a.id
        ORDER BY aw.id
    """)
    artworks = cursor.fetchall()
    
    if not artworks:
        print("No artworks found in the database.")
        return
    
    headers = ["ID", "Title", "Category", "Price ($)", "Artist", "Created At"]
    table_data = []
    
    for artwork in artworks:
        created_at = datetime.fromisoformat(artwork[5]).strftime("%Y-%m-%d %H:%M")
        table_data.append([
            artwork[0],  # id
            artwork[1],  # title
            artwork[2] or "Uncategorized",  # category
            f"${artwork[3]:,.2f}" if artwork[3] else "N/A",  # price
            artwork[4] or "Unknown Artist",  # artist_name
            created_at  # created_at
        ])
    
    print(tabulate(table_data, headers=headers, tablefmt="grid"))

def show_detailed_user_info(conn, user_id):
    """Show detailed information about a specific user"""
    print(f"\n🔍 DETAILED USER INFO: ID {user_id}")
    print("-" * 50)
    
    cursor = conn.cursor()
    
    # Get user info
    cursor.execute("SELECT * FROM user WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        print(f"User with ID {user_id} not found.")
        return
    
    print(f"👤 Username: {user['username']}")
    print(f"📧 Email: {user['email']}")
    print(f"🎨 Account Type: {'Artist' if user['is_artist'] else 'Collector'}")
    print(f"📅 Created: {datetime.fromisoformat(user['created_at']).strftime('%Y-%m-%d %H:%M:%S')}")
    
    # If artist, show artist profile
    if user['is_artist']:
        cursor.execute("SELECT * FROM artist WHERE user_id = ?", (user_id,))
        artist = cursor.fetchone()
        if artist:
            print(f"\n🎨 Artist Profile:")
            print(f"   Name: {artist['name']}")
            print(f"   Bio: {artist['bio'] or 'No bio provided'}")
            print(f"   Specialty: {artist['specialty'] or 'Not specified'}")
    
    # Show user's artworks
    cursor.execute("SELECT * FROM artwork WHERE user_id = ?", (user_id,))
    artworks = cursor.fetchall()
    
    if artworks:
        print(f"\n🖼️  User's Artworks ({len(artworks)}):")
        for artwork in artworks:
            print(f"   • {artwork['title']} - ${artwork['price']:,.2f} ({artwork['category']})")
    else:
        print(f"\n🖼️  No artworks found for this user.")

def interactive_menu():
    """Interactive menu for database exploration"""
    conn = connect_to_database()
    if not conn:
        return
    
    while True:
        print("\n" + "="*60)
        print("🗄️  KUNSTHAUS DATABASE INSPECTOR")
        print("="*60)
        print("1. 📊 Database Overview")
        print("2. 👥 View All Users")
        print("3. 🎨 View All Artists")
        print("4. 🖼️  View All Artworks")
        print("5. 🏗️  Show Table Structure")
        print("6. 🔍 View Specific User Details")
        print("7. 📤 Export Data to CSV")
        print("0. 🚪 Exit")
        print("-" * 60)
        
        choice = input("Enter your choice (0-7): ").strip()
        
        try:
            if choice == "0":
                print("👋 Goodbye!")
                break
            elif choice == "1":
                show_database_info(conn)
            elif choice == "2":
                show_users_table(conn)
            elif choice == "3":
                show_artists_table(conn)
            elif choice == "4":
                show_artworks_table(conn)
            elif choice == "5":
                table_name = input("Enter table name (user/artist/artwork): ").strip().lower()
                if table_name in ['user', 'artist', 'artwork']:
                    show_table_structure(conn, table_name)
                else:
                    print("❌ Invalid table name. Use: user, artist, or artwork")
            elif choice == "6":
                try:
                    user_id = int(input("Enter user ID: ").strip())
                    show_detailed_user_info(conn, user_id)
                except ValueError:
                    print("❌ Please enter a valid user ID (number)")
            elif choice == "7":
                export_to_csv(conn)
            else:
                print("❌ Invalid choice. Please try again.")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        input("\nPress Enter to continue...")
    
    conn.close()

def export_to_csv(conn):
    """Export database tables to CSV files"""
    import csv
    
    print("\n📤 EXPORTING DATA TO CSV")
    print("-" * 30)
    
    cursor = conn.cursor()
    
    # Export users
    cursor.execute("SELECT * FROM user")
    users = cursor.fetchall()
    
    with open('users_export.csv', 'w', newline='', encoding='utf-8') as f:
        if users:
            writer = csv.writer(f)
            writer.writerow([description[0] for description in cursor.description])
            writer.writerows(users)
    
    # Export artists
    cursor.execute("SELECT * FROM artist")
    artists = cursor.fetchall()
    
    with open('artists_export.csv', 'w', newline='', encoding='utf-8') as f:
        if artists:
            writer = csv.writer(f)
            writer.writerow([description[0] for description in cursor.description])
            writer.writerows(artists)
    
    # Export artworks
    cursor.execute("SELECT * FROM artwork")
    artworks = cursor.fetchall()
    
    with open('artworks_export.csv', 'w', newline='', encoding='utf-8') as f:
        if artworks:
            writer = csv.writer(f)
            writer.writerow([description[0] for description in cursor.description])
            writer.writerows(artworks)
    
    print("✅ Data exported to:")
    print("   • users_export.csv")
    print("   • artists_export.csv") 
    print("   • artworks_export.csv")

if __name__ == "__main__":
    try:
        # Try to import tabulate, install if not available
        import tabulate
    except ImportError:
        print("Installing required package 'tabulate'...")
        import subprocess
        subprocess.check_call(["pip", "install", "tabulate"])
        import tabulate
    
    interactive_menu()