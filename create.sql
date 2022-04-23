DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS users;
CREATE TABLE users(
    user_id       INT NOT NULL UNIQUE AUTO_INCREMENT,
    username      VARCHAR(10),
    email         VARCHAR(30) UNIQUE,
    password      VARCHAR(65),
    phone         VARCHAR(13) UNIQUE ,
    is_registered BOOLEAN DEFAULT false,
    is_archived   BOOLEAN DEFAULT false,
    is_admin      BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id)
);

CREATE UNIQUE INDEX email_index ON users(email);

CREATE TABLE room(
    room_id       INT UNIQUE AUTO_INCREMENT,
    seller        INT NOT NULL,
    description   VARCHAR(200),
    is_available  BOOLEAN DEFAULT true,
    is_verified   BOOLEAN DEFAULT true,
    is_archived   BOOLEAN DEFAULT false,
    is_negotiable BOOLEAN DEFAULT false,
    room_count    INT,
    price         INT,
    location      VARCHAR(20),
    FOREIGN KEY   (seller) REFERENCES users(user_id)
);

CREATE TABLE application(
    id        INT UNIQUE AUTO_INCREMENT,
    room      INT NOT NULL,
    applicant INT NOT NULL,
    query     VARCHAR(200),
    sold      BOOLEAN DEFAULT false,
    ts        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT false,
    FOREIGN KEY   (applicant) REFERENCES users(user_id),
    FOREIGN KEY   (room) REFERENCES room(room_id)
);