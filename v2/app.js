const YT_API_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = 'AIzaSyAzY7noObHLIYwpx1Z3pkub-1PMCTrHbHM';
let nextPageToken = '';
let currentFilter = 'date'; // Varsayılan filtre
let currentLanguage = 'tr'; // Varsayılan dil
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Favorileri localStorage'dan al
let watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || [];
let isFetching = false;

const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKey');
const searchInput = document.getElementById('searchInput');
const videoGrid = document.getElementById('videoGrid');
const languageSelect = document.getElementById('language');
const filterSelect = document.getElementById('filter');

// Ayarlar Modalını Aç/Kapat
function toggleSettings() {
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
}

// Dil Seçeneğini Uygula
function applyLanguage() {
    currentLanguage = languageSelect.value;
    loadTrendingVideos();
}

// Filtre Seçeneğini Uygula
function applyFilter() {
    currentFilter = filterSelect.value;
    loadTrendingVideos();
}

// Ayarları Kaydet
function saveSettings() {
    toggleSettings();
    loadTrendingVideos();
}

// Trend Videoları Yükle
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

// Videoları Ekranda Göster
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

// Süreyi Formatla
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

// Sayıyı Formatla
function formatNumber(num) {
    return parseInt(num).toLocaleString('tr-TR');
}

// Videoyu Oynat
function playVideo(videoId) {
    watchHistory.unshift({ id: videoId, timestamp: new Date().toISOString() });
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
    window.location.href = `video.html?id=${videoId}`;
}

// İzleme Geçmişini Göster
function showWatchHistory() {
    const history = watchHistory.map(item => `
        <div class="video-card" onclick="playVideo('${item.id}')">
            <div style="padding: 1rem">
                <h4>İzlenen Video ID: ${item.id}</h4>
                <small>${new Date(item.timestamp).toLocaleString('tr-TR')}</small>
            </div>
        </div>
    `).join('');
    videoGrid.innerHTML = `<h3>İzleme Geçmişi</h3>${history}`;
}

// Arama İşlevi
function handleSearch(event) {
    if (event.key === 'Enter') {
        searchVideos(event.target.value);
    }
}

// Tema Değiştir
function toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Yükleme Spinner'ını Göster
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Yükleme Spinner'ını Gizle
function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Favorilere Ekle
function addToFavorites(video) {
    if (!favorites.some(fav => fav.id === video.id)) {
        favorites.push(video);
        localStorage.setItem('favorites', JSON.stringify(favorites)); // Favorileri localStorage'a kaydet
        alert('Favorilere eklendi!');
    } else {
        alert('Bu video zaten favorilerinizde!');
    }
}

// Favorileri Göster
function toggleFavorites() {
    renderVideos(favorites);
}

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    loadTrendingVideos();
});

// Sonsuz Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isFetching) {
        isFetching = true;
        loadMoreVideos();
    }
});

// Daha Fazla Video Yükle
async function loadMoreVideos() {
    try {
        const url = new URL(`${YT_API_URL}/videos`);
        url.search = new URLSearchParams({
            part: 'snippet,statistics,contentDetails',
            chart: 'mostPopular',
            regionCode: 'TR',
            relevanceLanguage: currentLanguage,
            maxResults: 12,
            pageToken: nextPageToken,
            key: API_KEY
        });

        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            alert('API anahtarı geçersiz veya kota aşıldı. Lütfen ayarları kontrol edin.');
            return;
        }

        nextPageToken = data.nextPageToken || '';
        renderVideos(data.items, true);
    } catch (error) {
        console.error('Daha fazla video yüklenirken hata oluştu:', error);
    } finally {
        isFetching = false;
    }
}
