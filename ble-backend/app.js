var express = require('express');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('./mongoConfig');
const Influx = require('influx');
var { beaconModel } = require('./models/staticBeacons');
const influx = new Influx.InfluxDB('http://admin:admin@10.78.32.157:8086/RTLS_Engine');


//rtlss_ble_details

var app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send("IT WORKS!!!!");
})

app.get('/getLatestPosition', (req, res) => {
    influx.query('select * from RTLSS_BLE_DETAILS order by time desc limit 1').then(results => {
        res.json(results)
      })
})
app.post('/addBeacon', (req, res) => {
    var data = req.body.data;
    var saveObj = new beaconModel(data);
    saveObj.save((err, saved) => {
        if(err){
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
});

app.get('/getbeacons', (req, res) => {
    beaconModel.find({}, (err, beacons) => {
        if(err){
            res.json({success: false})
        } else {
            res.json({
                success: true,
                beacons
            })
        }
    })
} )

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('Ki gal kaka galat url pai jana');
});

app.listen(process.env.PORT || 3000, function (req, res) {
    console.log("server started successfully");
});