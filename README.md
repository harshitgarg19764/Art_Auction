# 🎨 kunstHaus - Canvas Bidding Platform

A modern, full-stack art auction platform where collectors can bid on artworks and artists can showcase their creations. Built with Flask backend and vanilla JavaScript frontend.

## ✨ Features

### 🔐 Authentication System
- Secure user registration and login
- JWT-based authentication
- Role-based access (Artists vs Collectors)
- Persistent login sessions

### 🎨 For Artists
- **Add Artwork**: Upload and showcase your creations
- **Artist Profiles**: Manage your artistic identity
- **Portfolio Management**: Track your listed artworks
- **Real-time Notifications**: Get notified when your art receives bids

### 🏛️ For Collectors
- **Gallery Browsing**: Explore artworks by category
- **Live Auctions**: Participate in real-time bidding
- **Personal Collection**: Manage your acquired artworks
- **Bidding History**: Track your auction activity

### 🔨 Auction System
- **Live Bidding**: Real-time auction participation
- **Bid History**: Complete bidding timeline
- **Auto-refresh**: Live updates every 30 seconds
- **Smart Notifications**: Success/error feedback

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser

### Option 1: One-Click Start
```bash
# Double-click to run
run.bat
```

### Option 2: Manual Setup
```bash
# Start backend server
cd backend
python app.py

# Open frontend
# Navigate to http://localhost:5000
```

## 📁 Project Structure

```
kunsthaus-auction/
├── backend/                    # Flask Backend
│   ├── app.py                 # Main application & API routes
│   ├── instance/              # Database files
│   └── requirements.txt       # Python dependencies
├── kunsthaus-canvas-bids/     # Frontend Application
│   ├── index.html            # Landing page
│   ├── gallery.html          # Art gallery
│   ├── auctions.html         # Live auctions
│   ├── add-artwork.html      # Artist upload portal
│   ├── my-collection.html    # Collector dashboard
│   ├── account.html          # User profile management
│   ├── auth-manager.js       # Authentication handling
│   ├── gallery.js            # Gallery functionality
│   ├── auctions-enhanced.js  # Auction system
│   └── styles.css            # Responsive styling
└── run.bat                   # Quick start script
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Artworks
- `GET /api/artworks` - List all artworks
- `POST /api/artworks` - Add new artwork (Artists only)

### Auctions
- `GET /api/auctions` - List live auctions
- `POST /api/bids` - Place a bid

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/artworks` - Get user's artworks

## 💡 Usage Guide

### For Artists
1. **Register** as an artist account
2. **Login** to your account
3. **Add Artwork** via the artist portal
4. **Monitor** bids on your creations

### For Collectors
1. **Register** as a collector account
2. **Browse** the gallery
3. **Participate** in live auctions
4. **Manage** your collection

### Sample Accounts
```
Artist Account:
- Email: sarah@example.com
- Password: password123

Collector Account:
- Email: collector@example.com  
- Password: password123
```

## 🔧 Technical Details

### Backend (Flask)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite for development
- **Authentication**: JWT tokens
- **API**: RESTful JSON API

### Frontend (Vanilla JS)
- **Styling**: Custom CSS with responsive design
- **Icons**: Lucide icons
- **Fonts**: Inter & Playfair Display
- **State Management**: Local storage + auth manager

### Features
- **Real-time Updates**: Auto-refresh mechanisms
- **Responsive Design**: Mobile-first approach
- **Error Handling**: Comprehensive error feedback
- **Security**: JWT authentication, input validation

## 🚀 Deployment

The application is ready for deployment with:
- Environment-based configuration
- Production-ready error handling
- Scalable database design
- Static file serving

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**kunstHaus** - Where Art Meets Technology 🎨✨