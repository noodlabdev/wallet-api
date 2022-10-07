const accountRoute = require('express').Router();

const { isAuth } = require('../middlewares');
const {
  generate,
  login,
  add,
  getAccounts,
  addToken,
  getTokens,
  getToken,
  sendToken,
} = require('./account.controller');

accountRoute.route('/gen').post(generate);
accountRoute.route('/login').post(login);
accountRoute.route('/new').post(isAuth, add);
accountRoute.route('/list').get(isAuth, getAccounts);

accountRoute.route('/tokens').get(isAuth, getTokens).post(isAuth, addToken);
accountRoute.route('/tokens/:address').get(isAuth, getToken);

accountRoute.route('/transactions').post(isAuth, sendToken);

module.exports = accountRoute;
