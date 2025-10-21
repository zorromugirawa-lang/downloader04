import yt_dlp
import sys
import os

def download_youtube_video(url, format_type='mp3', quality='best'):
    """
    Download YouTube video using yt-dlp
    
    Args:
        url (str): YouTube video URL
        format_type (str): 'mp3' for audio only, 'mp4' for video
        quality (str): Quality preference ('best', 'worst', or specific)
    """
    
    # Create downloads directory if it doesn't exist
    downloads_dir = os.path.join(os.getcwd(), 'downloads')
    os.makedirs(downloads_dir, exist_ok=True)
    
    if format_type.lower() == 'mp3':
        # Audio-only download options (fallback to original format if FFmpeg not available)
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(downloads_dir, '%(title)s.%(ext)s'),
            'embed_subs': False,
            'writesubtitles': False,
        }
        
        # Try to use FFmpeg for MP3 conversion, fallback to original format if not available
        try:
            import subprocess
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
            # FFmpeg is available, add post-processing
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }]
            ydl_opts['extractaudio'] = True
            ydl_opts['audioformat'] = 'mp3'
            print("🎵 FFmpeg detected - will convert to MP3")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️  FFmpeg not found - downloading original audio format (webm/m4a)")
            print("💡 To get MP3 files, install FFmpeg: https://ffmpeg.org/download.html")
    else:
        # Video download options (MP4)
        ydl_opts = {
            'format': f'{quality}[ext=mp4]/best[ext=mp4]/best',
            'outtmpl': os.path.join(downloads_dir, '%(title)s.%(ext)s'),
            'merge_output_format': 'mp4',
        }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info first
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'Unknown')
            duration = info.get('duration', 0)
            
            print(f"Title: {title}")
            print(f"Duration: {duration} seconds")
            print(f"Format: {format_type.upper()}")
            print("Starting download...")
            
            # Download the video
            ydl.download([url])
            print("✅ Download completed successfully!")
            
            return {
                'success': True,
                'title': title,
                'duration': duration,
                'format': format_type,
                'download_path': downloads_dir
            }
            
    except Exception as e:
        print(f"❌ Error downloading video: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print("Usage: python yt_dlp_downloader.py <YouTube_URL> [format] [quality]")
        print("Example: python yt_dlp_downloader.py 'https://youtube.com/watch?v=...' mp3")
        print("Example: python yt_dlp_downloader.py 'https://youtube.com/watch?v=...' mp4 best")
        return
    
    url = sys.argv[1]
    format_type = sys.argv[2] if len(sys.argv) > 2 else 'mp3'
    quality = sys.argv[3] if len(sys.argv) > 3 else 'best'
    
    print(f"🎬 YouTube Downloader using yt-dlp")
    print(f"URL: {url}")
    print(f"Format: {format_type}")
    print(f"Quality: {quality}")
    print("-" * 50)
    
    result = download_youtube_video(url, format_type, quality)
    
    if result['success']:
        print(f"\n🎉 Successfully downloaded: {result['title']}")
        print(f"📁 Saved to: {result['download_path']}")
    else:
        print(f"\n💥 Download failed: {result['error']}")

if __name__ == "__main__":
    main()