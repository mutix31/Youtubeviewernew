const YT_API_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = 'AIzaSyAzY7noObHLIYwpx1Z3pkub-1PMCTrHbHM'; // API anahtarı buraya eklendi
let nextPageToken = '';
let currentFilter = 'date';
let currentLanguage = 'tr';
let favorites = [];

const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKey');
const searchInput = document.getElementById('searchInput');
const videoGrid = document.getElementById('videoGrid');

function toggleSettings() {
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
    apiKeyInput.value = API_KEY;
}

function saveSettings() {
    alert('API anahtarı artık kod içinde sabit olarak tanımlıdır.');
    toggleSettings();
}

async function loadTrendingVideos() {
    showLoadingSpinner();
    
    try {
        const url = new URL(`${YT_API_URL}/videos`);
        url.search = new URLSearchParams({
            part: 'snippet,statistics,contentDetails',
            chart: 'mostPopular',
            regionCode: 'TR',
            relevanceLanguage: currentLanguage,
            maxResults: 24,
            key: API_KEY
        });

        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            alert('API anahtarı geçersiz veya kota aşıldı. Lütfen ayarları kontrol edin.');
            return;
        }

        let videos = data.items;
        if (currentFilter === 'views') {
            videos.sort((a, b) => b.statistics.viewCount - a.statistics.viewCount);
        } else if (currentFilter === 'duration') {
            videos.sort((a, b) => {
                const durationA = parseDuration(a.contentDetails.duration);
                const durationB = parseDuration(b.contentDetails.duration);
                return durationB - durationA;
            });
        } else {
            videos.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
        }

        nextPageToken = data.nextPageToken || '';
        renderVideos(videos);
    } catch (error) {
        console.error('API Hatası:', error);
        alert('Video yüklenirken hata oluştu');
    } finally {
        hideLoadingSpinner();
    }
}

async function searchVideos(query) {
    try {
        const searchUrl = new URL(`${YT_API_URL}/search`);
        searchUrl.search = new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 24,
            safeSearch: 'moderate',
            key: API_KEY
        });

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        const videoIds = searchData.items.map(item => item.id.videoId);
        const videosUrl = new URL(`${YT_API_URL}/videos`);
        videosUrl.search = new URLSearchParams({
            part: 'snippet,statistics,contentDetails',
            id: videoIds.join(','),
            key: API_KEY
        });

        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();
        renderVideos(videosData.items);
    } catch (error) {
        console.error('Arama Hatası:', error);
        alert('Arama sırasında hata oluştu');
    }
}

function renderVideos(videos, append = false) {
    if (!append) videoGrid.innerHTML = '';
    videoGrid.innerHTML += videos.map(video => `
        <div class="video-card">
            <img src="${video.snippet.thumbnails.medium.url}" 
                 class="thumbnail" 
                 alt="${video.snippet.title}"
                 onclick="playVideo('${video.id}')">
            <div style="padding: 1rem">
                <h4>${video.snippet.title}</h4>
                <p>${video.snippet.channelTitle}</p>
                <small>
                    ${formatNumber(video.statistics.viewCount)} görüntülenme • 
                    ${formatDuration(video.contentDetails.duration)}
                </small>
                <button onclick="addToFavorites(${JSON.stringify(video).replace(/"/g, '&quot;')})">
                    ❤️ Favorilere Ekle
                </button>
            </div>
        </div>
    `).join('');
}

function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return [
        hours > 0 ? hours.toString().padStart(2, '0') : null,
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
}

function formatNumber(num) {
    return parseInt(num).toLocaleString('tr-TR');
}

function playVideo(videoId) {
    window.location.href = `video.html?id=${videoId}`;
}

function handleSearch(event) {
    if (event.key === 'Enter') {
        searchVideos(event.target.value);
    }
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function addToFavorites(video) {
    if (!favorites.some(fav => fav.id === video.id)) {
        favorites.push(video);
        alert('Favorilere eklendi!');
    } else {
        alert('Bu video zaten favorilerinizde!');
    }
}

function toggleFavorites() {
    renderVideos(favorites);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    loadTrendingVideos();
});
