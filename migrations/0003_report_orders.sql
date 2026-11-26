-- Paid Property Intelligence Report orders (Razorpay). One row per checkout attempt.
-- status: created (checkout opened) -> paid (signature or webhook confirmed) -> delivered (marked by the team).
CREATE TABLE IF NOT EXISTS report_orders (
  id TEXT PRIMARY KEY NOT NULL,
  project_slug TEXT NOT NULL,
  project_name TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  rzp_order_id TEXT NOT NULL UNIQUE,
  rzp_payment_id TEXT,
  download_token TEXT NOT NULL,
  source_path TEXT NOT NULL DEFAULT '/reports',
  utm_source TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  created_at TEXT NOT NULL,
  paid_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_report_orders_created ON report_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_orders_token ON report_orders(download_token);
