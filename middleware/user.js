const User = require('../models/user')

module.exports = async function(req, res, next) { // привязываем модель к req.user
  if (!req.session.user) {
    return next()
  }
  req.user = await User.findById(req.session.user._id)
  next()
}