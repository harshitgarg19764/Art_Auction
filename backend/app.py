from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os

# Initialize Flask app
app = Flask(__name__, static_folder='../kunsthaus-canvas-bids', static_url_path='')

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kunsthaus.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_artist = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    artworks = db.relationship('Artwork', backref='owner', lazy=True)
    artist_profile = db.relationship('Artist', backref='user', uselist=False)

class Artist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    specialty = db.Column(db.String(100))
    profile_image = db.Column(db.String(200))
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Artwork(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    price = db.Column(db.Float)
    image_url = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    artist_id = db.Column(db.Integer, db.ForeignKey('artist.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            is_artist=data.get('is_artist', False)
        )
        
        db.session.add(user)
        db.session.commit()
        
        if user.is_artist:
            artist = Artist(
                user_id=user.id,
                name=data.get('artist_name', user.username),
                bio=data.get('bio', ''),
                specialty=data.get('specialty', '')
            )
            db.session.add(artist)
            db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_artist': user.is_artist
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.query.filter(
            (User.username == data['username']) | (User.email == data['username'])
        ).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_artist': user.is_artist
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Profile Routes
@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        profile_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_artist': user.is_artist,
            'created_at': user.created_at.isoformat()
        }
        
        # Add artist profile if user is an artist
        if user.is_artist and user.artist_profile:
            artist = user.artist_profile
            profile_data['artist_profile'] = {
                'id': artist.id,
                'name': artist.name,
                'bio': artist.bio,
                'specialty': artist.specialty,
                'profile_image': artist.profile_image,
                'featured': artist.featured
            }
            
            # Add artwork count
            artwork_count = Artwork.query.filter_by(artist_id=artist.id).count()
            profile_data['artist_profile']['artwork_count'] = artwork_count
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user fields
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter(User.email == data['email'], User.id != user_id).first()
            if existing_user:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        
        # Update artist profile if user is an artist
        if user.is_artist and user.artist_profile:
            artist = user.artist_profile
            if 'artist_name' in data:
                artist.name = data['artist_name']
            if 'bio' in data:
                artist.bio = data['bio']
            if 'specialty' in data:
                artist.specialty = data['specialty']
            if 'profile_image' in data:
                artist.profile_image = data['profile_image']
        
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/artworks', methods=['GET'])
@jwt_required()
def get_user_artworks():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        artworks = Artwork.query.filter_by(user_id=user_id).all()
        
        artwork_list = []
        for artwork in artworks:
            artist_name = "Unknown Artist"
            if artwork.artist_id:
                artist = Artist.query.get(artwork.artist_id)
                if artist:
                    artist_name = artist.name
            
            artwork_list.append({
                'id': artwork.id,
                'title': artwork.title,
                'description': artwork.description,
                'category': artwork.category,
                'price': artwork.price,
                'image': artwork.image_url,
                'artist': artist_name,
                'created_at': artwork.created_at.isoformat()
            })
        
        return jsonify({'artworks': artwork_list}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not check_password_hash(user.password_hash, data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Validate new password
        if len(data['new_password']) < 8:
            return jsonify({'error': 'New password must be at least 8 characters long'}), 400
        
        # Update password
        user.password_hash = generate_password_hash(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Artwork Routes
@app.route('/api/artworks', methods=['GET'])
def get_artworks():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = Artwork.query
        
        if category:
            query = query.filter(Artwork.category == category)
        
        if search:
            query = query.filter(
                (Artwork.title.contains(search)) |
                (Artwork.description.contains(search))
            )
        
        artworks = query.paginate(page=page, per_page=per_page, error_out=False)
        
        artwork_list = []
        for artwork in artworks.items:
            artist_name = "Unknown Artist"
            if artwork.artist_id:
                artist = Artist.query.get(artwork.artist_id)
                if artist:
                    artist_name = artist.name
            
            artwork_list.append({
                'id': artwork.id,
                'title': artwork.title,
                'description': artwork.description,
                'category': artwork.category,
                'price': artwork.price,
                'image': artwork.image_url,
                'artist': artist_name,
                'created_at': artwork.created_at.isoformat()
            })
        
        return jsonify({
            'artworks': artwork_list,
            'pagination': {
                'page': artworks.page,
                'pages': artworks.pages,
                'per_page': artworks.per_page,
                'total': artworks.total
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/artworks', methods=['POST'])
@jwt_required()
def create_artwork():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_artist:
            return jsonify({'error': 'Only artists can create artworks'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        if not data.get('starting_price') or data.get('starting_price') < 0:
            return jsonify({'error': 'Valid starting price is required'}), 400
        
        # Get or create artist profile
        artist = user.artist_profile
        if not artist:
            artist = Artist(
                user_id=user.id,
                name=user.username,
                bio='',
                specialty='Contemporary Art'
            )
            db.session.add(artist)
            db.session.flush()
        
        # Create artwork
        artwork = Artwork(
            title=data['title'],
            description=data.get('description', ''),
            category=data.get('category', 'contemporary'),
            price=data['starting_price'],
            image_url=data.get('image_url', ''),
            user_id=user.id,
            artist_id=artist.id
        )
        
        db.session.add(artwork)
        db.session.commit()
        
        return jsonify({
            'message': 'Artwork created successfully',
            'artwork': {
                'id': artwork.id,
                'title': artwork.title,
                'description': artwork.description,
                'category': artwork.category,
                'price': artwork.price,
                'image': artwork.image_url,
                'artist': artist.name,
                'created_at': artwork.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Artist Routes
@app.route('/api/artists', methods=['GET'])
def get_artists():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        search = request.args.get('search')
        
        query = Artist.query
        
        if search:
            query = query.filter(
                (Artist.name.contains(search)) |
                (Artist.bio.contains(search)) |
                (Artist.specialty.contains(search))
            )
        
        artists = query.paginate(page=page, per_page=per_page, error_out=False)
        
        artist_list = []
        for artist in artists.items:
            artwork_count = Artwork.query.filter_by(artist_id=artist.id).count()
            
            artist_list.append({
                'id': artist.id,
                'name': artist.name,
                'bio': artist.bio,
                'specialty': artist.specialty,
                'image': artist.profile_image,
                'works': artwork_count,
                'featured': artist.featured,
                'created_at': artist.created_at.isoformat()
            })
        
        return jsonify({
            'artists': artist_list,
            'pagination': {
                'page': artists.page,
                'pages': artists.pages,
                'per_page': artists.per_page,
                'total': artists.total
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Auction Routes (simplified)
@app.route('/api/auctions', methods=['GET'])
def get_auctions():
    try:
        # Get all artworks and convert them to auctions
        artworks = Artwork.query.all()
        
        auctions = []
        for artwork in artworks:
            # Get artist name
            artist_name = "Unknown Artist"
            if artwork.artist_id:
                artist = Artist.query.get(artwork.artist_id)
                if artist:
                    artist_name = artist.name
            
            # Convert artwork to auction format
            auction = {
                'id': artwork.id,
                'artwork': {
                    'id': artwork.id,
                    'title': artwork.title,
                    'artist': artist_name,
                    'image': artwork.image_url,
                    'category': artwork.category,
                    'description': artwork.description
                },
                'starting_bid': artwork.price,
                'current_bid': artwork.price + (artwork.id * 100),  # Simulate some bidding
                'status': 'live',  # All auctions are live for now
                'end_time': (datetime.utcnow() + timedelta(hours=24)).isoformat(),  # 24 hours from now
                'bid_count': artwork.id * 2,  # Simulate bid count
                'time_remaining': '23:59:59'
            }
            auctions.append(auction)
        
        return jsonify({
            'auctions': auctions,
            'pagination': {
                'page': 1,
                'pages': 1 if auctions else 0,
                'per_page': 12,
                'total': len(auctions)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Search Routes
@app.route('/api/search', methods=['GET'])
def search():
    try:
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify({
                'artworks': [],
                'artists': [],
                'message': 'Please provide a search query'
            }), 200
        
        # Search artworks
        artworks = Artwork.query.filter(
            (Artwork.title.contains(query)) |
            (Artwork.description.contains(query))
        ).limit(12).all()
        
        # Search artists
        artists = Artist.query.filter(
            (Artist.name.contains(query)) |
            (Artist.bio.contains(query)) |
            (Artist.specialty.contains(query))
        ).limit(12).all()
        
        # Format artwork results
        artwork_results = []
        for artwork in artworks:
            artist_name = "Unknown Artist"
            if artwork.artist_id:
                artist = Artist.query.get(artwork.artist_id)
                if artist:
                    artist_name = artist.name
            
            artwork_results.append({
                'id': artwork.id,
                'title': artwork.title,
                'description': artwork.description,
                'category': artwork.category,
                'price': artwork.price,
                'image': artwork.image_url,
                'artist': artist_name,
                'type': 'artwork'
            })
        
        # Format artist results
        artist_results = []
        for artist in artists:
            artwork_count = Artwork.query.filter_by(artist_id=artist.id).count()
            artist_results.append({
                'id': artist.id,
                'name': artist.name,
                'bio': artist.bio,
                'specialty': artist.specialty,
                'image': artist.profile_image,
                'works': artwork_count,
                'type': 'artist'
            })
        
        return jsonify({
            'query': query,
            'artworks': artwork_results,
            'artists': artist_results,
            'total_results': len(artwork_results) + len(artist_results)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Utility Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }), 200

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        stats = {
            'total_artworks': Artwork.query.count(),
            'total_artists': Artist.query.count(),
            'total_auctions': 0,
            'active_auctions': 0,
            'total_users': User.query.count(),
            'total_bids': 0
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Sample Data Creation
@app.route('/api/create-sample-data', methods=['POST'])
def create_sample_data():
    try:
        sample_users = [
            {
                'username': 'sarah_mitchell',
                'email': 'sarah@example.com',
                'password': 'password123',
                'is_artist': True,
                'artist_name': 'Sarah Mitchell',
                'bio': 'Abstract expressionist with a passion for color and emotion',
                'specialty': 'Abstract Expressionism'
            },
            {
                'username': 'david_chen',
                'email': 'david@example.com',
                'password': 'password123',
                'is_artist': True,
                'artist_name': 'David Chen',
                'bio': 'Urban contemporary artist capturing city life',
                'specialty': 'Contemporary Urban'
            },
            {
                'username': 'elena_rodriguez',
                'email': 'elena@example.com',
                'password': 'password123',
                'is_artist': True,
                'artist_name': 'Elena Rodriguez',
                'bio': 'Surreal landscape painter exploring dreams and reality',
                'specialty': 'Surreal Landscapes'
            }
        ]
        
        created_artists = []
        for user_data in sample_users:
            existing_user = User.query.filter_by(username=user_data['username']).first()
            if existing_user:
                continue
                
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=generate_password_hash(user_data['password']),
                is_artist=user_data['is_artist']
            )
            db.session.add(user)
            db.session.flush()
            
            if user.is_artist:
                artist = Artist(
                    user_id=user.id,
                    name=user_data['artist_name'],
                    bio=user_data['bio'],
                    specialty=user_data['specialty'],
                    featured=True
                )
                db.session.add(artist)
                db.session.flush()
                created_artists.append(artist)
        
        # Create sample artworks
        sample_artworks = [
            {
                'title': 'Sunset Dreams',
                'description': 'A vibrant exploration of color and emotion capturing the essence of twilight.',
                'category': 'abstract',
                'price': 3200,
                'image_url': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
            },
            {
                'title': 'Urban Poetry',
                'description': 'Street art meets fine art in this powerful urban composition.',
                'category': 'contemporary',
                'price': 1800,
                'image_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
            },
            {
                'title': 'Ocean Depths',
                'description': 'Dive into the mysterious beauty of the deep ocean.',
                'category': 'landscape',
                'price': 2750,
                'image_url': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop'
            }
        ]
        
        for i, artwork_data in enumerate(sample_artworks):
            if i < len(created_artists):
                artist = created_artists[i]
                artwork = Artwork(
                    title=artwork_data['title'],
                    description=artwork_data['description'],
                    category=artwork_data['category'],
                    price=artwork_data['price'],
                    image_url=artwork_data['image_url'],
                    user_id=artist.user_id,
                    artist_id=artist.id
                )
                db.session.add(artwork)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Sample data created successfully',
            'users_created': len([u for u in sample_users if not User.query.filter_by(username=u['username']).first()]),
            'artworks_created': len(sample_artworks)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Frontend Routes
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Serve static files (HTML, CSS, JS, images)
    if filename.endswith(('.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico')):
        return send_from_directory(app.static_folder, filename)
    # For other paths, serve index.html (SPA behavior)
    return send_from_directory(app.static_folder, 'index.html')

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    # Check if it's an API request
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Resource not found'}), 404
    # Otherwise serve the frontend
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Initialize and run
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)