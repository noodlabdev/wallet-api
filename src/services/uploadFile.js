const path = require('path');
const multer = require('multer');

exports.uploadFile = multer({ dest: path.join('public', 'files') });
