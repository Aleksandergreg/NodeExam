CREATE TABLE races (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  year INT NOT NULL,
  nation VARCHAR(255)
);

CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    race_id INT REFERENCES races(id) ON DELETE CASCADE,
    "position" INT,
    rider VARCHAR(255),
    team VARCHAR(255)
);

-- Seed data
INSERT INTO races (name, year, nation) VALUES
('Tour de France', 2023, 'France'),
('Giro d''Italia', 2023, 'Italy'),
('Vuelta a España', 2023, 'Spain');

INSERT INTO results (race_id, "position", rider, team) VALUES
((SELECT id from races WHERE name = 'Tour de France' AND year = 2023), 1, 'Jonas Vingegaard', 'Jumbo-Visma'),
((SELECT id from races WHERE name = 'Tour de France' AND year = 2023), 2, 'Tadej Pogačar', 'UAE Team Emirates'),
((SELECT id from races WHERE name = 'Tour de France' AND year = 2023), 3, 'Adam Yates', 'UAE Team Emirates'),
((SELECT id from races WHERE name = 'Giro d''Italia' AND year = 2023), 1, 'Primož Roglič', 'Jumbo-Visma'),
((SELECT id from races WHERE name = 'Giro d''Italia' AND year = 2023), 2, 'Geraint Thomas', 'Ineos Grenadiers'),
((SELECT id from races WHERE name = 'Vuelta a España' AND year = 2023), 1, 'Sepp Kuss', 'Jumbo-Visma');