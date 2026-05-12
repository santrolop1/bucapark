const jwt = require('jsonwebtoken');

const authMiddleware = (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {

      return res.status(401).json({
        success: false,
        error: 'Token requerido',
      });
    }

    const token =
      authHeader.split(' ')[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      error: 'Token inválido',
    });
  }
};

const requireRole = (
  ...roles
) => {

  return (
    req,
    res,
    next
  ) => {

    if (
      !roles.includes(
        req.user.rol
      )
    ) {

      return res.status(403).json({
        success: false,
        error: 'No autorizado',
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};
