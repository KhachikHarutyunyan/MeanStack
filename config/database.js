const crypto = require('crypto').randomBytes(256).toString('hex'); // Provides cryptographic functionality (OpenSSL's hash, HMAC, cipher, decipher, sign and verify functions)

// Export config object
module.exports = {
  // uri: 'mongodb://localhost:27017/mean-angular-2', // Databse URI and database name
  uri: 'mongodb://test:test@ds227110.mlab.com:27110/mean-blog', // Databse URI production
  secret: crypto, // Cryto-created secret- crypto modul shifrovania
  // db: 'mean-angular-2' // Database name
  db: 'mean-blog' // Database name from mLab
}
