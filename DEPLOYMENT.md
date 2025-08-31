# Deployment Guide - Kunsthaus Canvas Bids

This guide explains how to deploy the Kunsthaus Canvas Bids application to various platforms.

## 🚀 Quick Local Development

### Windows
```bash
# Clone the repository
git clone <repository-url>
cd kunsthaus-canvas-bids

# Run the application
run.bat
```

### Linux/Mac
```bash
# Clone the repository
git clone <repository-url>
cd kunsthaus-canvas-bids

# Install Python dependencies
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start backend
python app.py &

# Start frontend (in another terminal)
cd ../kunsthaus-canvas-bids
python3 -m http.server 8000
```

## 🌐 Production Deployment

### Option 1: Traditional VPS/Server

#### Backend (Flask API)
```bash
# Install dependencies
pip install -r backend/requirements.txt
pip install gunicorn

# Run with Gunicorn
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Frontend (Static Files)
```bash
# Serve with Nginx
sudo apt install nginx

# Copy files to web directory
sudo cp -r kunsthaus-canvas-bids/* /var/www/html/

# Update API URLs in JavaScript files to point to your domain
# Edit: gallery.js, artists.js, auctions-enhanced.js, search.js, auth.js
# Change: http://localhost:5000/api to https://yourdomain.com/api
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Docker Deployment

#### Dockerfile for Backend
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

#### Dockerfile for Frontend
```dockerfile
FROM nginx:alpine

COPY kunsthaus-canvas-bids/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: 
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend/kunsthaus.db:/app/kunsthaus.db
    
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Backend deployment
cd backend
echo "web: gunicorn app:app" > Procfile
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name-backend
git push heroku main

# Frontend deployment (separate app)
cd ../kunsthaus-canvas-bids
# Update API URLs to point to Heroku backend
echo "web: python -m http.server $PORT" > Procfile
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name-frontend
git push heroku main
```

#### Vercel (Frontend only)
```bash
cd kunsthaus-canvas-bids
npm init -y
echo '{"builds": [{"src": "*.html", "use": "@vercel/static"}]}' > vercel.json
vercel --prod
```

#### Railway
```bash
# Deploy backend
railway login
railway new
railway add
railway deploy

# Update frontend API URLs and deploy to Netlify/Vercel
```

## 🔧 Configuration for Production

### Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///kunsthaus.db
FLASK_ENV=production
```

### Update Frontend API URLs
Before deploying, update these files to point to your production backend:

1. `kunsthaus-canvas-bids/auth.js`
2. `kunsthaus-canvas-bids/gallery.js`
3. `kunsthaus-canvas-bids/artists.js`
4. `kunsthaus-canvas-bids/auctions-enhanced.js`
5. `kunsthaus-canvas-bids/search.js`
6. `kunsthaus-canvas-bids/admin.html`

Change:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

To:
```javascript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

### Database Migration
For production, consider using PostgreSQL instead of SQLite:

```python
# In backend/app.py, change:
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kunsthaus.db'

# To:
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///kunsthaus.db')
```

## 🔒 Security Considerations

### Backend Security
- Change default secret keys
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Use environment variables for sensitive data

### Frontend Security
- Implement Content Security Policy (CSP)
- Use HTTPS for all requests
- Validate user inputs
- Sanitize displayed data

## 📊 Monitoring & Maintenance

### Health Checks
- Monitor `/api/health` endpoint
- Set up alerts for downtime
- Monitor database performance

### Backup Strategy
```bash
# Backup SQLite database
cp backend/kunsthaus.db backup/kunsthaus_$(date +%Y%m%d).db

# Backup uploaded files
tar -czf backup/uploads_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Log Management
```python
# Add to backend/app.py
import logging
logging.basicConfig(level=logging.INFO)
```

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure Flask-CORS is properly configured
2. **Database Locked**: Restart the application
3. **File Upload Issues**: Check file permissions and disk space
4. **API Timeouts**: Increase server timeout settings

### Debug Mode
```bash
# Enable debug mode (development only)
export FLASK_DEBUG=1
python backend/app.py
```

## 📈 Scaling

### Database Scaling
- Move to PostgreSQL for better performance
- Implement database connection pooling
- Add database indexes for frequently queried fields

### Application Scaling
- Use load balancers for multiple backend instances
- Implement Redis for session storage
- Add CDN for static assets

### Monitoring
- Use tools like Prometheus + Grafana
- Implement application performance monitoring (APM)
- Set up log aggregation with ELK stack