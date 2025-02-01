const videoId = new URLSearchParams(window.location.search).get('id');
const videoPlayer = document.getElementById('videoPlayer');
const videoDetails = document.getElementById('videoDetails');
const comments = document.getElementById('comments');

async function loadVideoDetails() {
    const response = await fetch(`${YT_API_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
    const data = await response.json();
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
}

loadVideoDetails();
