const crypto = require('crypto').randomBytes(256).toString('hex'); // Provides cryptographic functionality (OpenSSL's hash, HMAC, cipher, decipher, sign and verify functions)

// Export config object
module.exports = {
  // uri: 'mongodb://localhost:27017/mean-angular-2', // Databse URI and database name
  uri: 'mongodb://test:@Aa123456@ds139459.mlab.com:39459/angular-2-app', // Databse URI production
  secret: crypto, // Cryto-created secret- crypto modul shifrovania
  // db: 'mean-angular-2' // Database name
  db: 'angular-2-app' // Database name from mLab
}
