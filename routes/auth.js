const { Router } = require('express')
const router = Router()
const bcrypt = require('bcryptjs') // шифрование пароля
const User = require('../models/user')
const { registerValidators } = require('../utils/validators')
const { validationResult } = require('express-validator/check')

router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const candidate = await User.findOne({ email }) // при авторизации ищем пользователя по email

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password) // проверяем пароль из формы с паролем из бд
      if (areSame) {
        const user = candidate
        req.session.user = user
        req.session.isAuthenticated = true
        req.session.save(err => { // вызываем метод save, чтобы не было редиректа раньше привязки сессий
          if (err) {
            throw err
          } else {
            res.redirect('/')
          }
        })
      } else {
        req.flash('loginError', 'Неверный пароль')
        res.redirect('/auth/login#login')
      }
    } else {
      req.flash('loginError', 'Такого пользователя не существует')
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }


})

router.post('/register', registerValidators, async (req, res) => { // body - валидация полей
  try {
    const { email, password, name } = req.body // получаем поля формы

    const errors = validationResult(req)

    if (!errors.isEmpty()) { // если есть ошибки при валидации

      req.flash('registerError', errors.errors[0].msg)
      return res.status(422).redirect('/auth/login#register') // возвращаем статус ошибки
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email, name, password: hashPassword, cart: { items: [] }
    })
    await user.save()
    res.redirect('/auth/login#login')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router