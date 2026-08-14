-- Estado sincronizado: uma linha só, sempre cifrada.
CREATE TABLE IF NOT EXISTS state (
  id         TEXT PRIMARY KEY,
  version    INTEGER NOT NULL,
  iv         TEXT NOT NULL,
  ct         TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Tentativas de autenticação erradas, para limitar força bruta por IP.
CREATE TABLE IF NOT EXISTS auth_fail (
  ip           TEXT PRIMARY KEY,
  n            INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
