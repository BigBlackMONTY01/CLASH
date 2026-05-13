CREATE TABLE trading_cards (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  opponent_name VARCHAR(255) NOT NULL,
  opponent_icon VARCHAR(255),
  topic VARCHAR(255) NOT NULL,
  final_score INT NOT NULL,
  rank_earned VARCHAR(255),
  best_argument TEXT,
  match_id VARCHAR(255) NOT NULL,
  rarity VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);