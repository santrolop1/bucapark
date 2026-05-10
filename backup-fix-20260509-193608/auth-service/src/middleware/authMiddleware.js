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

    console.log(
      "[DEBUG TOKEN]",
      token
    );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      "[DEBUG DECODED]",
      decoded
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "[JWT ERROR]",
      error.message
    );

    return res.status(401).json({
      success: false,
      error: "Token inválido",
    });
  }
};

module.exports = authMiddleware;