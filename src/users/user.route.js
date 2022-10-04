const userRoute = require('express').Router();

const { register, login } = require('./user.controller');

const { isAuth, hasRole } = require('../middlewares');
const { Roles } = require('../constants');

userRoute.route('/register').post(register);
userRoute.route('/login').post(login);

module.exports = userRoute;
