const Rating = require("../models/Rating");
const Ride = require("../models/Ride");

async function createRating(req, res) {
  try {
    const { rideId, to, score, comment } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    if (ride.status !== "completed") {
      return res.status(400).json({ error: "Ratings can only be added after a completed ride" });
    }

    const rating = await Rating.create({
      ride: rideId,
      from: req.user.id,
      to,
      score,
      comment,
    });

    res.status(201).json({ rating });
  } catch (err) {
    res.status(500).json({ error: "Could not submit rating", details: err.message });
  }
}

module.exports = { createRating };
