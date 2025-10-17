# YouTube to MP3/MP4 Converter

🎵 **Aplikasi web sederhana untuk mengkonversi video YouTube ke format MP3 (audio) atau MP4 (video)**

## ✨ Fitur

- 🎯 **Konversi Mudah**: Cukup paste URL YouTube dan pilih format
- 🎵 **MP3 Audio**: Download audio berkualitas tinggi dari video YouTube
- 🎬 **MP4 Video**: Download video dalam format MP4
- 🚀 **Multi-API**: Menggunakan beberapa API untuk memastikan keandalan
- 📱 **Responsive**: Bekerja di desktop, tablet, dan mobile
- 🎨 **UI Modern**: Interface yang bersih dan mudah digunakan
- ⚡ **Cepat**: Proses konversi yang efisien

## 🛠️ Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **API**: RapidAPI, Cobalt API, yt1s.com API
- **Server**: Python HTTP Server (untuk development)

## 🚀 Cara Menggunakan

### 1. Clone Repository
```bash
git clone https://github.com/username/youtube-mp3-converter.git
cd youtube-mp3-converter
```

### 2. Jalankan Server Lokal
```bash
python -m http.server 8000
```

### 3. Buka di Browser
Akses aplikasi di: `http://localhost:8000`

### 4. Konversi Video
1. Paste URL YouTube ke dalam input field
2. Pilih format: **MP3** (audio) atau **MP4** (video)
3. Klik tombol **"Convert Sekarang"**
4. Tunggu proses konversi selesai
5. Download file hasil konversi

## 📋 Format URL yang Didukung

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/v/VIDEO_ID`

## 🔧 Konfigurasi API

Aplikasi menggunakan sistem multi-API dengan prioritas:

1. **RapidAPI** (Primary) - Kualitas terbaik, memerlukan API key
2. **Cobalt API** (Fallback) - Gratis, tidak perlu API key
3. **yt1s.com API** (Backup) - Gratis, sebagai backup terakhir

### Setup RapidAPI (Opsional)
Jika ingin menggunakan RapidAPI untuk kualitas terbaik:

1. Daftar di [RapidAPI](https://rapidapi.com/)
2. Subscribe ke [YouTube MP3 Downloader API](https://rapidapi.com/ytjar/api/youtube-mp3-downloader5/)
3. Ganti API key di file `script.js`:
```javascript
const API_CONFIG = {
    rapidapi: {
        key: 'YOUR_RAPIDAPI_KEY_HERE'
    }
};
```

## 📁 Struktur Project

```
youtube-mp3-converter/
├── index.html          # Halaman utama aplikasi
├── script.js           # Logic JavaScript
├── .gitignore         # File yang diabaikan Git
└── README.md          # Dokumentasi project
```

## 🎨 Screenshot

![YouTube to MP3 Converter](https://via.placeholder.com/800x400/667eea/ffffff?text=YouTube+to+MP3+Converter)

## ⚠️ Disclaimer

- Aplikasi ini hanya untuk tujuan edukasi dan penggunaan pribadi
- Pastikan Anda memiliki hak untuk mengunduh konten yang dikonversi
- Hormati hak cipta dan kebijakan YouTube
- Gunakan dengan bijak dan bertanggung jawab

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

- **GitHub**: [Your GitHub Profile](https://github.com/username)
- **Email**: your.email@example.com

## 🙏 Acknowledgments

- [RapidAPI](https://rapidapi.com/) - API marketplace
- [Cobalt](https://co.wuk.sh/) - Free media downloader
- [yt1s.com](https://yt1s.com/) - YouTube converter service

---

⭐ **Jika project ini membantu, jangan lupa berikan star!** ⭐