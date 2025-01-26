export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { playlistUrl } = req.body;
  
    console.log("Received playlist URL:", playlistUrl); // Debugging log
  
    const match = playlistUrl.match(/list=([^&]+)/);
    if (!match) {
        return res.status(400).json({ error: "Invalid playlist URL" });
    }
  
    const playlistId = match[1];
    const API_KEY = "AIzaSyB7TRzzkbTQUE3y6hmC9a-YLh1RKgEkMv4"; // Use environment variables
  
    try {
        // Fetch playlist items
        const fetchPlaylistItems = async (playlistId) => {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data.items.map((item) => item.contentDetails.videoId);
        };
  
        // Fetch video statistics
        const fetchVideoStatistics = async (videoIds) => {
            if (videoIds.length === 0) return [];
            const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(",")}&key=${API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data.items.map((item) => ({
                id: item.id,
                title: item.snippet.title,
                views: parseInt(item.statistics.viewCount, 10),
                thumbnail: item.snippet.thumbnails.medium.url,
            }));
        };
  
        // Fetch comments for each video
        const fetchComments = async (videoId) => {
            const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=5&key=${API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data.items.map((item) => item.snippet.topLevelComment.snippet.textDisplay);
        };
  
        const videoIds = await fetchPlaylistItems(playlistId);
        const videos = await fetchVideoStatistics(videoIds);
  
        // Fetch comments for each video
        for (let video of videos) {
            video.comments = await fetchComments(video.id);
        }
  
        const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  
        res.status(200).json({ totalViews, videos });
    } catch (error) {
        console.error("Error occurred:", error.message); // Debugging log
        res.status(500).json({ error: error.message });
    }
  }