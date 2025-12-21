const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter for general API endpoints
const generalRateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 15 * 60, // per 15 minutes
});

// Rate limiter for auth endpoints (less strict during dev)
const authRateLimiter = new RateLimiterMemory({
  points: 30, // 30 requests
  duration: 15 * 60, // per 15 minutes
});

// Rate limiter for complaint submission
const complaintRateLimiter = new RateLimiterMemory({
  points: 5, // 5 complaints
  duration: 60 * 60, // per hour
});

exports.rateLimiter = async (req, res, next) => {
  // Disable rate limiting in development to avoid blocking local testing
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  try {
    let rateLimiter;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Choose rate limiter based on route
    if (req.path.startsWith('/api/auth')) {
      rateLimiter = authRateLimiter;
    } else if (req.path.startsWith('/api/complaints') && req.method === 'POST') {
      rateLimiter = complaintRateLimiter;
    } else {
      rateLimiter = generalRateLimiter;
    }

    await rateLimiter.consume(ip);
    next();
  } catch (rateLimiterRes) {
    // rateLimiterRes may contain msBeforeNext or remaining points
    const retrySecs = rateLimiterRes && rateLimiterRes.msBeforeNext
      ? Math.ceil(rateLimiterRes.msBeforeNext / 1000)
      : 60;
    res.set('Retry-After', String(retrySecs));
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfterSeconds: retrySecs,
    });
  }
};