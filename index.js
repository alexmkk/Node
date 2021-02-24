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
const helmet = require('helmet')
const compression = require('compression')

const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const fileMiddleware = require('./middleware/file')

const app = express()

// routers
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')

const keys = require('./keys')
const errorHandler = require('./middleware/errors')

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
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(express.urlencoded({extended: false}))
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))

app.use(fileMiddleware.single('avatar')) // single - 1 файл, avatar - название поля формы

app.use(csrf())
app.use(flash())
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        "img-src" : ["'self'", 'https://upload.wikimedia.org/', 'data:'],
      },
    },
  })
)
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)


app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler)


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