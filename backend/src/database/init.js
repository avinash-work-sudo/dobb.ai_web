import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

const DATABASE_PATH = process.env.DATABASE_PATH || './database/test-results.db';

let db = null;

export async function initDatabase() {
  try {
    // Create database directory if it doesn't exist
    await mkdir(dirname(DATABASE_PATH), { recursive: true });

    // Create database connection
    db = new sqlite3.Database(DATABASE_PATH);

    // Promisify database methods
    db.runAsync = promisify(db.run.bind(db));
    db.getAsync = promisify(db.get.bind(db));
    db.allAsync = promisify(db.all.bind(db));

    // Create tables
    await createTables();

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  // Test executions table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS test_executions (
      id TEXT PRIMARY KEY,
      test_name TEXT NOT NULL,
      task_description TEXT,
      framework TEXT NOT NULL DEFAULT 'playwright', -- 'playwright' only
      status TEXT NOT NULL CHECK (status IN ('running', 'passed', 'failed', 'error')),
      duration_ms INTEGER,
      started_at DATETIME,
      completed_at DATETIME,
      user_id TEXT,
      browser_info TEXT, -- JSON string
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Test steps table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS test_steps (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL,
      step_number INTEGER NOT NULL,
      action_type TEXT,
      instruction TEXT,
      target_url TEXT,
      duration_ms INTEGER,
      success BOOLEAN,
      error_message TEXT,
      screenshot_path TEXT,
      metadata TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (execution_id) REFERENCES test_executions (id) ON DELETE CASCADE
    )
  `);

  // Test artifacts table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS test_artifacts (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL,
      artifact_type TEXT NOT NULL CHECK (artifact_type IN ('html_report', 'video', 'log', 'screenshot', 'performance')),
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (execution_id) REFERENCES test_executions (id) ON DELETE CASCADE
    )
  `);

  // Test requirements mapping (for traceability)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS test_requirements (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL,
      requirement_id TEXT NOT NULL,
      requirement_name TEXT,
      coverage_status TEXT CHECK (coverage_status IN ('covered', 'partial', 'not_covered')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (execution_id) REFERENCES test_executions (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.runAsync('CREATE INDEX IF NOT EXISTS idx_executions_status ON test_executions (status)');
  await db.runAsync('CREATE INDEX IF NOT EXISTS idx_executions_created ON test_executions (created_at)');
  await db.runAsync('CREATE INDEX IF NOT EXISTS idx_steps_execution ON test_steps (execution_id)');
  await db.runAsync('CREATE INDEX IF NOT EXISTS idx_artifacts_execution ON test_artifacts (execution_id)');
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    db = null;
  }
}


