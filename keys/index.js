if (process.env.NODE_ENV === 'production') { // NODE_ENV - добавляется хостинг провайдером
  module.exports = require('./keys.prod')
} else {
  module.exports = require('./keys.dev')
}