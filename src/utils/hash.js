//Checking the crypto module
const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; //Using AES encryption

//Encrypting text
function encrypt(text) {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(process.env.SECRET_KEY, 'hex'),
    Buffer.from(process.env.SECRET_KEY_IV, 'hex'),
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

// Decrypting text
function decrypt(encryptedData) {
  const _encryptedText = Buffer.from(encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(process.env.SECRET_KEY, 'hex'),
    Buffer.from(process.env.SECRET_KEY_IV, 'hex'),
  );
  let decrypted = decipher.update(_encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  encrypt,
  decrypt,
};
