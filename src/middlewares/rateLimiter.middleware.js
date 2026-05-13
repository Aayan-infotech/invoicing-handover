import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
  message: {
    success: false,
    message: "Too many requests. Please try again after some time.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per window
  message: {
    success: false,
    message: "Too many login attempts. Please try again after some time.",
  },
});
