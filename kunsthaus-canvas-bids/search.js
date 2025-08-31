// Search Results Page Functionality

// Search data will be loaded from backend
let searchResults = [];
const API_BASE_URL = '/api';
            image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop",
            status: "sold",
            category: "abstract",
            description: "Raw emotion translated into bold strokes and vivid colors."
        },
        {
            id: 6,
            title: "Nature's Symphony",
            artist: "Alex Rivera",
            price: 3800,
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            status: "active",
            category: "landscape",
            description: "The harmony of nature captured in stunning detail."
        }
    ],
    artists: [
        {
            id: 1,
            name: "Sarah Mitchell",
            specialty: "Abstract Expressionism",
            works: 23,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            experience: "established",
            location: "local",
            bio: "Sarah creates vibrant abstract pieces that explore the intersection of emotion and color."
        },
        {
            id: 2,
            name: "David Chen",
            specialty: "Contemporary Urban Art",
            works: 18,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            experience: "established",
            location: "local",
            bio: "David brings street art into the gallery space, creating powerful contemporary pieces."
        },
        {
            id: 3,
            name: "Elena Rodriguez",
            specialty: "Surreal Landscapes",
            works: 31,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            experience: "master",
            location: "national",
            bio: "Elena's dreamlike landscapes transport viewers to otherworldly realms."
        },
        {
            id: 4,
            name: "Marcus Thompson",
            specialty: "Digital Art",
            works: 15,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            experience: "emerging",
            location: "local",
            bio: "Marcus pioneers new frontiers in digital art, creating immersive experiences."
        }
    ]
};

let searchResults = { artworks: [], artists: [] };
let currentQuery = '';

function showLoadingState() {
    const artworkGrid = document.getElementById('search-artwork-grid');
    const artistGrid = document.getElementById('search-artist-grid');
    
    if (artworkGrid) {
        artworkGrid.innerHTML = '<div class="loading-message">Searching artworks...</div>';
    }
    if (artistGrid) {
        artistGrid.innerHTML = '<div class="loading-message">Searching artists...</div>';
    }
}

// Initialize search page
document.addEventListener('DOMContentLoaded', function() {
    initSearchPage();
    initFilters();
    initSearch();
});

function initSearchPage() {
    // Get search query from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';
    
    if (query) {
        document.getElementById('search-input').value = query;
        document.getElementById('search-query-display').textContent = query;
        performSearch(query);
    } else {
        showNoResults();
    }
}

async function performSearch(query) {
    currentQuery = query.toLowerCase();
    
    try {
        // Show loading state
        showLoadingState();
        
        // Search backend
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const data = await response.json();
        
        // Update search results
        searchResults.artworks = data.artworks || [];
        searchResults.artists = data.artists || [];
        
        displaySearchResults();
        
    } catch (error) {
        console.error('Search error:', error);
        // Don't show sample data on error
        searchResults = { artworks: [], artists: [] };
        displaySearchResults();
    }
}

function displaySearchResults() {
    const totalResults = searchResults.artworks.length + searchResults.artists.length;
    
    // Update result counts
    document.getElementById('total-results').textContent = totalResults;
    document.getElementById('artwork-count').textContent = `(${searchResults.artworks.length})`;
    document.getElementById('artist-count').textContent = `(${searchResults.artists.length})`;
    
    if (totalResults === 0) {
        showNoResults();
        return;
    }
    
    // Hide no results message
    document.getElementById('no-results').style.display = 'none';
    
    // Display artworks
    displayArtworkResults();
    
    // Display artists
    displayArtistResults();
    
    // Show/hide sections based on results
    document.getElementById('artworks-section').style.display = 
        searchResults.artworks.length > 0 ? 'block' : 'none';
    document.getElementById('artists-section').style.display = 
        searchResults.artists.length > 0 ? 'block' : 'none';
}

function displayArtworkResults() {
    const artworkGrid = document.getElementById('search-artwork-grid');
    artworkGrid.innerHTML = '';
    
    searchResults.artworks.forEach(artwork => {
        const artworkCard = createSearchArtworkCard(artwork);
        artworkGrid.appendChild(artworkCard);
    });
}

function displayArtistResults() {
    const artistGrid = document.getElementById('search-artist-grid');
    artistGrid.innerHTML = '';
    
    searchResults.artists.forEach(artist => {
        const artistCard = createSearchArtistCard(artist);
        artistGrid.appendChild(artistCard);
    });
}

function createSearchArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'artwork-card search-result-card';
    
    const statusClass = `status-${artwork.status}`;
    const statusText = artwork.status === 'active' ? 'Available' : 
                     artwork.status === 'sold' ? 'Sold' : 'Featured';
    
    const buttonText = artwork.status === 'sold' ? 'Sold Out' : 'View Details';
    const buttonClass = artwork.status === 'sold' ? 'artwork-bid sold' : 'artwork-bid';
    
    card.innerHTML = `
        <div class="artwork-status ${statusClass}">${statusText}</div>
        <img src="${artwork.image}" alt="${artwork.title}" class="artwork-image" loading="lazy">
        <div class="artwork-info">
            <h3 class="artwork-title">${highlightSearchTerm(artwork.title, currentQuery)}</h3>
            <p class="artwork-artist">by ${highlightSearchTerm(artwork.artist, currentQuery)}</p>
            <p class="artwork-description" style="font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 1rem; line-height: 1.4;">
                ${highlightSearchTerm(artwork.description, currentQuery)}
            </p>
            <div class="artwork-price">$${artwork.price.toLocaleString()}</div>
            <button class="${buttonClass}" onclick="viewArtworkDetails(${artwork.id})">
                ${buttonText}
            </button>
        </div>
    `;
    
    return card;
}

function createSearchArtistCard(artist) {
    const card = document.createElement('div');
    card.className = 'artist-card search-result-card';
    
    card.innerHTML = `
        <img src="${artist.avatar}" alt="${artist.name}" class="artist-avatar" loading="lazy">
        <h3 class="artist-name">${highlightSearchTerm(artist.name, currentQuery)}</h3>
        <p class="artist-specialty">${highlightSearchTerm(artist.specialty, currentQuery)}</p>
        <p class="artist-bio" style="font-size: 0.875rem; color: var(--muted-foreground); margin: 1rem 0; line-height: 1.4;">
            ${highlightSearchTerm(artist.bio, currentQuery)}
        </p>
        <div class="artist-stats" style="display: flex; justify-content: space-between; margin: 1rem 0; font-size: 0.875rem;">
            <span class="artist-works">${artist.works} works</span>
            <span class="artist-location">${artist.location}</span>
        </div>
        <button class="btn btn-outline" style="width: 100%;" onclick="viewArtistProfile(${artist.id})">
            View Profile
        </button>
    `;
    
    return card;
}

function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function showNoResults() {
    document.getElementById('no-results').style.display = 'block';
    document.getElementById('artworks-section').style.display = 'none';
    document.getElementById('artists-section').style.display = 'none';
    document.getElementById('load-more-container').style.display = 'none';
    document.getElementById('total-results').textContent = '0';
}

function initFilters() {
    const resultTypeFilter = document.getElementById('result-type');
    const sortByFilter = document.getElementById('sort-by');
    
    resultTypeFilter.addEventListener('change', applyFilters);
    sortByFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const resultType = document.getElementById('result-type').value;
    const sortBy = document.getElementById('sort-by').value;
    
    // Filter by result type
    let filteredArtworks = [...searchResults.artworks];
    let filteredArtists = [...searchResults.artists];
    
    if (resultType === 'artworks') {
        filteredArtists = [];
    } else if (resultType === 'artists') {
        filteredArtworks = [];
    }
    
    // Sort results
    if (sortBy === 'price-low') {
        filteredArtworks.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filteredArtworks.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
        filteredArtworks.sort((a, b) => b.works - a.works);
        filteredArtists.sort((a, b) => b.works - a.works);
    }
    
    // Update display
    const artworkGrid = document.getElementById('search-artwork-grid');
    const artistGrid = document.getElementById('search-artist-grid');
    
    artworkGrid.innerHTML = '';
    artistGrid.innerHTML = '';
    
    filteredArtworks.forEach(artwork => {
        const card = createSearchArtworkCard(artwork);
        artworkGrid.appendChild(card);
    });
    
    filteredArtists.forEach(artist => {
        const card = createSearchArtistCard(artist);
        artistGrid.appendChild(card);
    });
    
    // Update section visibility
    document.getElementById('artworks-section').style.display = 
        filteredArtworks.length > 0 ? 'block' : 'none';
    document.getElementById('artists-section').style.display = 
        filteredArtists.length > 0 ? 'block' : 'none';
    
    // Update counts
    document.getElementById('artwork-count').textContent = `(${filteredArtworks.length})`;
    document.getElementById('artist-count').textContent = `(${filteredArtists.length})`;
    document.getElementById('total-results').textContent = filteredArtworks.length + filteredArtists.length;
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-submit');
    
    searchBtn.addEventListener('click', handleNewSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleNewSearch();
        }
    });
}

function handleNewSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (query) {
        // Update URL
        const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
        window.history.pushState({}, '', newUrl);
        
        // Update display
        document.getElementById('search-query-display').textContent = query;
        
        // Perform search
        performSearch(query);
    }
}

function viewArtworkDetails(artworkId) {
    // Redirect to gallery page with artwork highlighted
    window.location.href = `gallery.html?highlight=${artworkId}`;
}

function viewArtistProfile(artistId) {
    // Redirect to artists page with artist highlighted
    window.location.href = `artists.html?highlight=${artistId}`;
}