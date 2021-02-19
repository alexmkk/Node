const {Router} = require('express')
const Course = require('../models/course')
const router = Router()
const auth = require('../middleware/auth')

router.get('/', async (req, res) => {
  const courses = await Course.find() // метод find без параметров позволяет выбрать все записи
    .populate('userId', 'email name') // позволяет выбрать только необходимые поля
  
  res.render('courses', {
    title: 'Курсы',
    isCourses: true,
    courses
  })
})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  const course = await Course.findById(req.params.id)

  res.render('course-edit',{
    title: `Редактировать ${course.title}`,
    course
  })
})

router.post('/edit', auth, async (req, res) => {
  const {id} = req.body
  delete req.body.id

  await Course.findByIdAndUpdate(id, req.body) // находим нужную запись и заменяем новыми данными, кроме id
  res.redirect('/courses')
})

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id)
  res.render('course',{
    layout: 'empty',
    title: `Курс ${course.title}`,
    course
  })
})

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({_id: req.body.id})
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
  
})

module.exports = router