const YT_API_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = 'AIzaSyAzY7noObHLIYwpx1Z3pkub-1PMCTrHbHM';
const videoId = new URLSearchParams(window.location.search).get('id');
const videoPlayer = document.getElementById('videoPlayer');
const videoDetails = document.getElementById('videoDetails');
const comments = document.getElementById('comments');

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

        loadComments();
        loadRelatedVideos();
    } catch (error) {
        console.error('Video detayları yüklenirken hata oluştu:', error);
        alert('Video detayları yüklenirken hata oluştu.');
    }
}

async function loadComments() {
    try {
        const response = await fetch(`${YT_API_URL}/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=10`);
        const data = await response.json();
        if (data.error) {
            alert('Yorumlar yüklenirken hata oluştu.');
            return;
        }

        comments.innerHTML = '<h3>Yorumlar</h3>';
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
            alert('Önerilen videolar yüklenirken hata oluştu.');
            return;
        }

        const relatedVideos = document.createElement('div');
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
        document.querySelector('main').appendChild(relatedVideos);
    } catch (error) {
        console.error('Önerilen videolar yüklenirken hata oluştu:', error);
    }
}

function formatNumber(num) {
    return parseInt(num).toLocaleString('tr-TR');
}

document.addEventListener('DOMContentLoaded', loadVideoDetails);
