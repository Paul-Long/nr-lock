const crypto = require('crypto');

exports.random = function random() {
  return crypto.randomBytes(16).toString('hex');
};
