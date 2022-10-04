const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const { registerSchema, loginSchema } = require('./user.validation');

const { User } = require('./user.model');
const { sendMail } = require('../services/sendMail');
const { EmailTypes } = require('../constants');
const catchReqRes = require('../utils/catchReqRes');

const register = catchReqRes(async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = await argon2.hash(password);
  const user = new User({
    name,
    email,
    password: hashPassword,
  });
  await Promise.all([user.save(), sendMail(email, EmailTypes.REGISTER)]);

  return res.json(user);
});

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ email: 'user does not exists' });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(400).json({ password: 'password is wrong' });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = await jwt.sign(payload, process.env.SECRET_KEY_JWT, {
      expiresIn: '1d',
    });

    return res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  register,
  login,
};
