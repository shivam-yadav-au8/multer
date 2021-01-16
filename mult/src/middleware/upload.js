const util = require("util");
const path = require("path");
const multer = require("multer");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const connectionUrl = 'mongodb://localhost:27017';
const databaseName = 'file-upload';
let fileToInsert = [];
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../../upload`));
  },
  filename: (req, file, callback) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      var message = `<strong>${file.originalname}</strong> is invalid. Only accept png/jpeg.`;
      return callback(message, null);
    }

    var filename = `${Date.now()}-shivam-${file.originalname}`;
    callback(null, filename);
    // console.log(path.join(`${__dirname}/../../upload`)+filename);
    fileToInsert.push({
      url:path.join(`${__dirname}/../../upload`)+filename
    })
    MongoClient.connect(connectionUrl, {useNewUrlParser: true}, (err, client) => {
      if(err) {
          return console.log("Unable to connect to db");
      }
      const db = client.db(databaseName);
      console.log("connected to db");
      db.collection('path').insertMany(fileToInsert, (err, res) => {
          if(err) console.log("unable to connect to db");
          console.log("insertMany-------", res);
      })
    });
  }
});

var uploadFiles = multer({ storage: storage }).array("multi-files", 10);
var uploadFilesMiddleware = util.promisify(uploadFiles);

// console.log(fileToInsert)
module.exports = uploadFilesMiddleware;