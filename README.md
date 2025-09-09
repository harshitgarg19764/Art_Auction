# 🎨 kunstHaus - Complete Art Auction Platform

A sophisticated, full-stack art auction platform where collectors can discover, bid on, and acquire exceptional artworks from talented artists around the world. Built with Flask backend and vanilla JavaScript frontend.

## ✨ Features

### 🔐 Authentication System
- Secure user registration and login with JWT tokens
- Role-based access control (Artists vs Collectors)
- Password hashing with `pbkdf2:sha256:600000` encryption
- Persistent login sessions with local storage
- Rate limiting and input validation

### 🎨 For Artists
- **Add Artwork**: Upload and showcase your creations with image support
- **Artist Profiles**: Manage your artistic identity and bio
- **Portfolio Management**: Track your listed artworks and pricing
- **Real-time Notifications**: Get notified when your art receives bids

### 🏛️ For Collectors
- **Gallery Browsing**: Explore artworks by category with advanced filtering
- **Live Auctions**: Participate in real-time bidding with countdown timers
- **Personal Collection**: Manage your acquired artworks and bidding history
- **Search & Discovery**: Find artworks and artists with global search

### 🔨 Auction System
- **Live Bidding**: Real-time auction participation with WebSocket-like updates
- **Bid History**: Complete bidding timeline and status tracking
- **Auto-refresh**: Live updates every 30 seconds
- **Smart Notifications**: Success/error feedback with toast notifications

### 🎯 Enhanced UI Features
- **Theme Toggle**: Light/dark mode with system preference detection
- **Responsive Design**: Mobile-first approach with CSS Grid/Flexbox
- **Interactive Elements**: Smooth scrolling, parallax effects, ripple animations
- **Live Ticker**: Rotating auction updates and platform statistics
- **Admin Panel**: Complete management interface for platform administration

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser
- Git (for development)

### Option 1: One-Click Start
```bash
# Double-click to run (Windows)
run.bat

# This will:
# - Start Flask backend on http://localhost:5000
# - Start frontend server on http://localhost:8000
# - Open both in separate browser windows
```

### Option 2: Manual Setup
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/kunsthaus-auction-platform.git
cd kunsthaus-auction-platform

# Start backend server
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py

# Start frontend (in another terminal)
cd ../kunsthaus-canvas-bids
python -m http.server 8000
```

### First Time Setup
1. Go to **Admin Panel** (http://localhost:8000/admin.html)
2. Click "Check Backend Status" to verify backend connectivity
3. Click "Create Sample Data" to populate database with test data
4. Browse gallery, artists, and auctions pages

## 📁 Project Structure

```
kunsthaus-auction-platform/
├── backend/                    # Flask Backend API
│   ├── app.py                 # Main application (911 lines)
│   ├── requirements.txt       # Python dependencies
│   ├── instance/              # Database files
│   │   └── kunsthaus.db      # SQLite database
│   └── seed.py               # Database seeding script
├── kunsthaus-canvas-bids/     # Frontend Application
│   ├── index.html            # Landing page with hero section
│   ├── gallery.html          # Artwork browsing with filters
│   ├── auctions.html         # Live bidding interface
│   ├── artists.html          # Artist profiles and portfolios
│   ├── add-artwork.html      # Artist upload portal
│   ├── my-collection.html    # Collector dashboard
│   ├── account.html          # User profile management
│   ├── admin.html            # Admin panel interface
│   ├── login.html            # Authentication pages
│   ├── signup.html           # User registration
│   ├── about.html            # Platform information
│   ├── search.html           # Global search interface
│   ├── styles.css            # Design system (7729 lines)
│   └── js/                   # JavaScript modules
│       ├── auth-system.js    # Authentication management
│       ├── ui-enhancements.js # Theme toggle & UI interactions
│       ├── enhanced-navbar.js # Navigation functionality
│       ├── gallery.js        # Gallery functionality
│       ├── auctions-enhanced.js # Auction system
│       ├── add-artwork.js    # Artwork upload
│       └── script.js         # Main application logic
├── TESTING_GUIDE.md          # Comprehensive testing documentation
└── run.bat                   # Quick start script
```

## 🗄️ Database Schema

### Current Database Statistics
- **Total Users**: 4 (2 Artists, 2 Collectors)
- **Total Artworks**: 3 pieces
- **Artist Profiles**: 2 active profiles
- **Total Portfolio Value**: $15,288.00
- **Database Health**: ✅ Excellent (no orphaned records)

### Table Structure

#### USER Table
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

#### ARTIST Table
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

#### ARTWORK Table
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

### Database Relationships
```
USER (1) ←→ (0..1) ARTIST
  ↓
  (1) ←→ (0..*) ARTWORK ←→ (0..1) ARTIST
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with role selection
- `POST /api/auth/login` - User login with JWT token generation
- `GET /api/auth/profile` - Get authenticated user profile

