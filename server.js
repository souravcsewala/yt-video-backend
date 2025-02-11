const express = require("express");
const PORT = process.env.PORT || 7050 
require("colors")
const server = express();
server.use(express.json());
var cors=require("cors")
const morgan=require("morgan")

const corsOptions = {
  origin: "*",
   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
   credentials: true,
};
 server.use(cors(corsOptions));

server.set("trust proxy",true)
//! Morgan for logging
server.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms  Client-Ip: :remote-addr "
  )
);

//! Define diffarent routes
//! routes path home
server.get("/", (req, res) => {
  res.send("Server is Up and Running sourav the yt-video download application");
}); 

server.use("/sourav/yt-video-download/app", require("./Routes/VideoRoute"));


const RunMainServer=()=>{
      try{
        server.listen(PORT, () => console.log(`Hii , Sourav Server running on port ${PORT}`.bgCyan.bold));
      }catch(error){
          console.log("the error from main server",error)
      }
}

   RunMainServer()