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
        videoPlayer.innerHTML = `
            <iframe width="100%" height="500" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" allowfullscreen></iframe>
        `;

        videoDetails.innerHTML = `
            <h2>${video.snippet.title}</h2>
            <p>${truncatedDescription}</p>
            ${video.snippet.description.length > 100 ? '<button onclick="showFullDescription()">Devamını Gör</button>' : ''}
            <div class="video-stats">
                <div class="stat">
                    <span>👁️ ${formatNumber(video.statistics.viewCount)}</span>
                </div>
                <div class="stat">
                    <span>📅 ${new Date(video.snippet.publishedAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <div class="stat">
                    <span>👍 ${formatNumber(video.statistics.likeCount)}</span>
                </div>
            </div>
            <button onclick="addToFavorites(${JSON.stringify(video).replace(/"/g, '&quot;')})">❤️ Favorilere Ekle</button>
        `;

        loadComments();
        loadRelatedVideos();
    } catch (error) {
        console.error('Video detayları yüklenirken hata oluştu:', error);
        alert('Video detayları yüklenirken hata oluştu.');
    }
}

function showFullDescription() {
    const videoDetails = document.getElementById('videoDetails');
    const fullDescription = video.snippet.description;
    videoDetails.querySelector('p').textContent = fullDescription;
    videoDetails.querySelector('button').remove();
}

async function loadComments() {
    try {
        const response = await fetch(`${YT_API_URL}/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=10&pageToken=${nextCommentsPageToken}`);
        const data = await response.json();
        if (data.error) {
            alert('Yorumlar yüklenirken hata oluştu.');
            return;
        }

        nextCommentsPageToken = data.nextPageToken || '';
        data.items.forEach(item => {
            const comment = item.snippet.topLevelComment.snippet;
            comments.innerHTML += `
                <div class="comment">
                    <img src="${comment.authorProfileImageUrl}" alt="${comment.authorDisplayName}" class="comment-avatar">
                    <div>
                        <strong>${comment.authorDisplayName}</strong>
                        <p>${comment.textDisplay}</p>
                        <small>${new Date(comment.publishedAt).toLocaleDateString('tr-TR')}</small>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Yorumlar yüklenirken hata oluştu:', error);
    }
}

async function loadRelatedVideos() {
    try {
        const response = await fetch(`${YT_API_URL}/search?part=snippet&relatedToVideoId=${videoId}&type=video&key=${API_KEY}&maxResults=5`);
        const data = await response.json();
        if (data.error) {
            console.error('API Hatası:', data.error);
            alert('Önerilen videolar yüklenirken hata oluştu. Lütfen daha sonra tekrar deneyin.');
            return;
        }

        relatedVideos.innerHTML = '<h3>Önerilen Videolar</h3>';
        data.items.forEach(video => {
            relatedVideos.innerHTML += `
                <div class="video-card" onclick="playVideo('${video.id.videoId}')">
                    <img src="${video.snippet.thumbnails.medium.url}" 
                         class="thumbnail" 
                         alt="${video.snippet.title}">
                    <div style="padding: 1rem">
                        <h4>${video.snippet.title}</h4>
                        <p>${video.snippet.channelTitle}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Önerilen videolar yüklenirken hata oluştu:', error);
        alert('Önerilen videolar yüklenirken hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
}

function formatNumber(num) {
    return parseInt(num).toLocaleString('tr-TR');
}

function addToFavorites(video) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === video.id)) {
        favorites.push(video);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Favorilere eklendi!');
    } else {
        alert('Bu video zaten favorilerinizde!');
    }
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadComments();
    }
});

document.addEventListener('DOMContentLoaded', loadVideoDetails);
