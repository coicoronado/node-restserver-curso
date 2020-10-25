// ======================
// Puerto
// ======================
process.env.PORT = process.env.PORT || 3000;

// ======================
// Entorno
// ======================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ======================
// Vencimiento del Token
// ======================
// 60 sec
// 60 min
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


// ======================
// SEED de autenticación
// ======================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ======================
// Base de datos
// ======================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
  urlDB = 'mongodb://localhost:27017/cafe';
} else {
  urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// ======================
// Google Client Id
// ======================

process.env.CLIENT_ID = process.env.CLIENT_ID || '119163619921-38lltjdhvr08ta92esppr6rc6lqs15vb.apps.googleusercontent.com';