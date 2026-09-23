const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");
const Ride = require("../models/Ride");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth.middleware");

// POST /api/ratings  { ride, to, score, comment? }
router.post("/", requireAuth, async (req, res) => {
  try {
    const { ride: rideId, to, score, comment } = req.body;

    if (!rideId || !to || !score) {
      return res.status(400).json({ error: "ride, to, and score are required" });
    }
    if (score < 1 || score > 5) {
      return res.status(400).json({ error: "score must be between 1 and 5" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    if (ride.status !== "completed") {
      return res.status(400).json({ error: "Can only rate completed rides" });
    }

    // Whoever is rating must actually be a participant on this ride.
    const isRider = String(ride.rider) === req.user.id;
    const isDriver = String(ride.driver) === req.user.id;
    if (!isRider && !isDriver) {
      return res.status(403).json({ error: "Not a participant on this ride" });
    }
    // Riders rate the driver, drivers rate the rider — enforce the pairing.
    const expectedTo = isRider ? String(ride.driver) : String(ride.rider);
    if (String(to) !== expectedTo) {
      return res.status(400).json({ error: "'to' does not match the other party on this ride" });
    }

    const existing = await Rating.findOne({ ride: rideId, from: req.user.id });
    if (existing) return res.status(409).json({ error: "You already rated this ride" });

    const rating = await Rating.create({
      ride: rideId,
      from: req.user.id,
      to,
      score,
      comment,
    });

    // Roll the new score into the ratee's running average.
    const ratee = await User.findById(to);
    if (ratee) {
      const newCount = ratee.ratingCount + 1;
      const newAverage = (ratee.ratingAverage * ratee.ratingCount + score) / newCount;
      ratee.ratingAverage = Number(newAverage.toFixed(2));
      ratee.ratingCount = newCount;
      await ratee.save();
    }

    res.status(201).json({ rating });
  } catch (err) {
    res.status(500).json({ error: "Could not submit rating", details: err.message });
  }
});

// GET /api/ratings/ride/:rideId - ratings left on a given ride
router.get("/ride/:rideId", requireAuth, async (req, res) => {
  const ratings = await Rating.find({ ride: req.params.rideId });
  res.json({ ratings });
});

module.exports = router;
