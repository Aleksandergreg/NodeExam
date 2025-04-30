const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ];
  
  export default function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    );
  
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  }
  