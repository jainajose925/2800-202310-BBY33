const express = require("express");
const app = express();
app.use(express.json());
const fs = require("fs");

app.use("/js", express.static("./public/js"));

app.use("/css", express.static("./public/css"));

app.use("/img", express.static("./public/img"));

app.use("/html", express.static("./app/html"));