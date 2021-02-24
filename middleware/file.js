const multer = require('multer') // для загрузки файлов

const storage = multer.diskStorage({
  destination(req, file, cb) { // указываем куда сохранить
    cb(null, './images') // первый параметр cb() - ошибки, если есть
  },
  filename(req, file, cb) { // указываем как переименовать файл
    cb(null, file.originalname) // в идеале устанавить уникальный префикс
  }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const fileFilter = (req, file, cb) => { // валидация файла
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

module.exports = multer({
  storage, fileFilter
})