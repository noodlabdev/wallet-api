const { Roles } = require('../constants');

const hasRole = (roles) => (req, res, next) => {
  const roleValues = Object.values(Roles);
  if (
    !roles?.length ||
    [...new Set([...roles, ...roleValues])].length > roleValues.length
  )
    return res.status(400).send('ROLE: Invalid');

  const roleAccept = roles.reduce((r, acc) => r * acc, 1);

  if (req.user.role % roleAccept === 0) return next();

  return res.status(401).send('Unauthorized');
};

module.exports = hasRole;
