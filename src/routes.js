const trim = require('lodash/trim'); // eslint-disable-line import/no-unresolved

const userRoute = require('./users/user.route');

const baseApiPath = '/api/v1';

const genPath = (path) => `${baseApiPath}/${trim(path, '/')}`;

const routes = [{ path: '/users/', handler: userRoute }];

const setupRoutes = (app) => {
  routes.forEach((r) => app.use(genPath(r.path), r.handler));
  return app;
};

module.exports = setupRoutes;
