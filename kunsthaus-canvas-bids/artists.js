// Artists Page Functionality

// Extended artist data
const allArtists = [
    {
        id: 1,
        name: "Sarah Mitchell",
        specialty: "Abstract Expressionism",
        works: 23,
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKvP_SORTpH1aYSJc9r0Lbi_QbMpoUyo0bZA&s",
        experience: "established",
        location: "local",
        bio: "Sarah creates vibrant abstract pieces that explore the intersection of emotion and color. Her work has been featured in galleries across the region.",
        yearsActive: 8,
        featured: true
    },
    {
        id: 2,
        name: "David Chen",
        specialty: "Contemporary Urban Art",
        works: 18,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        experience: "established",
        location: "local",
        bio: "David brings street art into the gallery space, creating powerful contemporary pieces that speak to urban life and social issues.",
        yearsActive: 12,
        featured: false
    },
    {
        id: 3,
        name: "Elena Rodriguez",
        specialty: "Surreal Landscapes",
        works: 31,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        experience: "master",
        location: "national",
        bio: "Elena's dreamlike landscapes transport viewers to otherworldly realms, blending reality with imagination in stunning detail.",
        yearsActive: 18,
        featured: true
    },
    {
        id: 4,
        name: "Marcus Thompson",
        specialty: "Digital Art",
        works: 15,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        experience: "emerging",
        location: "local",
        bio: "Marcus pioneers new frontiers in digital art, creating immersive experiences that challenge traditional boundaries of artistic expression.",
        yearsActive: 4,
        featured: false
    },
    {
        id: 5,
        name: "Luna Santos",
        specialty: "Abstract Expressionism",
        works: 27,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        experience: "established",
        location: "national",
        bio: "Luna's abstract works are deeply personal explorations of memory, trauma, and healing, rendered in bold colors and dynamic compositions.",
        yearsActive: 10,
        featured: true
    },
    {
        id: 6,
        name: "Alex Rivera",
        specialty: "Nature Photography",
        works: 42,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        experience: "master",
        location: "international",
        bio: "Alex captures the raw beauty of nature through his lens, creating photographs that celebrate the natural world's incredible diversity.",
        yearsActive: 22,
        featured: false
    },
    {
        id: 7,
        name: "Isabella Chen",
        specialty: "Portrait Art",
        works: 19,
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
        experience: "established",
        location: "local",
        bio: "Isabella specializes in capturing the essence of her subjects, creating portraits that reveal the inner life and character of each person.",
        yearsActive: 9,
        featured: true
    },
    {
        id: 8,
        name: "Robert Kim",
        specialty: "Geometric Abstract",
        works: 33,
        avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
        experience: "master",
        location: "national",
        bio: "Robert explores the relationship between mathematics and art, creating precise geometric compositions that are both analytical and beautiful.",
        yearsActive: 16,
        featured: false
    },
    {
        id: 9,
        name: "Maria Gonzalez",
        specialty: "Contemporary Mixed Media",
        works: 25,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        experience: "established",
        location: "local",
        bio: "Maria combines traditional and modern techniques, creating mixed media pieces that challenge conventional artistic boundaries.",
        yearsActive: 11,
        featured: true
    },
    {
        id: 10,
        name: "Thomas Anderson",
        specialty: "Sculpture",
        works: 14,
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        experience: "established",
        location: "international",
        bio: "Thomas creates contemporary sculptures that explore themes of human connection and isolation in the modern world.",
        yearsActive: 13,
        featured: false
    },
    {
        id: 11,
        name: "Zoe Park",
        specialty: "Digital Illustration",
        works: 38,
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        experience: "emerging",
        location: "local",
        bio: "Zoe brings characters and stories to life through her digital illustrations, creating whimsical worlds that captivate viewers of all ages.",
        yearsActive: 3,
        featured: true
    },
    {
        id: 12,
        name: "James Wilson",
        specialty: "Landscape Painting",
        works: 29,
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
        experience: "master",
        location: "national",
        bio: "James captures the majesty of natural landscapes with traditional painting techniques, creating works that celebrate the beauty of the outdoors.",
        yearsActive: 20,
        featured: false
    }
];

let artistsData = [];
let filteredArtists = [];
let displayedCount = 8;
const API_BASE_URL = '/api';

// Initialize artists page
document.addEventListener('DOMContentLoaded', function() {
    loadArtistsFromBackend();
    initFilters();
    initSearch();
    initLoadMore();
});

// Make this function globally accessible for refreshing
window.loadArtistsFromBackend = loadArtistsFromBackend;

