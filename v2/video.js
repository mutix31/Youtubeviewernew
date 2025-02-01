const YT_API_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = 'AIzaSyAzY7noObHLIYwpx1Z3pkub-1PMCTrHbHM';
const videoId = new URLSearchParams(window.location.search).get('id');
const videoPlayer = document.getElementById('videoPlayer');
const videoDetails = document.getElementById('videoDetails');
const comments = document.getElementById('comments');
const relatedVideos = document.getElementById('relatedVideos');
let nextCommentsPageToken = '';

function truncateDescription(description, maxLength = 100) {
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
}

async function loadVideoDetails() {
    try {
        const response = await fetch(`${YT_API_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
        const data = await response.json();
        if (data.error) {
            alert('API anahtarı geçersiz veya kota aşıldı. Lütfen ayarları kontrol edin.');
            return;
        }

        const video = data.items[0];
        const truncatedDescription = truncateDescription(video.snippet.description);
        videoPlayer.innerHTML
