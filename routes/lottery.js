const controller = require('../controllers/lottery')

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })

  app.post('/userLogin', controller.userLogin)
  app.post('/checkLotteryInfo', controller.checkLotteryInfo)
  app.post('/withdraw', controller.withdraw)
  app.post('/deposit', controller.deposit)
  app.post('/submit', controller.partInLottery)
  app.post('/closeLottery', controller.closeLottery)
  app.post('/successWithdraw', controller.successWithdraw)
}