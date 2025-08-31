# Kunsthaus Canvas Bids - Backend API

Flask-based REST API backend for the Kunsthaus Canvas Bids art gallery platform.

## Features

- **User Authentication**: JWT-based auth with registration and login
- **Artist Management**: Artist profiles with portfolios
- **Artwork Catalog**: Full artwork management with categories and search
- **RESTful API**: Clean, documented endpoints
- **SQLite Database**: Lightweight, file-based database
- **CORS Support**: Cross-origin requests for frontend integration

## Quick Start

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Installation & Running

1. **Automatic Setup** (Recommended):
   ```bash
   # From project root
   run.bat
   ```
   This will start both frontend and backend automatically.

2. **Manual Setup**:
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   venv\Scripts\activate.bat  # Windows
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start server
   python run.py
   ```

The API will be available at: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Artworks
- `GET /api/artworks` - List artworks (with pagination, search, filtering)
- `GET /api/artworks?category=abstract` - Filter by category
- `GET /api/artworks?search=sunset` - Search artworks

### Artists
- `GET /api/artists` - List artists (with pagination, search)
- `GET /api/artists?search=sarah` - Search artists

### Auctions
- `GET /api/auctions` - List auctions (placeholder)

### Utility
- `GET /api/health` - Health check
- `GET /api/stats` - Platform statistics
- `GET /api/search?q=term` - Global search
- `POST /api/create-sample-data` - Create sample data

## Database Schema

### Users
- `id`, `username`, `email`, `password_hash`, `is_artist`, `created_at`

### Artists
- `id`, `user_id`, `name`, `bio`, `specialty`, `profile_image`, `featured`, `created_at`

### Artworks
- `id`, `title`, `description`, `category`, `price`, `image_url`, `user_id`, `artist_id`, `created_at`

## Sample Data

The API includes a sample data endpoint that creates:
- 3 sample artists with profiles
- 3 sample artworks with images
- Proper relationships between users, artists, and artworks

Access: `POST /api/create-sample-data`

## Testing

Run the API test suite:
```bash
cd backend
python test_api.py
```

This will test all major endpoints and create sample data.

## Configuration

Key configuration options in `app.py`:
- `SECRET_KEY`: Flask secret key (change in production)
- `JWT_SECRET_KEY`: JWT signing key (change in production)
- `SQLALCHEMY_DATABASE_URI`: Database connection string
- `JWT_ACCESS_TOKEN_EXPIRES`: Token expiration time (24 hours)

## Development

### Adding New Endpoints
1. Define route in `app.py`
2. Add proper error handling
3. Update this README
4. Test with `test_api.py`

### Database Changes
1. Modify models in `app.py`
2. Delete `kunsthaus.db` to reset database
3. Restart server to recreate tables

## Security Features

- Password hashing with Werkzeug
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- SQL injection prevention via SQLAlchemy ORM

## Production Deployment

Before deploying to production:
1. Change `SECRET_KEY` and `JWT_SECRET_KEY`
2. Use a production database (PostgreSQL recommended)
3. Set `debug=False`
4. Configure proper CORS origins
5. Use a production WSGI server (gunicorn, uWSGI)

## Troubleshooting

### Common Issues

**Port 5000 already in use:**
```bash
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

**Database errors:**
```bash
# Reset database
del kunsthaus.db
python run.py  # Will recreate tables
```

**Import errors:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

## API Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error description"
}
```

### Pagination Response
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "pages": 5,
    "per_page": 12,
    "total": 60
  }
}
```