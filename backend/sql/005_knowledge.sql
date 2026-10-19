-- RAG: help texts + their Gemini embedding (3072 numbers, stored as JSON)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  embedding JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);