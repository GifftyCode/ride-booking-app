const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { register, login, getMe } = require("../controllers/auth.controller");
const { registerRules, loginRules } = require("../middleware/auth.validator");

const router = express.Router();

router.post("/register", registerRules, register);
router.post("/signup", registerRules, register);
router.post("/login", loginRules, login);
router.get("/me", requireAuth, getMe);

module.exports = router;
