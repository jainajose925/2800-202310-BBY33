/*
    Use static loaders for easy file access on the public directory.
 */

const express = require('express');
const router = express.Router();
router.use("/js", express.static("./public/js"));
router.use("/css", express.static("./public/css"));
router.use("/img", express.static("./public/img"));
module.exports = router;
