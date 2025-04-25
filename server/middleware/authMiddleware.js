export function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.status(401).send({ message: "Unauthorized. Please log in." });
    }
}

export function isAdmin(req, res, next) {

    const hardcodedAdminUserId = 'user1'; 

    if (req.session && req.session.userId === hardcodedAdminUserId) {
        req.isAdmin = true; 
        return next();
    } else {
         res.status(403).send({ message: "Forbidden. Admin privileges required." });
    }
}