const express = require('express')
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars') // для генерации автоматических html страниц
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const mongoose = require('mongoose')
const path = require('path')
const User = require('./models/user')

const app = express()

// routers
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
}))

app.set('view engine', 'hbs') // используем его
app.set('views', 'views') // папка с html

app.use(async (req, res, next) => { // свой middleware
  try {
    const user = await User.findById('602d0a9ac59ea1387c93f85a')
    req.user = user
    next() // для возможности дальнейшего вызова app.use
  } catch (e) {
    console.log(e)
  }
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: false}))
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)

const PORT = process.env.PORT || 3001

async function start() {
  try {
    const url = 'mongodb://localhost:27017/node-course?readPreference=primary&appname=MongoDB%20Compass&ssl=false'
    
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    const candidate = await User.findOne() // проверяем есть ли в БД хоть 1 пользователь
    if (!candidate) {
      const user = new User({
        email: 'asmkk@mail.ru',
        name: 'Alex',
        cart: {items:[]}
      })
      await user.save()
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  } catch(e) {
    console.log(e)
  }
}

start()