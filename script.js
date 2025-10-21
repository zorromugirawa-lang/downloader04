// Konfigurasi API - menggunakan RapidAPI dengan key yang valid
const API_CONFIG = {
    rapidapi: {
        url: 'https://youtube-mp3-audio-video-downloader.p.rapidapi.com',
        key: '336b94c1f0mshdc0e4d3812bed2dp127c33jsn4f7673bda404',
        host: 'youtube-mp3-audio-video-downloader.p.rapidapi.com'
    },
    playlist: {
        url: 'https://youtube-media-downloader.p.rapidapi.com',
        key: '336b94c1f0mshdc0e4d3812bed2dp127c33jsn4f7673bda404',
        host: 'youtube-media-downloader.p.rapidapi.com'
    },
    alternatives: [
        'https://co.wuk.sh/api/json',
        'https://www.yt1s.com/api/ajaxSearch/index'
    ]
};

let currentFormat = 'mp3';

// Inisialisasi format buttons
document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFormat = this.dataset.format;
    });
});

// Fungsi utama konversi
async function convertVideo() {
    const url = document.getElementById('youtubeUrl').value.trim();
    const convertBtn = document.getElementById('convertBtn');
    const resultDiv = document.getElementById('result');

    // Validasi input
    if (!url) {
        showError('Silakan masukkan URL YouTube');
        return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
        showError('URL YouTube tidak valid');
        return;
    }

    // Tampilkan loading
    convertBtn.disabled = true;
    convertBtn.textContent = 'Mengkonversi...';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="loading">
            <p>🔄 Sedang memproses video...</p>
            <p>Harap tunggu beberapa saat</p>
        </div>
    `;

    try {
        // Dapatkan info video terlebih dahulu
        const videoInfo = await getVideoInfo(videoId);
        
        // Tampilkan info video
        showVideoInfo(videoInfo);

        // Konversi menggunakan API
        const downloadData = await convertWithAPI(videoId);
        
        if (downloadData && downloadData.link) {
            showDownloadLink(downloadData, videoInfo);
        } else {
            throw new Error(downloadData.msg || 'Gagal mengkonversi video');
        }

    } catch (error) {
        console.error('Error:', error);
        showError('Terjadi error: ' + error.message);
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = 'Convert Sekarang';
    }
}

// Extract video ID dari URL YouTube
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/,
        /youtube\.com\/embed\/([^&?#]+)/,
        /youtube\.com\/v\/([^&?#]+)/
    ];

    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// Dapatkan info video (thumbnail, judul, dll)
async function getVideoInfo(videoId) {
    try {
        // Gunakan API alternatif untuk mendapatkan info video
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        
        return {
            title: data.title || 'Unknown Title',
            thumbnail: data.thumbnail_url || '',
            author: data.author_name || 'Unknown Author'
        };
    } catch (error) {
        return {
            title: 'Video YouTube',
            thumbnail: '',
            author: 'Unknown'
        };
    }
}

// Konversi menggunakan RapidAPI sebagai metode utama
async function convertWithAPI(videoId) {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Coba RapidAPI terlebih dahulu
    try {
        const endpoint = currentFormat === 'mp3' 
            ? `${API_CONFIG.rapidapi.url}/get_mp3_download_link/${videoId}?quality=low&wait_until_the_file_is_ready=false`
            : `${API_CONFIG.rapidapi.url}/get_mp4_download_link/${videoId}?quality=low&wait_until_the_file_is_ready=false`;
            
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_CONFIG.rapidapi.key,
                'X-RapidAPI-Host': API_CONFIG.rapidapi.host
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.download_url) {
                return {
                    link: data.download_url,
                    filesize: data.file_size || 'Unknown',
                    duration: data.duration || 'Unknown',
                    msg: 'success'
                };
            }
        }
    } catch (error) {
        console.log('RapidAPI failed, trying alternative method...', error);
    }

    // Fallback: Gunakan Cobalt API
    try {
        const response = await fetch('https://co.wuk.sh/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: youtubeUrl,
                vCodec: currentFormat === 'mp4' ? 'h264' : 'mp3',
                vQuality: currentFormat === 'mp4' ? '720' : '128',
                aFormat: currentFormat === 'mp3' ? 'mp3' : 'mp3',
                filenamePattern: 'classic',
                isAudioOnly: currentFormat === 'mp3'
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' || data.status === 'redirect') {
                return {
                    link: data.url,
                    filesize: 'Unknown',
                    duration: 'Unknown',
                    msg: 'success'
                };
            }
        }
    } catch (error) {
        console.log('Cobalt API also failed:', error);
    }

    // Fallback terakhir: Gunakan metode alternatif dengan yt1s.com API
    try {
        // Langkah 1: Dapatkan informasi video
        const analyzeResponse = await fetch('https://www.yt1s.com/api/ajaxSearch/index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `q=${encodeURIComponent(youtubeUrl)}&vt=home`
        });

        if (!analyzeResponse.ok) {
            throw new Error('Failed to analyze video');
        }

        const analyzeData = await analyzeResponse.json();
        
        if (analyzeData.status !== 'ok') {
            throw new Error(analyzeData.msg || 'Failed to analyze video');
        }

        // Langkah 2: Konversi video
        const convertResponse = await fetch('https://www.yt1s.com/api/ajaxConvert/index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `vid=${analyzeData.vid}&k=${analyzeData.links[currentFormat][0].k}`
        });

        if (!convertResponse.ok) {
            throw new Error('Failed to convert video');
        }

        const convertData = await convertResponse.json();
        
        if (convertData.status === 'ok') {
            return {
                link: convertData.dlink,
                filesize: convertData.fsize || 'Unknown',
                duration: analyzeData.t || 'Unknown',
                msg: 'success'
            };
        } else {
            throw new Error(convertData.msg || 'Conversion failed');
        }

    } catch (error) {
        console.error('All conversion methods failed:', error);
        
        // Pesan error yang lebih informatif
        let errorMessage = 'Semua metode konversi gagal.';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Koneksi internet bermasalah atau API sedang down.';
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
            errorMessage = 'Video tidak ditemukan atau telah dihapus.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
            errorMessage = 'Video dibatasi atau tidak dapat diakses.';
        } else if (error.message.includes('502') || error.message.includes('Bad Gateway')) {
            errorMessage = 'Server API sedang bermasalah. Silakan coba lagi nanti.';
        }
        
        throw new Error(errorMessage);
    }
}

// Tampilkan info video
function showVideoInfo(info) {
    const resultDiv = document.getElementById('result');
    const videoInfoHTML = `
        <div class="video-info">
            ${info.thumbnail ? `<img src="${info.thumbnail}" alt="Thumbnail" class="video-thumbnail">` : ''}
            <h3>${info.title}</h3>
            <p>Channel: ${info.author}</p>
            <p>Format: ${currentFormat.toUpperCase()}</p>
        </div>
    `;
    resultDiv.innerHTML = videoInfoHTML;
}

// Tampilkan download link
function showDownloadLink(downloadData, videoInfo) {
    const resultDiv = document.getElementById('result');
    const fileName = `${videoInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${currentFormat}`;
    
    resultDiv.innerHTML += `
        <div style="text-align: center;">
            <h3>✅ Konversi Berhasil!</h3>
            <p>Klik tombol di bawah untuk mengunduh:</p>
            <a href="${downloadData.link}" class="download-btn" download="${fileName}">
                📥 Download ${currentFormat.toUpperCase()}
            </a>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">
                Size: ${downloadData.filesize || 'Unknown'} | 
                Duration: ${downloadData.duration || 'Unknown'}
            </p>
        </div>
    `;
}

// Tampilkan error
function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="error">
            <strong>❌ Service Unavailable:</strong> ${message}
            <br><br>
            <p style="font-size: 14px; margin-top: 10px;">
                🔄 <strong>Kemungkinan penyebab:</strong><br>
                • API sedang dalam maintenance<br>
                • Koneksi internet bermasalah<br>
                • Video mungkin dibatasi atau dihapus<br><br>
                💡 <strong>Solusi:</strong><br>
                • Coba lagi dalam beberapa menit<br>
                • Periksa koneksi internet Anda<br>
                • Gunakan URL YouTube yang berbeda
            </p>
        </div>
    `;
}

// Enter key support
document.getElementById('youtubeUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        convertVideo();
    }
});

