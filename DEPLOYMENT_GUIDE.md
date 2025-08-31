# 🚀 kunstHaus Deployment Guide

## Local Development Setup

### Prerequisites
- Python 3.7+
- Git

### Quick Start
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/kunsthaus-auction-platform.git
cd kunsthaus-auction-platform

# Start the application
run.bat  # Windows
# or
python backend/app.py  # Manual start
```

### Manual Setup
```bash
# 1. Create virtual environment (optional but recommended)
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# 2. Install dependencies
cd backend
pip install -r requirements.txt

# 3. Initialize database
python app.py init-db

# 4. Start server
python app.py
```

## Production Deployment

### Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///production.db
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=production
```

### Database Setup
```bash
# Production database initialization
python backend/app.py init-db
python backend/app.py create-sample-data  # Optional: Add sample data
```

### Web Server Configuration
For production, use a proper WSGI server like Gunicorn:

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

### Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static {
        alias /path/to/your/project/kunsthaus-canvas-bids;
    }
}
```

## Cloud Deployment Options

### 1. Heroku
```bash
# Add Procfile
echo "web: gunicorn -w 4 -b 0.0.0.0:\$PORT backend.app:app" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### 2. Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### 3. DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables

## Testing the Deployment

### Health Check
```bash
curl http://your-domain.com/api/health
```

### Sample Accounts
```
Artist Account:
- Email: sarah@example.com
- Password: password123

Collector Account:
- Email: collector@example.com
- Password: password123
```

## Monitoring & Maintenance

### Logs
```bash
# View application logs
tail -f logs/app.log

# Database backup
cp backend/instance/kunsthaus.db backup/kunsthaus_$(date +%Y%m%d).db
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Restart application
# (depends on your deployment method)
```

## Security Considerations

1. **Change default secret keys** in production
2. **Use HTTPS** for production deployment
3. **Regular database backups**
4. **Monitor for security updates**
5. **Use environment variables** for sensitive data

Your kunstHaus platform is ready for the world! 🎨✨