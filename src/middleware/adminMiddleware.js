
const adminMiddleware = (req, res, next) => {
    if (!req.profile || req.profile.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }

    next();
};

export default adminMiddleware;
