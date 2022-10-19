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
  getTransactions,
  estimateSendToken,
  getNetworks,
} = require('./account.controller');

accountRoute.route('/gen').post(generate);
accountRoute.route('/login').post(login);
accountRoute.route('/new').post(isAuth, add);
accountRoute.route('/list').get(isAuth, getAccounts);
accountRoute.route('/networks').get(isAuth, getNetworks);

accountRoute.route('/tokens').post(isAuth, getTokens);
accountRoute.route('/tokens/new').post(isAuth, addToken);
accountRoute.route('/tokens/:chainId/:address').get(isAuth, getToken);

accountRoute
  .route('/transactions')
  .get(isAuth, getTransactions)
  .post(isAuth, sendToken);

accountRoute.route('/transactions/estimate').post(isAuth, estimateSendToken);

module.exports = accountRoute;
