// database
CREATE DATABASE undervaluedfilms;

// tables
CREATE TABLE users(
    user_id uuid DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE films(
    film_id SERIAL,
    user_id uuid,
    title VARCHAR(255) NOT NULL,
    release_year INT NOT NULL,
    PRIMARY KEY (film_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE
);

CREATE TABLE users_films(
    user_id uuid NOT NULL,
    film_id INT NOT NULL,
    not_heard_of_film BOOLEAN,
    not_seen_film BOOLEAN,
    film_score SMALLINT,
    PRIMARY KEY (user_id, film_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE,
    FOREIGN KEY (film_id) REFERENCES films(film_id) ON UPDATE CASCADE
);