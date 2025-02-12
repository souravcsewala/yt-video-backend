//  const ytdl = require("ytdl-core");
// const ytdl = require('ytdl-core-discord');
const ytdl = require('@distube/ytdl-core');

const { HttpsProxyAgent } = require('https-proxy-agent');

// Define your proxy
const proxyUrl = 'http://103.41.33.246:58080';
const agent = new HttpsProxyAgent(proxyUrl);

//! 1. first get the video URL from the fronted then cheak it and send the video format to the client 
//? make beautiful logic by sourav let's go..........
//? ami potti ta line explain kora bolachi jatta bujta karor problem na hoyy

const GetTheUrlAndSendFormat = async (req, res, next) => {
    let videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ msg: "No URL provided" });
    }

    try {
        const videoID = ytdl.getURLVideoID(videoUrl);
        if (!ytdl.validateID(videoID)) {
            return res.status(400).json({ msg: "Invalid YouTube Video Id" });
        }

        const info = await ytdl.getInfo(videoID, { requestOptions: { agent } });
        const videoDetails = info.videoDetails;

        const videoTitle = videoDetails.title;
        const thumbnails = videoDetails.thumbnails;
        const thumbnailUrl = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : "";

        //! Extract Video Formats (Only MP4 with Audio & Video)
        let videoFormats = info.formats.filter(f => 
            f.mimeType.includes('video/mp4') && f.hasAudio && f.hasVideo
        );

        //! Remove Duplicate Quality Labels (Keep Highest Bitrate for Each Quality)
        const uniqueFormats = new Map();
        videoFormats.forEach(format => {
            if (!uniqueFormats.has(format.qualityLabel)) {
                uniqueFormats.set(format.qualityLabel, format);
            }
        });

        //! Convert to Array with Cleaned Data
        videoFormats = Array.from(uniqueFormats.values()).map(format => ({
            quality: format.qualityLabel || "Unknown", 
            type: "video",
            url: format.url,
            itag:format.itag
        }));

        //! Extract Audio Format
        let audioFormat = info.formats.find(f => f.mimeType.includes('audio/mp4'));

        //! Format Audio Data
        let audioData = null;
        if (audioFormat) {
            audioData = {
                quality: "Audio",
                itag:audioFormat.itag,
                type: "audio",
                url: audioFormat.url,
            };
        }

        //! Send Response
        res.json({
            title: videoTitle,
            thumbnail: thumbnailUrl,
            formats: [...videoFormats, ...(audioData ? [audioData] : [])],
        });

    } catch (error) {
        console.error("Error in GetTheUrlAndSendFormat:", error.message);
        res.status(500).json({ error: "Failed to fetch video formats" });
    }
};








//! 2. download the video after get the format user download 
//? make beautiful logic by sourav let's go..........

const DownloadVideo = async (req, res) => {
    let videoUrl = req.query.url;
    let itag = req.query.itag;

    if (!videoUrl || !itag) {
        return res.status(400).json({ msg: "Missing URL or format" });
    }

    try {
        const videoID = ytdl.getURLVideoID(videoUrl);
        if (!ytdl.validateID(videoID)) {
            return res.status(400).json({ msg: "Invalid YouTube Video ID" });
        }

        //* get video info note: getinfo kaj korba but jodi getBasicinfo use kora hoyy akhana function extract hoba na 
        const info = await ytdl.getInfo(videoID, { requestOptions: { agent } });
        console.log("info", info);

        //* find the correct format jai format user select korba fronted thaka 
        const format = info.formats.find(f => f.itag == Number(itag));

        if (!format) {
            return res.status(400).json({ msg: "Invalid format selected" });
        }

        console.log("Selected Format:", format);

        //* file extension container dia korachi 
        const fileExtension = format.container || (format.mimeType.includes("audio") ? "mp3" : "mp4");

        //* file nam video title dia kora jato kintu eng lan chara onno language hola problem hoba
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        const filename = `${randomNumber}`;

        //* response headers for download  
        res.header("Content-Disposition", `attachment; filename="${filename}.${fileExtension}"`);
        res.header("Content-Type", format.mimeType);

        //*  Stream the video/audio
        ytdl(videoUrl, { quality: itag, filter: format.hasVideo ? "audioandvideo" : "audioonly",requestOptions: { agent } })
            .on("error", (err) => {
                console.error("Stream Error:", err);
                res.status(500).json({ error: "Failed to stream video" });
            })
            .pipe(res);

    } catch (error) {
        console.error("Error in DownloadVideo:", error);
        res.status(500).json({ error: "Failed to process video download" });
    }
};


























module.exports = { GetTheUrlAndSendFormat, DownloadVideo  };