### Artworks
- `GET /api/artworks` - List artworks (pagination, search, filtering)
- `GET /api/artworks/<id>` - Get specific artwork details
- `POST /api/artworks` - Add new artwork (Artists only)
- `GET /api/artworks?category=abstract` - Filter by category
- `GET /api/artworks?search=sunset` - Search artworks

### Artists
- `GET /api/artists` - List artists (pagination, search)
- `GET /api/artists/<id>` - Get specific artist profile
- `PUT /api/artists/profile` - Update artist profile
- `GET /api/artists?search=sarah` - Search artists

### Auctions
- `GET /api/auctions` - List live auctions with status
- `GET /api/auctions/<id>` - Get specific auction details
- `POST /api/auctions` - Create auction (Artists only)
- `POST /api/auctions/<id>/bid` - Place bid on auction
- `POST /api/bids` - Place a bid (legacy endpoint)

### Search & Utilities
- `GET /api/search?q=<query>` - Global search across artworks and artists
- `POST /api/upload` - Upload images for artworks and profiles
- `GET /api/health` - API health check
- `GET /api/stats` - Platform statistics and analytics
- `POST /api/create-sample-data` - Create sample data for testing

## 💡 Usage Guide

### For Artists
1. **Register** as an artist account with profile information
2. **Login** and complete your artist profile
3. **Add Artwork** via the artist portal with images and descriptions
4. **Monitor** bids and auction activity on your creations
5. **Manage** your portfolio and pricing strategy

### For Collectors
1. **Register** as a collector account
2. **Browse** the gallery with category and price filters
3. **Participate** in live auctions with real-time bidding
4. **Manage** your collection and bidding history
5. **Discover** new artists and follow their work

### Sample Test Accounts
```
Artist Account:
- Email: sarah@example.com / artist@gmail.com
- Password: password123
- Type: Artist with portfolio

Collector Account:
- Email: collector@example.com / harshitgarg19764@gmail.com
- Password: password123
- Type: Collector with bidding history

Admin Account:
- Email: admin@kunsthaus.com
- Password: admin123
- Type: Admin (if implemented)
```

## 🔧 Technical Details

### Backend (Flask)
- **Framework**: Flask 2.x with SQLAlchemy ORM
- **Database**: SQLite for development, PostgreSQL ready for production
- **Authentication**: JWT tokens with 24-hour expiration
- **API**: RESTful JSON API with CORS support
- **Security**: Password hashing, input validation, SQL injection protection
- **File Upload**: Secure image upload with validation

### Frontend (Vanilla JavaScript)
- **Styling**: Custom CSS design system with CSS variables
- **Icons**: Lucide icons for consistent iconography
- **Fonts**: Inter & Playfair Display from Google Fonts
- **State Management**: Local storage + authentication manager
- **Theme System**: Light/dark mode with system preference detection
- **Responsive**: Mobile-first design with CSS Grid/Flexbox

### Enhanced Features
- **Real-time Updates**: Auto-refresh mechanisms for live data
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Error Handling**: Comprehensive error feedback and recovery
- **Performance**: Optimized loading and caching strategies
- **Accessibility**: ARIA labels and keyboard navigation support

## 🧪 Testing & Quality Assurance

### Testing Guide
The platform includes a comprehensive testing guide covering:
- **Authentication Flow**: Registration, login, logout, session management
- **Artwork Management**: Upload, display, search, filtering
- **Auction System**: Bidding, real-time updates, status tracking
- **User Experience**: Theme toggle, responsive design, error handling

### Known Issues & Solutions
1. **Popup Not Showing After Adding Artwork**
   - Check browser console for JavaScript errors
   - Verify `showEnhancedSuccessNotification` function exists
   - Ensure user is logged in as artist

2. **Artwork Not Appearing in Auctions**
   - Refresh auctions page manually
   - Check artwork status in database
   - Verify API endpoint responses

### Debug Commands
```bash
# Database inspection
python simple_db_viewer.py
python show_database.py

# API health check
curl http://localhost:5000/api/health

# Create test data
curl -X POST http://localhost:5000/api/create-sample-data
```

## 🚀 Deployment Options

### Local Development
```bash
# Quick start
run.bat

# Manual start
cd backend && python app.py
cd kunsthaus-canvas-bids && python -m http.server 8000
```

### Production Deployment

#### Environment Variables
Create `.env` file in backend directory:
```env
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///kunsthaus.db
FLASK_ENV=production
```

#### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["5000:5000"]
    volumes: ["./backend/kunsthaus.db:/app/kunsthaus.db"]
  
  frontend:
    build: ./kunsthaus-canvas-bids
    ports: ["80:80"]
    depends_on: [backend]
```

#### Cloud Platforms
- **Heroku**: Ready for deployment with Procfile
- **Railway**: Connect GitHub repository for auto-deployment
- **Vercel/Netlify**: Frontend deployment with API proxy
- **DigitalOcean**: App Platform deployment

### Production Configuration
1. **Update API URLs** in frontend JavaScript files
2. **Configure CORS** for production domains
3. **Use PostgreSQL** instead of SQLite for scalability
4. **Enable HTTPS** with SSL certificates
5. **Set up monitoring** and logging

## 🔒 Security Features

### Current Security Status: ✅ EXCELLENT
- **Password Security**: Werkzeug password hashing
- **Authentication**: JWT tokens with expiration
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: SQLAlchemy ORM parameterized queries
- **CORS Configuration**: Proper cross-origin request handling
- **File Upload Security**: Image validation and secure storage

### Security Recommendations
1. **Regular Backups**: Daily database backups recommended
2. **Monitor Activity**: Track unusual user behavior
3. **Rate Limiting**: Implement API rate limiting
4. **HTTPS**: Use SSL certificates in production
5. **Environment Variables**: Keep secrets in environment files

## 📊 Database Management

### Backup & Restore
```bash
# Create backup
cp backend/instance/kunsthaus.db backup/kunsthaus_$(date +%Y%m%d).db

# Restore backup
cp backup/kunsthaus_backup_20250829.db backend/instance/kunsthaus.db
```

### Common Queries
```sql
-- Find most expensive artwork
SELECT title, price FROM artwork ORDER BY price DESC LIMIT 1;

-- Count artworks by category
SELECT category, COUNT(*) FROM artwork GROUP BY category;

-- User activity summary
SELECT u.username, u.is_artist, COUNT(aw.id) as artwork_count
FROM user u LEFT JOIN artwork aw ON u.id = aw.user_id
GROUP BY u.id;
```

### Database Growth Analysis
- **User Registration**: Steady growth with balanced artist/collector ratio
- **Artwork Uploads**: Active artist participation
- **Categories**: Currently focused on abstract art (opportunity for diversification)
- **Price Range**: $1,200 - $12,789 (good variety for collectors)

## 🔍 Troubleshooting

### Common Issues
1. **Port 5000 in use**: `netstat -ano | findstr :5000` and kill process
2. **Database locked**: Restart application to release locks
3. **CORS errors**: Check Flask-CORS configuration
4. **File upload issues**: Verify file permissions and disk space
5. **Authentication errors**: Check JWT token validity and expiration

### Debug Mode
```bash
# Enable debug mode (development only)
export FLASK_DEBUG=1
python backend/app.py
```

### Performance Monitoring
- Monitor `/api/health` endpoint for uptime
- Track database query performance
- Monitor memory usage and response times
- Set up alerts for error rates

## 📈 Scaling & Future Development

### Database Scaling
- **PostgreSQL Migration**: Better performance and concurrent connections
- **Connection Pooling**: Implement database connection pooling
- **Indexing**: Add indexes for frequently queried fields
- **Caching**: Implement Redis for session and data caching

### Application Scaling
- **Load Balancing**: Multiple backend instances with load balancer
- **CDN Integration**: Content delivery network for static assets
- **Microservices**: Split into authentication, artwork, and auction services
- **WebSocket Integration**: Real-time bidding with WebSocket connections

### Feature Roadmap
1. **Enhanced Bidding**: WebSocket-based real-time bidding
2. **Payment Integration**: Stripe/PayPal payment processing
3. **Advanced Search**: Elasticsearch integration
4. **Mobile App**: React Native or Flutter mobile application
5. **Analytics Dashboard**: Comprehensive platform analytics
6. **Social Features**: User following, artwork favorites, comments

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Test across multiple browsers and devices

## 📞 Support & Documentation

### Quick Reference
- **Database Location**: `backend/instance/kunsthaus.db`
- **Frontend URL**: `http://localhost:8000`
- **Backend API**: `http://localhost:5000/api`
- **Admin Panel**: `http://localhost:8000/admin.html`

### Additional Resources
- **API Documentation**: Available at `/api/health` endpoint
- **Testing Guide**: Comprehensive testing scenarios and debug commands
- **Deployment Guide**: Step-by-step deployment instructions
- **Database Schema**: Complete table structure and relationships

## 📄 License

This project is open source and available under the MIT License.

---

**kunstHaus** - Where Art Meets Technology 🎨✨

*A sophisticated platform connecting artists and collectors through the power of technology and beautiful design.*