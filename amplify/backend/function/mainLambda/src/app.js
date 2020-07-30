const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AWS = require('aws-sdk');
const AWSConfig = require('./config')
const s3 = new AWS.S3(AWSConfig())
const ses = new AWS.SES(AWSConfig())
const sqs = new AWS.SQS(AWSConfig())

const bucketName = process.env['s3_bucket']

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

// gets the object from S3 bucket
function getObjectS3(bucket, key) {
  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket: bucket, Key: `uploads/${key}` }, function (err, data) {
      if (err) {
        console.log('S3 Get Object Error', err)
        reject(err)
      } else {
        resolve(data)
      }

    })
  })
}


function sendMail(subject, message, to, key, attachment) {
  return new Promise((resolve,reject) => {
    const mailOptions = {
      from: process.env['senderEmail'],
      subject: subject,
      html: message,
      to,
      attachments: [
        {
          filename: key,
          content: attachment
        }
      ]
    };
  
    const transporter = nodemailer.createTransport({ SES: ses })
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log('Email Error', err)
        reject(err)
        return
      }
      resolve({info})
    })
  })
}

app.post('/send-email', async function (req, res) {
  const { subject, to, message, key } = req.body


  const data = await getObjectS3(bucketName, key).catch(err => {
    res.status(500).send(err)
    return
  })

  const mailSent = await sendMail(subject,message,to, key, data.Body).catch(err=> {
    res.status(500).send(err)
    return
  })

  console.log('Mail Sent!', mailSent)
  res.json({success: 'Email Sent!'})
});


app.post('/schedule-email', function (req, res) {
  const { subject, to, message, key, sendAt } = req.body
  
  const params = {
    MessageBody: JSON.stringify({ subject, to, message, key, sendAt }),
    QueueUrl: process.env['queue_url'],
    DelaySeconds: 0
  }
  sqs.sendMessage(params, function(err,data) {
    if(err){
      console.log('SQS Error', err)
      res.status(500).send(err)
      return
    }
    res.json({success: 'Scheduled Email Success!', url: req.url, data})
  })
});


app.post('/preSignedURL', function (req, res) {
 
  const key = `uploads/${req.body.name}`

  const params = {
    Bucket: bucketName,
    Key: key,
    ACL: 'public-read',
    ContentType: req.body.filetype
  };

  s3.getSignedUrl('putObject', params, (error, url) => {
    if (error) {
      console.log('error:', error)
      res.status(500).send(error)
      return;
    } else {
      res.json({
        success: 'Request Successful',
        url: req.url,
        signedUrl: url,
        name: key,
        filetype: req.body.filetype
      });
    }
  })
});

app.listen(3000, function () {
  console.log('API Started')
})

module.exports = app
