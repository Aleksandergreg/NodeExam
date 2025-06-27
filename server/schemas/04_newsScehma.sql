-- This table stores a local copy of news articles to prevent duplicates
-- and to have a stable ID to link comments to.
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(512) UNIQUE NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  article_url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- This table stores user comments for each article.
CREATE TABLE article_comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parent_comment_id INTEGER REFERENCES article_comments(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0 NOT NULL,
  CONSTRAINT upvotes_non_negative CHECK (upvotes >= 0)
);

-- This table tracks which user has upvoted which comment.
CREATE TABLE comment_votes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id INTEGER NOT NULL REFERENCES article_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

-- Index to speed up fetching comments for a specific article.
CREATE INDEX idx_article_comments_article_id ON article_comments(article_id);