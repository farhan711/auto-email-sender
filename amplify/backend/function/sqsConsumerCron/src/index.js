
const AWS = require('aws-sdk')
const AWSConfig = require('./config')
const sqs = new AWS.SQS(AWSConfig())
const lambda = new AWS.Lambda(AWSConfig())

/**
 * This lambda functions polls SQS after every 5 minutes. If gets the messages from the Queue (max 10 at a time). Checks their
 * sendAt (which is the user set scheduled time). If the time matches or is less than current time it invokes a another 
 * lambda:scheduleMailSenderLambda with the email payload. Seperate lambdas are invoked for each email 
 * 
 * VisibiltyTimeout is set to 300ms (5minutes). Whenever the message is being consumed no other can consume the same message for 
 * another 5 minutes to prevent duplication
 * 
 * 
 */
exports.handler = async (event, context) => {
    const qParams = {
        QueueUrl: process.env['queue_url'],
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 300
    }
    const messages = await sqs.receiveMessage(qParams).promise().catch(err => {
        context.fail(err)
        return
    })

    console.log('Messages From Queue:::::', messages)

    if (
        messages &&
        messages.Messages &&
        Array.isArray(messages.Messages) &&
        messages.Messages.length > 0
    ) {
        for (const m of messages.Messages) {
            const body = JSON.parse(m.Body)

            // compares the email scheduled time(sendAt) with the current time in milliseconds
            if (body.sendAt >= new Date().getTime()) {
                console.log(`Date Comparison:  Client  ${body.sendAt}  :::::  Server ${new Date().getTime()}`)
                const params = {
                    FunctionName: 'arn:aws:lambda:us-east-1:639695405324:function:scheduleMailSenderLambda-dev', /* required */
                    InvocationType: 'RequestResponse',
                    LogType: 'Tail',
                    Payload: JSON.stringify(m),
                };

                // invoke a seperate lambda for each message.
                const lambdaResult = await lambda.invoke(params).promise().catch(err => {
                    console.log('Error', err)
                    context.fail(err)
                    return
                })
                console.log('Lambda Invoked', lambdaResult)
            }
        }
        context.succeed('Lambda Invoked')
    }
};
