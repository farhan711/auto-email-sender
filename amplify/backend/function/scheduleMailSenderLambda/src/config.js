module.exports = function() {
    return {
        accessKeyId: process.env['accessKey'],
        secretAccessKey: process.env['secretAccessKey'],
        region: 'us-east-1',
        signatureVersion: 'v4'
      }
}
