const { verifyToken } = require("../services/authService");

/** Attaches req.user = { id, role } if token is valid, else 401. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed token" });
  }

  try {
    const token = header.split(" ")[1];
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Restricts a route to specific roles. Use after requireAuth.
 * Example: router.patch("/:id/accept", requireAuth, requireRole("driver"), ...)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized for this action" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
