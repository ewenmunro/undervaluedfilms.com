const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorization");

// USER
// retrieve user data
router.get("/", authorization, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT u.user_name, f.film_id, f.title, f.release_year, uf.not_heard_of_film, uf.not_seen_film, uf.film_score FROM users u LEFT JOIN films f ON u.user_id = f.user_id LEFT JOIN users_films uf ON u.user_id = uf.user_id WHERE u.user_id = $1",
      [req.user.id]
    );

    res.json(user.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// add a film
router.post("/addfilm", authorization, async (req, res) => {
  try {
    const { title, release_year } = req.body;

    // check if film exists
    const film = await pool.query(
      "SELECT * FROM films WHERE title = $1 AND release_year = $2",
      [title, release_year]
    );

    // if film exists throw error
    if (film.rows.length !== 0) {
      return res.status(401).send("Film already exists");
    }

    const newFilm = await pool.query(
      "INSERT INTO films (title, release_year) VALUES ($1, $2) RETURNING * ",
      [title, release_year]
    );

    res.json(newFilm.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// FILM RATING
// heard of film?
router.post("/heardoffilm", authorization, async (req, res) => {
  try {
    const { film_id, not_heard_of_film, not_seen_film } = req.body;

    const filmScore = await pool.query(
      "INSERT INTO users_films (user_id, film_id, not_heard_of_film, not_seen_film) VALUES ($1, $2, $3, $4) RETURNING * ",
      [req.user.id, film_id, not_heard_of_film, not_seen_film]
    );

    res.json(filmScore.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// score film
router.put("/scorefilm/:film", authorization, async (req, res) => {
  try {
    const { film } = req.params;
    const { not_seen_film, film_score } = req.body;

    const newFilmScore = await pool.query(
      "UPDATE users_films SET not_seen_film = $1, film_score = $2 WHERE user_id = $3 AND film_id = $4 RETURNING * ",
      [not_seen_film, film_score, req.user.id, film]
    );

    if (newFilmScore.rows.length === 0) {
      return res.json("Not the correct film score");
    }

    res.json("Film was updated");
  } catch (err) {
    console.error(err.message);
  }
});

// FILM LIST
// all films
router.get("/allfilms", authorization, async (req, res) => {
  try {
    const films = await pool.query("SELECT * FROM films");

    const allFilms = films.rows;

    res.json(allFilms);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// all users not heard of film
router.get("/allusersnotheardoffilm", authorization, async (req, res) => {
  try {
    const { film_id } = req.body;

    const usersNotHeardOfFilm = await pool.query(
      "SELECT COUNT (not_heard_of_film) FROM users_films WHERE user_id = $1 AND film_id = $2",
      [req.user.id, film_id]
    );

    const allUsersNotHeardOfFilm = usersNotHeardOfFilm.rows[0];

    res.json(allUsersNotHeardOfFilm);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// all users not seen film
router.get("/allusersnotseenfilm", authorization, async (req, res) => {
  try {
    const { film_id } = req.body;

    const usersNotSeenFilm = await pool.query(
      "SELECT COUNT (not_seen_film) FROM users_films WHERE user_id = $1 AND film_id = $2",
      [req.user.id, film_id]
    );

    const allUsersNotSeenFilm = usersNotSeenFilm.rows[0];

    res.json(allUsersNotSeenFilm);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// all users who have scored the film
router.get("/allusersscoredfilm", authorization, async (req, res) => {
  try {
    const { film_id } = req.body;

    const usersScoredFilm = await pool.query(
      "SELECT COUNT (film_score) FROM users_films WHERE user_id = $1 AND film_id = $2",
      [req.user.id, film_id]
    );

    const allUsersScoredFilm = usersScoredFilm.rows[0];

    res.json(allUsersScoredFilm);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// users's total score for the film
router.get("/alluserstotalscoreforfilm", authorization, async (req, res) => {
  try {
    const { film_id } = req.body;

    const usersTotalScoreForFilm = await pool.query(
      "SELECT SUM (film_score) FROM users_films WHERE user_id = $1 AND film_id = $2",
      [req.user.id, film_id]
    );

    const allUsersTotalScoreForFilm = usersTotalScoreForFilm.rows[0];

    res.json(allUsersTotalScoreForFilm);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
