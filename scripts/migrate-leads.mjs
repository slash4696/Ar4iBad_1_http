import pg from "pg";

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL is required to migrate the portfolio database.");

const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS portfolio_leads (
      id BIGSERIAL PRIMARY KEY,
      user_id TEXT REFERENCES "user" (id) ON DELETE SET NULL,
      name VARCHAR(120) NOT NULL,
      contact VARCHAR(180) NOT NULL,
      style VARCHAR(80) NOT NULL DEFAULT 'Нейрофотосессия',
      message VARCHAR(1200) NOT NULL DEFAULT '',
      status VARCHAR(20) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'in_progress', 'done')),
      telegram_consent BOOLEAN NOT NULL DEFAULT FALSE,
      telegram_status VARCHAR(20) NOT NULL DEFAULT 'not_requested'
        CHECK (telegram_status IN ('not_requested', 'not_configured', 'sent', 'failed')),
      telegram_sent_at TIMESTAMPTZ,
      consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE portfolio_leads ADD COLUMN IF NOT EXISTS telegram_consent BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE portfolio_leads ADD COLUMN IF NOT EXISTS telegram_status VARCHAR(20) NOT NULL DEFAULT 'not_requested';
    ALTER TABLE portfolio_leads ADD COLUMN IF NOT EXISTS telegram_sent_at TIMESTAMPTZ;
    CREATE INDEX IF NOT EXISTS portfolio_leads_created_at_idx ON portfolio_leads (created_at DESC);
    CREATE INDEX IF NOT EXISTS portfolio_leads_user_id_idx ON portfolio_leads (user_id);
  `);
  console.log("Portfolio request table is ready.");
} finally {
  await pool.end();
}
