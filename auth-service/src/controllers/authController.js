const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/jwt');

const SALT_ROUNDS = 10;

const buildResponse = (success, messageOrError, data = null) => {
  const response = {
    success,
    timestamp: new Date().toISOString(),
  };

  if (success) {
    response.message = messageOrError;
    if (data) response.data = data;
  } else {
    response.error = messageOrError;
  }

  return response;
};

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json(
        buildResponse(false, 'Nombre, email y contraseña son requeridos')
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json(
        buildResponse(false, 'El email ya está registrado')
      );
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await User.create({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      rol: rol || 'ciudadano',
    });

    const token = generateToken(newUser);

    return res.status(201).json(
      buildResponse(true, 'Usuario registrado correctamente', {
        token,
        user: newUser.toJSON(),
      })
    );
  } catch (error) {
    console.error('Error en registro:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json(buildResponse(false, messages.join(', ')));
    }

    if (error.code === 11000) {
      return res.status(409).json(buildResponse(false, 'El email ya está registrado'));
    }

    return res.status(500).json(buildResponse(false, 'Error interno del servidor'));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(
        buildResponse(false, 'Email y contraseña son requeridos')
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json(
        buildResponse(false, 'Credenciales inválidas')
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json(
        buildResponse(false, 'Credenciales inválidas')
      );
    }

    const token = generateToken(user);

    return res.status(200).json(
      buildResponse(true, 'Login exitoso', {
        token,
        user: user.toJSON(),
      })
    );
  } catch (error) {
    console.error('Error en login:', error.message);
    return res.status(500).json(buildResponse(false, 'Error interno del servidor'));
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json(buildResponse(false, 'Usuario no encontrado'));
    }

    return res.status(200).json(
      buildResponse(true, 'Perfil obtenido', { user: user.toJSON() })
    );
  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
    return res.status(500).json(buildResponse(false, 'Error interno del servidor'));
  }
};

module.exports = {
  register,
  login,
  getMe,
};
