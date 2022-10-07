const trim = require('lodash/trim'); // eslint-disable-line import/no-unresolved

const accountRoute = require('./accounts/account.route');

const baseApiPath = '/api/v1';

const genPath = (path) => `${baseApiPath}/${trim(path, '/')}`;

const routes = [{ path: '/accounts/', handler: accountRoute }];

const setupRoutes = (app) => {
  routes.forEach((r) => app.use(genPath(r.path), r.handler));
  return app;
};

module.exports = setupRoutes;
