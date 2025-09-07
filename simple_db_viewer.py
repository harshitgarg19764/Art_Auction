#!/usr/bin/env python3
"""
Simple Database Viewer for kunstHaus
View your database tables and data without additional dependencies.
"""

import sqlite3
import os
from datetime import datetime

def connect_db():
    """Connect to the database"""
    db_path = os.path.join('backend', 'instance', 'kunsthaus.db')
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        print("Run the backend server first to create the database.")
        return None
    
    return sqlite3.connect(db_path)

def show_all_users():
    """Show all users in a simple format"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, is_artist, created_at FROM user ORDER BY id")
    users = cursor.fetchall()
    
    print("\n" + "="*80)
    print("👥 ALL USERS")
    print("="*80)
    
    if not users:
        print("No users found.")
        conn.close()
        return
    
    print(f"{'ID':<4} {'Username':<20} {'Email':<30} {'Type':<10} {'Created':<20}")
    print("-" * 80)
    
    for user in users:
        user_type = "Artist" if user[3] else "Collector"
        created = datetime.fromisoformat(user[4]).strftime("%Y-%m-%d %H:%M")
        print(f"{user[0]:<4} {user[1]:<20} {user[2]:<30} {user_type:<10} {created:<20}")
    
    conn.close()

def show_all_artworks():
    """Show all artworks"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT aw.id, aw.title, aw.category, aw.price, a.name as artist_name, aw.created_at
        FROM artwork aw
        LEFT JOIN artist a ON aw.artist_id = a.id
        ORDER BY aw.id
    """)
    artworks = cursor.fetchall()
    
    print("\n" + "="*100)
    print("🖼️  ALL ARTWORKS")
    print("="*100)
    
    if not artworks:
        print("No artworks found.")
        conn.close()
        return
    
    print(f"{'ID':<4} {'Title':<25} {'Category':<15} {'Price':<12} {'Artist':<20} {'Created':<20}")
    print("-" * 100)
    
    for artwork in artworks:
        price = f"${artwork[3]:,.2f}" if artwork[3] else "N/A"
        artist = artwork[4] or "Unknown"
        created = datetime.fromisoformat(artwork[5]).strftime("%Y-%m-%d %H:%M")
        title = artwork[1][:24] if len(artwork[1]) > 24 else artwork[1]
        category = artwork[2] or "None"
        
        print(f"{artwork[0]:<4} {title:<25} {category:<15} {price:<12} {artist:<20} {created:<20}")
    
    conn.close()

def show_database_stats():
    """Show database statistics"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print("\n" + "="*50)
    print("📊 DATABASE STATISTICS")
    print("="*50)
    
    # Count users
    cursor.execute("SELECT COUNT(*) FROM user")
    total_users = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user WHERE is_artist = 1")
    artists_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user WHERE is_artist = 0")
    collectors_count = cursor.fetchone()[0]
    
    # Count artworks
    cursor.execute("SELECT COUNT(*) FROM artwork")
    artworks_count = cursor.fetchone()[0]
    
    # Count artists with profiles
    cursor.execute("SELECT COUNT(*) FROM artist")
    artist_profiles = cursor.fetchone()[0]
    
    print(f"👥 Total Users: {total_users}")
    print(f"   🎨 Artists: {artists_count}")
    print(f"   👤 Collectors: {collectors_count}")
    print(f"🖼️  Total Artworks: {artworks_count}")
    print(f"📝 Artist Profiles: {artist_profiles}")
    
    # Show recent activity
    cursor.execute("SELECT created_at FROM user ORDER BY created_at DESC LIMIT 1")
    latest_user = cursor.fetchone()
    if latest_user:
        latest_date = datetime.fromisoformat(latest_user[0]).strftime("%Y-%m-%d %H:%M")
        print(f"📅 Latest User Registration: {latest_date}")
    
    cursor.execute("SELECT created_at FROM artwork ORDER BY created_at DESC LIMIT 1")
    latest_artwork = cursor.fetchone()
    if latest_artwork:
        latest_date = datetime.fromisoformat(latest_artwork[0]).strftime("%Y-%m-%d %H:%M")
        print(f"🎨 Latest Artwork Added: {latest_date}")
    
    conn.close()

def show_table_schema():
    """Show the database table schemas"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("🏗️  DATABASE SCHEMA")
    print("="*60)
    
    tables = ['user', 'artist', 'artwork']
    
    for table in tables:
        print(f"\n📋 {table.upper()} TABLE:")
        print("-" * 40)
        
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        
        for col in columns:
            pk = " (PRIMARY KEY)" if col[5] else ""
            not_null = " NOT NULL" if col[3] else ""
            default = f" DEFAULT {col[4]}" if col[4] else ""
            print(f"  • {col[1]:<15} {col[2]:<15}{not_null}{default}{pk}")
    
    conn.close()

def show_sample_accounts():
    """Show sample accounts that can be used for testing"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("🔑 SAMPLE ACCOUNTS FOR TESTING")
    print("="*60)
    
    # Look for sample accounts
    sample_emails = ['sarah@example.com', 'david@example.com', 'elena@example.com']
    
    for email in sample_emails:
        cursor.execute("SELECT username, email, is_artist FROM user WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if user:
            account_type = "Artist" if user[2] else "Collector"
            print(f"📧 Email: {user[1]}")
            print(f"👤 Username: {user[0]}")
            print(f"🎭 Type: {account_type}")
            print(f"🔐 Password: password123")
            print("-" * 40)
    
    conn.close()

def main():
    """Main function with simple menu"""
    while True:
        print("\n" + "="*50)
        print("🗄️  KUNSTHAUS DATABASE VIEWER")
        print("="*50)
        print("1. 📊 Database Statistics")
        print("2. 👥 View All Users")
        print("3. 🖼️  View All Artworks")
        print("4. 🏗️  Show Table Schema")
        print("5. 🔑 Show Sample Accounts")
        print("0. 🚪 Exit")
        print("-" * 50)
        
        choice = input("Enter your choice (0-5): ").strip()
        
        if choice == "0":
            print("👋 Goodbye!")
            break
        elif choice == "1":
            show_database_stats()
        elif choice == "2":
            show_all_users()
        elif choice == "3":
            show_all_artworks()
        elif choice == "4":
            show_table_schema()
        elif choice == "5":
            show_sample_accounts()
        else:
            print("❌ Invalid choice. Please try again.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()