const crypto = require('crypto');

exports.random = function () {
  return crypto.randomBytes(16).toString('hex');
};
