module.exports = function(req, res, next) { // для защиты роутов если не авторизован
  if (!req.session.isAuthenticated) {
    return res.redirect('/auth/login')
  } 

  next()
}