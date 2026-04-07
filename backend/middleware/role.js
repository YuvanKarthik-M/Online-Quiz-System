module.exports = function (roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied: ' + req.user.role + ' cannot perform this action' });
    }

    next();
  };
};
