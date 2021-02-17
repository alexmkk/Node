const path = require('path')
const fs = require('fs')

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'card.json'
)

class Card {
  static async add(course) {
    const card = await Card.fetch()

    const idx = card.courses.findIndex(c => c.id === course.id)
    const candidate = card.courses[idx]
    // проверяем есть ли в корзине данный курс, если есть, то увеличивем его count на 1
    if (candidate) {
      candidate.count++
      card.courses[idx] = candidate
    } else {
      course.count = 1
      card.courses.push(course)  
    }

    card.price += +course.price

    return new Promise((resolve, reject) => {
      fs.writeFile(p, JSON.stringify(card), err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  static async fetch() {
    return new Promise((resolve, reject) => {
      fs.readFile(p, 'utf-8', (err, content) => {
        if(err) {
          reject(err)
        } else {
          resolve(JSON.parse(content))
        }
      })
    })
  }

  static async remove(id) {
    const card = await Card.fetch()
    const idx = card.courses.findIndex(c => c.id === id)
    const course = card.courses[idx]

    card.price -= +course.price

    if (course.count === 1) {
      // если 1 курс, то удалить
      card.courses = card.courses.filter(c => c.id !== id)
    } else {
      // либо уменьшить количество
      course.count--
    }
    
    
    return new Promise((resolve, reject) => {
      fs.writeFile(p, JSON.stringify(card), err => {
        if (err) {
          reject(err)
        } else {
          resolve(card)
        }
      })  
    })  
  }

}

module.exports = Card