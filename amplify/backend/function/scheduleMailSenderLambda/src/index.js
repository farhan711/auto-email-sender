
const nodemailer = require('nodemailer')
const AWS = require('aws-sdk');
const AWSConfig = require('./config')

const s3 = new AWS.S3(AWSConfig())
const ses = new AWS.SES(AWSConfig())
const sqs = new AWS.SQS(AWSConfig())

const bucketName = process.env['s3_bucket']

/**
 * This lambda is invoked by sqsConsumerCron Lambda functions with the email payload. After the email is sent successfully 
 * this lambda takes care of deleting the message from SQS so it cannot be consumed again again.
 */
exports.handler = async (event, context) => {
    const body = JSON.parse(event.Body)
    const { subject, message, to, key } = body
    const { ReceiptHandle } = event

    console.log('Event Body Console', event.Body)
    console.log('Event Receipt Handle', ReceiptHandle)

    const data = await getObjectS3(bucketName, key).catch(err => {
        context.fail(err)
        return
    })

    const mailSent = await sendMail(subject, message, to, key, data.Body).catch(err => {
        context.fail(err)
        return
    })

    // if email is sent successfully the message is deleted from SQS to avoid duplication
    const qParams = {
        QueueUrl: process.env['queue_url'],
        ReceiptHandle: ReceiptHandle
    }
    await sqs.deleteMessage(qParams).promise()
    context.succeed(mailSent)
};

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
    return new Promise((resolve, reject) => {
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
            resolve({ info })
        })
    })
}
