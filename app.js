//express
var express = require('express')
var app = express()

//初始化mongodb
var MongoClient = require('mongodb').MongoClient
var url = "mongodb://127.0.0.1:27017/myapp"
var dbase
MongoClient.connect(url, function(err, db) {
  if (err) {
    db.close()
    throw err
  }
  console.log("数据库已创建!")
  dbase = db.db('myapp')
  dbase.createCollection('traffic',function(err,res) {
    if (err) {
      db.close()
      throw err
    }
    console.log("创建流量统计集合");
  })
})

//流量统计
app.get('/traffic', async (req, res) => {
  var originIp = req.get('x-forwarded-for') //undefined,nginx待配置
  var whereStr = {'originIp':originIp}
  var originResult = await dbase.collection('traffic').find(whereStr).toArray()
  if(originResult.length==0){
    var insertData = {'originIp':originIp,'date':new Date().getDate()}
    await dbase.collection('traffic').insertOne(insertData)
  }
  var dateResult = await dbase.collection('traffic').find({'date':new Date().getDate()}).count()
  res.send(dateResult)
})

var server = app.listen(8081, function () {
 var host = server.address().address
 var port = server.address().port
 console.log(`应用实例，访问地址为 http:${host}:${port}"`)
})