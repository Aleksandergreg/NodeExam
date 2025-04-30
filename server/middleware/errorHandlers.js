export function notFound(req, res) {
    res.status(404).send({ message: `Cannot ${req.method} ${req.path}` });
  }
  
  export function errorHandler(err, req, res, next) {
    console.error("Unhandled Error:", err.stack || err);
    res.status(err.status || 500)
       .send({ message: err.message || "Internal Server Error" });
  }
  