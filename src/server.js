require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dbConfig = require('./config');
const { getDBData, dbQueryWithData } = require('./helper');

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

// GET /api/posts - Gauti visus posts panaudojant helper funkcija
app.get('/api/posts', async (req, res) => {
  const sql = 'SELECT * FROM `posts`';
  const [rows, error] = await getDBData(sql);

  console.log('error ===', error);

  if (error) {
    // turim klaida
    console.log(error);
    console.log('klaida sukurti posta');
    res.status(500).json({
      msg: 'Something went wrong',
    });
    return;
  }
  // klaidu nera turim atsakyma is duomenu bazes
  res.json(rows);
});

// GET /api/posts/:Id - Gauti visus posts panaudojant helper funkcija
app.get('/api/posts/:Id', async (req, res) => {
  const sql = 'SELECT * FROM `posts` WHERE post_id=?';
  const id = +req.params.Id;

  const [rows, error] = await dbQueryWithData(sql, [id]);

  if (error) {
    // turim klaida
    console.log(error);
    console.log('klaida sukurti posta');
    res.status(500).json({
      msg: 'Something went wrong',
    });
    return;
  }
  if (rows.length === 1) {
    res.json(rows[0]);
    return;
  }
  if (rows.length === 0) {
    res.status(404).json('not found');
    return;
  }
  // klaidu nera turim atsakyma is duomenu bazes
  res.status(500).json('something was wrong');
});

// CREATE api/posts/ sukurti posta
app.post('/api/posts', async (req, res) => {
  // pasijamu ka sudeti i table is body

  // const title = req.body.title;
  // const author = req.body.author;
  // const date = req.body.date;
  // const body = req.body.body;

  // pitma pavyzdy kadangi daug pasiemimo is bodzio mes heriau destrukturizuojame
  const { title, author, date, body } = req.body;

  // galime tureti validacijas
  if (title.trim() === '') {
    res.status(400).json({
      err: 'title is required',
    });
    return;
  }

  // kuriu konekcion
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const sql = `INSERT INTO posts 
    (title, author, date, body) 
    VALUES (?, ?, ?, ?)`;
    const [rows] = await conn.execute(sql, [title, author, date, body]);
    if (rows.affectedRows === 1) {
      res.sendStatus(201);
      return;
    }
    res.json({ msg: 'no affected rows' });
  } catch (error) {
    // jei yra klaida tai klaidos blokas
    console.log(error);
    console.log('klaida sukurti posta');
    res.status(500).json({
      msg: 'Something went wrong',
    });
  } finally {
    // atsijungti nuo DB jei prisijungimas buvo
    if (conn) conn.end();
  }
});

// DELETE -/api/posts/:pID -delete post
app.delete('/api/posts/:pID', async (req, res) => {
  let conn;
  const pId = +req.params.pID;
  try {
    conn = await mysql.createConnection(dbConfig);
    const delSQL = `
    DELETE FROM posts 
    WHERE post_id=?
    LIMIT 1
    `;
    // vykdyti uzklausa
    const [rezObj] = await conn.execute(delSQL, [pId]);
    if (rezObj.affectedRows !== 0) {
      res.sendStatus(202);
      return;
    }
    res.json({ msg: 'no affected rows' });
  } catch (error) {
    // jei yra klaida tai klaidos blokas
    console.log(error);
    console.log('klaida sukurti posta');
    res.status(500).json({
      msg: 'Something went wrong',
    });
  } finally {
    // atsijungti nuo DB jei prisijungimas buvo
    if (conn) conn.end();
  }
});

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
