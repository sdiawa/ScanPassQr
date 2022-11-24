const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
const cors = require("cors");
const route = require("./router/ExpressRouter");
app.use(cors({origin: '*'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(route);
const http = require('http').createServer(app);
http.listen(app.listen(port, function () {
    console.log("serveur ok sur le port " + port)
}));
