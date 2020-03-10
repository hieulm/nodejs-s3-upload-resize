const AWS = require('aws-sdk');
const config = require('config');
const stream = require('stream');

const awsConfig = new AWS.Config({
  accessKeyId: config.get('aws.access_key_id'),
  secretAccessKey: config.get('aws.secret_access_key'),
  region: config.get('aws.region'),
});

module.exports.listS3Objects = bucketName => {
  try {
    s3 = new AWS.S3(awsConfig);
    return new Promise((resolve, reject) => {
      s3.listObjects({ Bucket: bucketName }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  } catch (error) {
    throw error;
  }
};

// module.exports.streamImageFromClientToS3 = readStream => {
//   try {
//     S3 = new AWS.S3({ apiVersion: '2006-03-01' });
//     return;
//   } catch (error) {
//     return error;
//   }
// };

module.exports.writeStream = ({ Bucket, Key }, params) => {
  s3 = new AWS.S3(awsConfig);
  const passThrough = new stream.PassThrough();

  return {
    writeStream: passThrough,
    uploaded: s3
      .upload({
        ContentType: 'image/png',
        Body: passThrough,
        Bucket,
        Key,
        ...params,
      })
      .promise(),
  };
};

module.exports.streamImageFromS3ToClient = readStream => {
  try {
    return;
  } catch (error) {
    return error;
  }
};
