require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dbConfig = require('./config');

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ROUTES
app.get('/', (req, res) => {
  res.send('Hello World');
});

// GET - /api/admin/create-table tai sukuria lentele DOM BAZEJE
app.get('/api/admin/create-table', async (req, res) => {
  let conn;
  try {
    // prisijungti prie DB
    conn = await mysql.createConnection(dbConfig);
    // kokio veiksmo atlikimas
    const sql = `CREATE TABLE posts 
    (
      post_id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
      title VARCHAR(255) NOT NULL, 
      author VARCHAR(255) NOT NULL, 
      date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP, 
      body TEXT NOT NULL, 
      PRIMARY KEY (post_id)
    ) ENGINE = InnoDB;`;
    // veiksmo vykdymas
    const [rows] = await conn.query(sql);
    // graziname rezultata
    res.json(rows);
  } catch (error) {
    // jei yra klaida tai klaidos blokas
    console.log(error);
    console.log('klaida get posts');
    res.status(500).json({
      msg: 'Something went wrong',
    });
  } finally {
    // atsijungti nuo DB jei prisijungimas buvo
    if (conn) conn.end();
  }
});

// GET - /api/admin/populate-posts-table supildo lentele DOMBAZES SUKURTOJE LENTELEJE
app.get('/api/admin/populate-posts-table', async (req, res) => {
  let conn;
  try {
    // prisijungti prie DB
    conn = await mysql.createConnection(dbConfig);
    // kokio veiksmo atlikimas
    const sql = `INSERT INTO posts (title, author, date, body) VALUES
    ('Post 1', 'James Band', '2023-12-20', 'This is body of Post 1'),
    ('Post 2', 'Jane Dow', '2023-12-01', 'Body of post 2'),
    ('POST 3', 'James Band', '2023-12-04', 'Body about post 3'),
    ('Post 4', 'Mike T', '2023-12-14', 'Post about Boxing from T. '),
    ('Post 5', 'Mike T', '2023-12-15', 'Post about Boxing from T. '),
    ('Post 6', 'Jane Dow', '2023-11-05', 'Post 6 about Jane');`;
    // veiksmo vykdymas
    const [rows] = await conn.query(sql);
    // graziname rezultata
    res.json(rows);
  } catch (error) {
    // jei yra klaida tai klaidos blokas
    console.log(error);
    console.log('klaida get posts');
    res.status(500).json({
      msg: 'Something went wrong',
    });
  } finally {
    // atsijungti nuo DB jei prisijungimas buvo
    if (conn) conn.end();
  }
});

// GET - /api/admin/init sukuria lentele is supildo ja DOMBAZEje
app.get('/api/admin/init', async (req, res) => {
  let conn;
  try {
    // prisijungti prie DB
    conn = await mysql.createConnection(dbConfig);
    // psakom kaip sukurti lentele
    const sql = `CREATE TABLE IF NOT EXISTS posts 
    (
      post_id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
      title VARCHAR(255) NOT NULL, 
      author VARCHAR(255) NOT NULL, 
      date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP, 
      body TEXT NOT NULL, 
      PRIMARY KEY (post_id)
    ) ENGINE = InnoDB;`;
    // sukuriam lentele
    const [rowsAfterCreate] = await conn.query(sql);
    // supildom lentele
    // pasakome ka supildyti joje
    const sqlTableInfo = `INSERT INTO posts (title, author, date, body) VALUES
    ('Post 1', 'James Band', '2023-12-20', 'This is body of Post 1'),
    ('Post 2', 'Jane Dow', '2023-12-01', 'Body of post 2'),
    ('POST 3', 'James Band', '2023-12-04', 'Body about post 3'),
    ('Post 4', 'Mike T', '2023-12-14', 'Post about Boxing from T. '),
    ('Post 5', 'Mike T', '2023-12-15', 'Post about Boxing from T. '),
    ('Post 6', 'Jane Dow', '2023-11-05', 'Post 6 about Jane');`;
    // sukuriu uzpildima
    const [rowsAfterFill] = await conn.query(sqlTableInfo);
    // patikrinti ar prisidejo ir graziname rezultata
    if (rowsAfterFill.affectedRows > 0) {
      res.json({
        msg: 'table and rows created',
      });
      return;
    }
    throw new Error('no row affected');
  } catch (error) {
    // jei yra klaida tai klaidos blokas
    console.log(error);
    console.log('klaida get posts');
    res.status(500).json({
      msg: 'Something went wrong',
    });
  } finally {
    // atsijungti nuo DB jei prisijungimas buvo
    if (conn) conn.end();
  }
});

// CREATE api/posts/ sukurti posta
app.post('');

// 404
app.use((req, res) => {
  res.status(404).json({
    msg: 'path not found',
  });
});

// app.listen(PORT);
app.listen(PORT, () => {
  console.log(`Server runing on http://localhost:${PORT}`);
});
