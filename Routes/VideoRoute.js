const express = require("express"); 

const Router = express.Router(); 
const{GetTheUrlAndSendFormat,DownloadVideo}=require("../controller/VideoController")
//! 1. get the video url from thefronted and send the video formats 

Router.route("/get-video-url/send-format").get(GetTheUrlAndSendFormat)

//! download the video 

Router.route("/download").get(DownloadVideo)





module.exports=Router;