const express = require('express')
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars') // для генерации автоматических html страниц
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session) // связь сессий с бд // возвращает класс
const csrf = require('csurf') // csrf защита приложения
const flash = require('connect-flash') // передача ошибок в формах через сессии

const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')

const app = express()

// routers
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')

const keys = require('./keys')

const PORT = process.env.PORT || 3001

const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI
})

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs-helpers') // для задания новый функций для handlebars
}))

app.set('view engine', 'hbs')
app.set('views', 'views') // папка с html

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: false}))
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))
app.use(csrf())
app.use(flash())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)


async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  } catch(e) {
    console.log(e)
  }
}

start()