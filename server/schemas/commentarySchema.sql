CREATE TABLE commentary (
    id SERIAL PRIMARY KEY,
    race_id VARCHAR(255) NOT NULL, 
    user_id INT NOT NULL REFERENCES users(id),
    username VARCHAR(50) NOT NULL,
    comment TEXT NOT NULL,
    kms_to_go INT DEFAULT NULL, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commentary_race_id ON commentary(race_id);