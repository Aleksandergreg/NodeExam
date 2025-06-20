export function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).send({ message: "Unauthorized. Please log in." });
  }
  
  export function isAdmin(req, res, next) {
    if (req.session && req.session.userRole === 'admin') {
      return next();
    }
    return res.status(403).send({ message: "Forbidden. Admin privileges required." });
  }
  