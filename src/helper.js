const mysql = require('mysql2/promise');
const dbConfig = require('./config');

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

// const [rows, err] = getDBData('SELECT * FROM `posts`');
// if (err) {
//   // klaida
// }

module.exports = {
  getDBData,
};
