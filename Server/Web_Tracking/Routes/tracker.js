const express = require("express");
const router = express.Router();

const { today, update, limit } = require("../handlers/tracker");

//? Returns a object with today's data and website
router.get("/today", today);

//? Single min update with domain name and minute count
router.post("/update", update);

//? Retuns the overall useage data for a single website overtime
router.get("/website");

//? Updates and return the user defined limit for the website
router.post("/limit", limit);

module.exports = router;
