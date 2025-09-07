# 🗄️ kunstHaus Database Schema

## 📊 Current Database Statistics
- **Total Users**: 4 (2 Artists, 2 Collectors)
- **Total Artworks**: 3
- **Artist Profiles**: 2

## 🏗️ Database Tables Structure

### 👥 USER Table
The main user table storing all registered users (both artists and collectors).

```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    is_artist BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Current Users:**
| ID | Username | Email | Type | Created |
|----|----------|-------|------|---------|
| 1 | harshit_garg | harshitgarg19764@gmail.com | Collector | 2025-08-29 20:35 |
| 2 | harshit_garg30 | abcdefz@gmail.com | Collector | 2025-08-29 21:03 |
| 3 | harshit_garg80 | artist@gmail.com | Artist | 2025-08-29 21:47 |
| 4 | harshit_garg3011 | abcdefghij@gmail.com | Artist | 2025-09-01 10:22 |

### 🎨 ARTIST Table
Extended profile information for users who are artists.

```sql
CREATE TABLE artist (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    specialty VARCHAR(100),
    profile_image VARCHAR(200),
    featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
```

### 🖼️ ARTWORK Table
Stores all artworks uploaded by artists.

```sql
CREATE TABLE artwork (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    price FLOAT,
    image_url VARCHAR(200),
    user_id INTEGER NOT NULL,
    artist_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (artist_id) REFERENCES artist(id)
);
```

**Current Artworks:**
| ID | Title | Category | Price | Artist | Created |
|----|-------|----------|-------|--------|---------|
| 1 | abc | abstract | $1,299.00 | HARSHIT GARG 30 | 2025-08-29 21:57 |
| 2 | ABC | abstract | $1,200.00 | HARSHIT GARG 30 | 2025-08-29 22:00 |
| 3 | ABC | abstract | $12,789.00 | HARSHIT GARG 30 | 2025-08-29 22:03 |

## 🔗 Relationships

```
USER (1) ←→ (0..1) ARTIST
  ↓
  (1) ←→ (0..*) ARTWORK ←→ (0..1) ARTIST
```

### Relationship Details:
1. **User ↔ Artist**: One-to-One (optional)
   - A user can have at most one artist profile
   - An artist profile belongs to exactly one user

2. **User ↔ Artwork**: One-to-Many
   - A user can create multiple artworks
   - Each artwork belongs to exactly one user

3. **Artist ↔ Artwork**: One-to-Many (optional)
   - An artist can have multiple artworks
   - Each artwork can optionally be linked to an artist profile

## 🔍 How to View Your Database

### Method 1: Use the Database Viewer Scripts
```bash
# Simple viewer (no extra dependencies)
python simple_db_viewer.py

# Advanced viewer (requires tabulate package)
python database_inspector.py
```

### Method 2: Direct SQLite Commands
```bash
# Connect to database
sqlite3 backend/instance/kunsthaus.db

# View all tables
.tables

# View users
SELECT * FROM user;

# View artworks with artist names
SELECT aw.title, aw.price, a.name as artist 
FROM artwork aw 
LEFT JOIN artist a ON aw.artist_id = a.id;

# Exit
.quit
```

### Method 3: Using Python Script
```python
import sqlite3

# Connect to database
conn = sqlite3.connect('backend/instance/kunsthaus.db')
cursor = conn.cursor()

# Query users
cursor.execute("SELECT username, email, is_artist FROM user")
users = cursor.fetchall()
for user in users:
    print(f"User: {user[0]}, Email: {user[1]}, Artist: {user[2]}")

conn.close()
```

## 🔐 Authentication System

### Password Storage
- Passwords are hashed using Werkzeug's `generate_password_hash()`
- Never stored in plain text
- Uses secure hashing algorithms

### JWT Tokens
- JSON Web Tokens for session management
- Tokens contain user ID and expiration
- Used for API authentication

### User Roles
- **is_artist = True**: Can upload artworks, has artist profile
- **is_artist = False**: Can bid on artworks, manage collections

## 📈 Database Growth Patterns

Based on your current data:
- **User Registration**: Steady growth with both artists and collectors
- **Artwork Uploads**: Active artist participation
- **Categories**: Currently focused on abstract art
- **Price Range**: $1,200 - $12,789 (good variety)

## 🛠️ Database Maintenance

### Backup Commands
```bash
# Create backup
cp backend/instance/kunsthaus.db backup/kunsthaus_backup_$(date +%Y%m%d).db

# Restore backup
cp backup/kunsthaus_backup_20250829.db backend/instance/kunsthaus.db
```

### Cleanup Queries
```sql
-- Remove test users (be careful!)
DELETE FROM user WHERE username LIKE '%test%';

-- Update artwork categories
UPDATE artwork SET category = 'contemporary' WHERE category IS NULL;

-- Find users without artist profiles
SELECT u.* FROM user u 
LEFT JOIN artist a ON u.id = a.user_id 
WHERE u.is_artist = 1 AND a.id IS NULL;
```

Your database is well-structured and growing nicely! 🎨✨