document.getElementById('playlistUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        convertPlaylist();
    }
});

// Playlist functionality
async function convertPlaylist() {
    const url = document.getElementById('playlistUrl').value.trim();
    const convertBtn = document.getElementById('convertPlaylistBtn');
    const resultDiv = document.getElementById('playlistResult');

    // Validasi input
    if (!url) {
        showPlaylistError('Silakan masukkan URL Playlist YouTube');
        return;
    }

    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
        showPlaylistError('URL Playlist YouTube tidak valid');
        return;
    }

    // Tampilkan loading
    convertBtn.disabled = true;
    convertBtn.textContent = 'Mengambil Playlist...';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="loading">
            <p>🔄 Sedang mengambil video dari playlist...</p>
            <p>Harap tunggu beberapa saat</p>
        </div>
    `;

    try {
        const playlistData = await getPlaylistVideos(playlistId);
        
        if (playlistData && playlistData.videos && playlistData.videos.length > 0) {
            showPlaylistVideos(playlistData);
        } else {
            throw new Error('Playlist tidak ditemukan atau kosong');
        }

    } catch (error) {
        console.error('Error:', error);
        showPlaylistError('Terjadi error: ' + error.message);
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = 'Ambil Playlist';
    }
}

// Extract playlist ID dari URL
function extractPlaylistId(url) {
    const patterns = [
        /[?&]list=([^&]+)/,
        /playlist\?list=([^&]+)/
    ];

    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// Ambil video dari playlist menggunakan API
async function getPlaylistVideos(playlistId) {
    try {
        const response = await fetch(`${API_CONFIG.playlist.url}/v2/playlist/videos?playlistId=${playlistId}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_CONFIG.playlist.key,
                'X-RapidAPI-Host': API_CONFIG.playlist.host
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Gagal mengambil data playlist');
        }
    } catch (error) {
        throw new Error('Error mengakses API playlist: ' + error.message);
    }
}

