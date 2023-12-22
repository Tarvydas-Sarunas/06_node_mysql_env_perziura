const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};
// console.log('config ===', config);

// GET - /api/admin/populate-posts-table - supildo lentele
// sujungi sukurima ir supildyma i viena /api/admin/init

// suinstaliuoti dotenv
// sukurti .env
// DB_HOST, DB_USER...
// sukurti .evn.example
// .env i gitignore

// exportuoti dbConfig
module.exports = dbConfig;
