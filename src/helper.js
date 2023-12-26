const mysql = require('mysql2/promise');
const dbConfig = require('./config');

// pagalbine funkcija paiimti visus postus
async function getDBData(sql) {
  let conn;
  try {
    // prisijungti pre DB
    conn = await mysql.createConnection(dbConfig);
    // ka noriu padaryti
    // const sql = 'SELECT * FROM `posts`';
    // vykdyti auksciau aprasyta nora
    const [rows] = await conn.query(sql);
    // ir jei noras ivykditas pranesti
    return [rows, null];
  } catch (error) {
    // jei yra klaida tai klaidos blokas
    return [null, error];
  } finally {
    // atsijungti nuo DB jei prisijungimas buvo
    if (conn) conn.end();
  }
}

// pagalbine funkcija paiimti viena posta
async function dbQueryWithData(sql, argArr = []) {
  let conn;
  try {
    // prisijungti pre DB
    conn = await mysql.createConnection(dbConfig);
    // ka noriu padaryti
    // const sql = 'SELECT * FROM `posts`';
    // vykdyti auksciau aprasyta nora
    const [rows] = await conn.execute(sql, argArr);
    // ir jei noras ivykditas pranesti
    return [rows, null];
  } catch (error) {
    // jei yra klaida tai klaidos blokas
    return [null, error];
  } finally {
    // atsijungti nuo DB jei prisijungimas buvo
    if (conn) conn.end();
  }
}

// const [rows, err] = getDBData('SELECT * FROM `posts`');
// if (err) {
//   // klaida
// }

module.exports = {
  getDBData,
  dbQueryWithData,
};
