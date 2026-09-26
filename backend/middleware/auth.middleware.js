const { verifyToken } = require("../services/authService");
const { sendError } = require("../services/apiResponse");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, "Missing or malformed token", 401);
  }

  try {
    const token = header.split(" ")[1];
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Not authorized for this action", 403);
    }
    return next();
  };
}

const requireRider = requireRole("rider");
const requireDriver = requireRole("driver");

module.exports = { requireAuth, requireRole, requireRider, requireDriver };
