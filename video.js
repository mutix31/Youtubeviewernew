const YT_API_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = 'AIzaSyAzY7noObHLIYwpx1Z3pkub-1PMCTrHbHM'; // API anahtarı buraya eklendi
const videoId = new URLSearchParams(window.location.search).get('id');
const videoPlayer = document.getElementById('videoPlayer');
const videoDetails = document.getElementById('videoDetails');

async function loadVideoDetails() {
    try {
        const response = await fetch(`${YT_API_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
        const data = await response.json();
        if (data.error) {
            alert('API anahtarı geçersiz veya kota aşıldı. Lütfen ayarları kontrol edin.');
            return;
        }

        const video = data.items[0];
        videoPlayer.innerHTML = `
            <iframe width="100%" height="500" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" allowfullscreen></iframe>
        `;

        videoDetails.innerHTML = `
            <h2>${video.snippet.title}</h2>
            <p>${video.snippet.description}</p>
            <small>
                ${formatNumber(video.statistics.viewCount)} görüntülenme • 
                ${new Date(video.snippet.publishedAt).toLocaleDateString('tr-TR')}
            </small>
        `;
    } catch (error) {
        console.error('Video detayları yüklenirken hata oluştu:', error);
        alert('Video detayları yüklenirken hata oluştu.');
    }
}

function formatNumber(num) {
    return parseInt(num).toLocaleString('tr-TR');
}

document.addEventListener('DOMContentLoaded', loadVideoDetails);