async function loadArtistsFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/artists`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load artists');
        }
        
        const data = await response.json();
        
        // Transform backend data to artists format
        artistsData = data.artists.map(artist => ({
            id: artist.id,
            name: artist.name,
            bio: artist.bio || 'Passionate artist creating beautiful works.',
            specialty: artist.specialty || 'Contemporary Art',
            works: artist.works || 0,
            avatar: artist.image || 'https://images.unsplash.com/photo-1494790108755-2616c9c0e8e0?w=300&h=300&fit=crop',
            featured: artist.featured || false,
            experience: 'established',
            location: 'local',
            yearsActive: 5
        }));
        
        // Don't use sample data - only show real artists
        if (artistsData.length === 0) {
            console.log('No artists found in database');
        }
        
        filteredArtists = [...artistsData];
        initArtistsGrid();
        
    } catch (error) {
        console.error('Error loading artists:', error);
        // Don't show sample data on error
        artistsData = [];
        filteredArtists = [];
        displayArtists();
    }
}

function initArtistsGrid() {
    displayArtists(filteredArtists.slice(0, displayedCount));
    updateResultsCount();
}

function displayArtists(artists) {
    const artistsGrid = document.getElementById('artists-grid');
    artistsGrid.innerHTML = '';
    
    artists.forEach(artist => {
        const artistCard = createEnhancedArtistCard(artist);
        artistsGrid.appendChild(artistCard);
    });
}

function createEnhancedArtistCard(artist) {
    const card = document.createElement('div');
    card.className = 'artist-card';
    
    const experienceLabel = artist.experience === 'emerging' ? 'Emerging Artist' :
                           artist.experience === 'established' ? 'Established Artist' : 'Master Artist';
    
    const featuredBadge = artist.featured ? '<div class="artist-featured">Featured</div>' : '';
    
    card.innerHTML = `
        ${featuredBadge}
        <img src="${artist.avatar}" alt="${artist.name}" class="artist-avatar" loading="lazy">
        <h3 class="artist-name">${artist.name}</h3>
        <p class="artist-specialty">${artist.specialty}</p>
        <p class="artist-bio" style="font-size: 0.875rem; color: var(--muted-foreground); margin: 1rem 0; line-height: 1.4;">
            ${artist.bio}
        </p>
        <div class="artist-stats" style="display: flex; justify-content: space-between; margin: 1rem 0; font-size: 0.875rem;">
            <span class="artist-works">${artist.works} works</span>
            <span class="artist-experience">${artist.yearsActive} years</span>
        </div>
        <div class="artist-experience-badge" style="display: inline-block; padding: 0.25rem 0.75rem; background-color: var(--muted); color: var(--muted-foreground); border-radius: 1rem; font-size: 0.75rem; font-weight: 500;">
            ${experienceLabel}
        </div>
        <button class="btn btn-outline" style="width: 100%; margin-top: 1rem;" onclick="viewArtistProfile(${artist.id})">
            View Profile
        </button>
    `;
    
    return card;
}

function initFilters() {
    const specialtyFilter = document.getElementById('specialty-filter');
    const experienceFilter = document.getElementById('experience-filter');
    const locationFilter = document.getElementById('location-filter');
    
    [specialtyFilter, experienceFilter, locationFilter].forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const specialty = document.getElementById('specialty-filter').value;
    const experience = document.getElementById('experience-filter').value;
    const location = document.getElementById('location-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    filteredArtists = allArtists.filter(artist => {
        // Specialty filter
        if (specialty !== 'all') {
            const specialtyMap = {
                'abstract': 'Abstract',
                'contemporary': 'Contemporary',
                'landscape': 'Landscape',
                'portrait': 'Portrait',
                'digital': 'Digital',
                'sculpture': 'Sculpture'
            };
            if (!artist.specialty.toLowerCase().includes(specialtyMap[specialty]?.toLowerCase() || specialty)) return false;
        }
        
        // Experience filter
        if (experience !== 'all' && artist.experience !== experience) return false;
        
        // Location filter
        if (location !== 'all' && artist.location !== location) return false;
        
        // Search filter
        if (searchTerm && !artist.name.toLowerCase().includes(searchTerm) && 
            !artist.specialty.toLowerCase().includes(searchTerm) &&
            !artist.bio.toLowerCase().includes(searchTerm)) return false;
        
        return true;
    });
    
    displayedCount = Math.min(8, filteredArtists.length);
    displayArtists(filteredArtists.slice(0, displayedCount));
    updateResultsCount();
    updateLoadMoreButton();
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-submit');
    
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    searchBtn.addEventListener('click', applyFilters);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

function initLoadMore() {
    const loadMoreBtn = document.getElementById('load-more');
    loadMoreBtn.addEventListener('click', function() {
        const newCount = Math.min(displayedCount + 8, filteredArtists.length);
        displayArtists(filteredArtists.slice(0, newCount));
        displayedCount = newCount;
        updateLoadMoreButton();
    });
}

function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    const showing = Math.min(displayedCount, filteredArtists.length);
    resultsCount.textContent = `Showing ${showing} of ${filteredArtists.length} artists`;
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more');
    if (displayedCount >= filteredArtists.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

function viewArtistProfile(artistId) {
    const artist = allArtists.find(a => a.id === artistId);
    if (artist) {
        showNotification(`Viewing ${artist.name}'s profile - Feature coming soon!`, 'info');
    }
}

// Utility function for debouncing search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}