// Tampilkan daftar video playlist
function showPlaylistVideos(playlistData) {
    const resultDiv = document.getElementById('playlistResult');
    const videos = playlistData.videos || [];
    
    let videosHtml = videos.map((video, index) => `
        <div class="playlist-video-item" style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; background: #f9f9f9;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${video.thumbnail || ''}" alt="Thumbnail" style="width: 120px; height: 90px; object-fit: cover; border-radius: 5px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; color: #333;">${video.title || 'Unknown Title'}</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">Duration: ${video.duration || 'Unknown'}</p>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Channel: ${video.channelTitle || 'Unknown'}</p>
                </div>
                <button onclick="downloadVideoFromPlaylist('${video.videoId}')" 
                        class="download-btn" 
                        style="padding: 8px 16px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Download ${currentFormat.toUpperCase()}
                </button>
            </div>
        </div>
    `).join('');

    resultDiv.innerHTML = `
        <div class="playlist-success">
            <h3>✅ Playlist berhasil dimuat!</h3>
            <p><strong>Total Video:</strong> ${videos.length}</p>
            <p><strong>Playlist:</strong> ${playlistData.title || 'YouTube Playlist'}</p>
            <div style="margin-top: 20px;">
                <button onclick="downloadAllFromPlaylist()" 
                        style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Download Semua (${currentFormat.toUpperCase()})
                </button>
                <button onclick="clearPlaylistResult()" 
                        style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Clear
                </button>
            </div>
            <div class="playlist-videos" style="margin-top: 20px;">
                ${videosHtml}
            </div>
        </div>
    `;
}

// Download video individual dari playlist
async function downloadVideoFromPlaylist(videoId) {
    try {
        const downloadData = await convertWithAPI(videoId);
        
        if (downloadData && downloadData.link) {
            // Buka link download di tab baru
            window.open(downloadData.link, '_blank');
        } else {
            alert('Gagal mengkonversi video: ' + (downloadData.msg || 'Unknown error'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Download semua video dari playlist
async function downloadAllFromPlaylist() {
    const videoItems = document.querySelectorAll('.playlist-video-item');
    const totalVideos = videoItems.length;
    
    if (totalVideos === 0) return;
    
    const confirmed = confirm(`Anda akan mendownload ${totalVideos} video. Lanjutkan?`);
    if (!confirmed) return;
    
    for (let i = 0; i < videoItems.length; i++) {
        const downloadBtn = videoItems[i].querySelector('.download-btn');
        const videoId = downloadBtn.getAttribute('onclick').match(/'([^']+)'/)[1];
        
        try {
            downloadBtn.textContent = 'Downloading...';
            downloadBtn.disabled = true;
            
            const downloadData = await convertWithAPI(videoId);
            
            if (downloadData && downloadData.link) {
                // Delay untuk menghindari spam
                setTimeout(() => {
                    window.open(downloadData.link, '_blank');
                }, i * 2000); // 2 detik delay antar download
                
                downloadBtn.textContent = '✅ Downloaded';
                downloadBtn.style.background = '#4CAF50';
            } else {
                downloadBtn.textContent = '❌ Failed';
                downloadBtn.style.background = '#f44336';
            }
        } catch (error) {
            downloadBtn.textContent = '❌ Error';
            downloadBtn.style.background = '#f44336';
        }
        
        downloadBtn.disabled = false;
    }
}

// Clear hasil playlist
function clearPlaylistResult() {
    document.getElementById('playlistResult').style.display = 'none';
    document.getElementById('playlistUrl').value = '';
}

// Tampilkan error playlist
function showPlaylistError(message) {
    const resultDiv = document.getElementById('playlistResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="error">
            <strong>❌ Error Playlist:</strong> ${message}
            <br><br>
            <p style="font-size: 14px; margin-top: 10px;">
                🔄 <strong>Kemungkinan penyebab:</strong><br>
                • URL playlist tidak valid<br>
                • Playlist bersifat private<br>
                • API sedang dalam maintenance<br><br>
                💡 <strong>Solusi:</strong><br>
                • Pastikan URL playlist benar<br>
                • Gunakan playlist yang public<br>
                • Coba lagi dalam beberapa menit
            </p>
        </div>
    `;
}
document.getElementById('youtubeUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        convertVideo();
    }
});