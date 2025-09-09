// Artists Page Functionality
let artistsData = [];
let filteredArtists = [];

const getApiBaseUrl = () => window.API_BASE_URL || '/api';

document.addEventListener('DOMContentLoaded', function () {
    loadArtists();
    initFilters();
});

// Make this function globally accessible for refreshing
window.loadArtists = loadArtists;

async function loadArtists() {
    try {
        const response = await fetch(`${getApiBaseUrl()}/artists`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load artists');
        }
        
        const data = await response.json();
        
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
        
        filteredArtists = [...artistsData];
        displayArtists();
        
    } catch (error) {
        console.error('Error loading artists:', error);
        artistsData = [];
        filteredArtists = [];
        displayArtists();
    }
}

function displayArtists(artists = filteredArtists) {
    const artistsGrid = document.getElementById('artists-grid');
    if (!artistsGrid) return;
    
    artistsGrid.innerHTML = '';
    
    if (!artists || !Array.isArray(artists) || artists.length === 0) {
        artistsGrid.innerHTML = '<div class="empty-state">No artists available</div>';
        return;
    }
    
    artists.forEach(artist => {
        const artistCard = createArtistCard(artist);
        artistsGrid.appendChild(artistCard);
    });
}

function createArtistCard(artist) {
    const card = document.createElement('div');
    card.className = 'artist-card';
    
    card.innerHTML = `
        <img src="${artist.avatar}" alt="${artist.name}" class="artist-avatar" loading="lazy">
        <h3 class="artist-name">${artist.name}</h3>
        <p class="artist-specialty">${artist.specialty}</p>
        <div class="artist-works">${artist.works} artworks</div>
    `;
    
    return card;
}

function initFilters() {
    const specialtyFilter = document.getElementById('specialty-filter');
    const experienceFilter = document.getElementById('experience-filter');
    const locationFilter = document.getElementById('location-filter');
    
    if (specialtyFilter) specialtyFilter.addEventListener('change', applyFilters);
    if (experienceFilter) experienceFilter.addEventListener('change', applyFilters);
    if (locationFilter) locationFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const specialty = document.getElementById('specialty-filter')?.value || 'all';
    const experience = document.getElementById('experience-filter')?.value || 'all';
    const location = document.getElementById('location-filter')?.value || 'all';
    
    filteredArtists = artistsData.filter(artist => {
        if (specialty !== 'all' && !artist.specialty.toLowerCase().includes(specialty.toLowerCase())) return false;
        if (experience !== 'all' && artist.experience !== experience) return false;
        if (location !== 'all' && artist.location !== location) return false;
        return true;
    });
    
    displayArtists(filteredArtists);
    updateResultsCount();
}

function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${filteredArtists.length} artists`;
    }
}