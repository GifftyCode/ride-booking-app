const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { createRating } = require("../controllers/rating.controller");

// POST /api/ratings - Submit a post-trip rider/driver rating.
router.post("/", requireAuth, createRating);

module.exports = router;
