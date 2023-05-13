// PlaceHolder for main merge issue.
const express = require('express');
const router = express.Router();
console.log('public.js loaded');

router.use("/js", express.static("./public/js"));
router.use("/css", express.static("./public/css"));
router.use("/img", express.static("./public/img"));

module.exports = router;
