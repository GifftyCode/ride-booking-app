const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const { requireAuth } = require("../middleware/auth.middleware");

// GET /api/notifications/mine
router.get("/mine", requireAuth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ notifications });
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", requireAuth, async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!notification) return res.status(404).json({ error: "Notification not found" });

  notification.read = true;
  await notification.save();
  res.json({ notification });
});

// PATCH /api/notifications/read-all
router.patch("/read-all", requireAuth, async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.json({ ok: true });
});

module.exports = router;
