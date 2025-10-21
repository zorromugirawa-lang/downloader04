const https = require('https'); 
 
const options = { 
	method: 'GET', 
	hostname: 'youtube-media-downloader.p.rapidapi.com', 
	port: null, 
	path: '/v2/playlist/videos?playlistId=PLeCdlPO-XhWFzEVynMsmosfdRsIZXhZi0', 
	headers: { 
		'x-rapidapi-key': '336b94c1f0mshdc0e4d3812bed2dp127c33jsn4f7673bda404', 
		'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com' 
	} 
}; 

console.log('🔍 Testing YouTube Playlist API...');
console.log('📋 Playlist ID: PLeCdlPO-XhWFzEVynMsmosfdRsIZXhZi0');
console.log('⏳ Fetching playlist data...\n');

const req = https.request(options, function (res) { 
	const chunks = []; 

	console.log(`📡 Response Status: ${res.statusCode}`);
	console.log(`📊 Response Headers:`, res.headers);
	console.log(''); 

	res.on('data', function (chunk) { 
		chunks.push(chunk); 
	}); 

	res.on('end', function () { 
		const body = Buffer.concat(chunks); 
		const responseText = body.toString();
		
		console.log('📄 Raw Response:');
		console.log(responseText);
		console.log('\n' + '='.repeat(50));
		
		try {
			const jsonData = JSON.parse(responseText);
			console.log('✅ Parsed JSON Data:');
			console.log(JSON.stringify(jsonData, null, 2));
			
			if (jsonData.videos && Array.isArray(jsonData.videos)) {
				console.log(`\n🎵 Found ${jsonData.videos.length} videos in playlist:`);
				jsonData.videos.forEach((video, index) => {
					console.log(`${index + 1}. ${video.title || 'No title'}`);
					console.log(`   ID: ${video.id || 'No ID'}`);
					console.log(`   Duration: ${video.duration || 'Unknown'}`);
					console.log('');
				});
			}
		} catch (error) {
			console.log('❌ Failed to parse JSON:', error.message);
		}
	}); 
}); 

req.on('error', function (error) {
	console.error('❌ Request Error:', error);
});

req.end();