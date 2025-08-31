# Kunsthaus Canvas Bids - Full Stack Art Auction Platform

A sophisticated full-stack art auction platform where collectors can discover, bid on, and acquire exceptional artworks from talented artists around the world.

## 🎨 Features

### Frontend
- **Gallery**: Browse curated artworks with advanced filtering and search
- **Live Auctions**: Participate in real-time bidding with countdown timers
- **Artist Profiles**: Discover artists and their collections
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Optimized for desktop and mobile devices
- **Admin Panel**: Manage application data and settings

### Backend (Flask API)
- **RESTful API**: Complete REST API for all functionality
- **User Management**: Registration, authentication with JWT tokens
- **Artwork Management**: CRUD operations for artworks
- **Auction System**: Real-time bidding with automatic status updates
- **Search & Filtering**: Advanced search across artworks and artists
- **File Upload**: Secure image upload for artworks and profiles
- **Database**: SQLite database with SQLAlchemy ORM

## Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Custom design system with animations
- **Vanilla JavaScript** - Interactive features and functionality
- **Lucide Icons** - Beautiful, consistent iconography
- **Google Fonts** - Inter and Playfair Display typography

## Getting Started

No build process required! Simply:

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Enjoy the full kunstHaus experience

## File Structure

```
kunsthaus-canvas-bids/
├── index.html          # Main HTML file
├── styles.css          # All CSS styling and design system
├── script.js           # JavaScript functionality
├── README.md           # This file
└── .gitignore         # Git ignore rules
```

## Features Included

### Interactive Elements
- Theme toggle (light/dark mode with persistence)
- Live auction ticker with rotating updates
- Smooth scrolling navigation
- Interactive artwork bidding
- Toast notifications
- Mobile-responsive menu

### Design System
- Custom CSS variables for consistent theming
- Responsive grid layouts
- Smooth animations and transitions
- Accessibility-friendly design
- Mobile-first approach

## Browser Support

Works in all modern browsers including:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Deployment

This is a static website that can be deployed anywhere:

- **GitHub Pages** - Push to a GitHub repo and enable Pages
- **Netlify** - Drag and drop the folder to Netlify
- **Vercel** - Connect your Git repository
- **Any web server** - Upload files to your hosting provider

## License

This project is open source and available under the MIT License.

## 🚀 Quick Start

### Prerequisites
- Python 3.7+ installed
- Modern web browser

### Installation & Running

1. **Clone or download this repository**
2. **Run the application:**
   ```bash
   run.bat
   ```
   This will:
   - Start the Flask backend server on `http://localhost:5000`
   - Start the frontend server on `http://localhost:8000`
   - Open both in separate windows

3. **Access the application:**
   - **Frontend**: http://localhost:8000
   - **Admin Panel**: http://localhost:8000/admin.html
   - **Backend API**: http://localhost:5000/api

### First Time Setup

1. Go to the **Admin Panel** (http://localhost:8000/admin.html)
2. Click "Check Backend Status" to verify the backend is running
3. Click "Create Sample Data" to populate the database with test data
4. Browse the gallery, artists, and auctions pages

## 📁 Project Structure

```
kunsthaus-canvas-bids/
├── Frontend/
│   ├── index.html          # Homepage
│   ├── gallery.html        # Artwork gallery
│   ├── auctions.html       # Live auctions
│   ├── artists.html        # Artist profiles
│   ├── auth.html          # Login/Register
│   ├── admin.html         # Admin panel
│   ├── styles.css         # Main stylesheet
│   └── *.js              # JavaScript functionality
├── backend/
│   ├── app.py            # Flask application
│   ├── requirements.txt  # Python dependencies
│   ├── run_backend.bat   # Backend startup script
│   └── kunsthaus.db     # SQLite database (created automatically)
└── run.bat              # Main startup script
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Artworks
- `GET /api/artworks` - List artworks (with pagination & filters)
- `GET /api/artworks/<id>` - Get specific artwork
- `POST /api/artworks` - Create artwork (artists only)

### Artists
- `GET /api/artists` - List artists (with pagination & filters)
- `GET /api/artists/<id>` - Get specific artist
- `PUT /api/artists/profile` - Update artist profile

### Auctions
- `GET /api/auctions` - List auctions (with status filters)
- `GET /api/auctions/<id>` - Get specific auction
- `POST /api/auctions` - Create auction (artists only)
- `POST /api/auctions/<id>/bid` - Place bid

### Search & Utilities
- `GET /api/search?q=<query>` - Search artworks and artists
- `POST /api/upload` - Upload images
- `GET /api/health` - Health check
- `GET /api/stats` - Database statistics
- `POST /api/create-sample-data` - Create sample data

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** through the auth page
2. **Token Storage** in localStorage
3. **Protected Routes** require valid JWT tokens
4. **Role-based Access** (users vs artists)

## 🐛 Troubleshooting

### Backend Won't Start
- Ensure Python 3.7+ is installed
- Check if port 5000 is available
- Install dependencies: `pip install -r backend/requirements.txt`

### Frontend Can't Connect to Backend
- Verify backend is running on http://localhost:5000
- Check browser console for CORS errors
- Use the Admin Panel to test backend connectivity

### Database Issues
- Delete `backend/kunsthaus.db` to reset the database
- Restart the application to recreate tables
- Use "Create Sample Data" in Admin Panel

## 🎯 Development

### Adding New Features
1. **Backend**: Add routes in `backend/app.py`
2. **Frontend**: Update corresponding JavaScript files
3. **Database**: Modify models in `app.py` and restart

### Testing
- Use the Admin Panel for quick testing
- Check browser console for JavaScript errors
- Monitor Flask console for backend errors