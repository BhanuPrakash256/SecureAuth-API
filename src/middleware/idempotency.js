// In-memory store. In a multi-instance deployment, swap this Map for Redis.
const store = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;

const purgeExpired = () => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.timestamp > TTL_MS) store.delete(key);
  }
};

const idempotency = (req, res, next) => {
  purgeExpired();

  const key = req.headers['idempotency-key'];
  if (!key) return next();

  if (key.length > 255) {
    return res.status(400).json({ message: 'Idempotency-Key must be 255 characters or fewer.' });
  }

  const cached = store.get(key);
  if (cached) {
    res.setHeader('X-Idempotent-Replayed', 'true');
    return res.status(cached.statusCode).json(cached.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    store.set(key, { statusCode: res.statusCode, body, timestamp: Date.now() });
    res.json = originalJson;
    return originalJson(body);
  };

  next();
};

module.exports = idempotency;
