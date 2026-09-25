const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { signup, login, getMe } = require("../controllers/auth.controller");

// POST /api/auth/signup  { name, email, password, role, phone? }
router.post("/signup", signup);

// POST /api/auth/login  { email, password }
router.post("/login", login);

// GET /api/auth/me
router.get("/me", requireAuth, getMe);

module.exports = router;
