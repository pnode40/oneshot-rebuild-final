-- Test migration to verify our migration system
CREATE TABLE IF NOT EXISTS test_migration_system (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 