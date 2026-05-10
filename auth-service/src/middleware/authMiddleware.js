const jwt = require("jsonwebtoken");

const authMiddleware = (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token requerido",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        error: "Token invalido: falta userId",
      });
    }

    next();
  } catch (error) {
    console.error(
      "[JWT ERROR]",
      error.message
    );

    return res.status(401).json({
      success: false,
      error: "Token invalido",
    });
  }
};

module.exports = authMiddleware;
