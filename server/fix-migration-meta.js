const fs = require('fs');
const path = require('path');

async function fixMigrationMeta() {
  try {
    // 1. Create migration meta directory if it doesn't exist
    const metaDir = path.join(__dirname, 'migrations/meta');
    
    if (!fs.existsSync(metaDir)) {
      console.log('Creating meta directory...');
      fs.mkdirSync(metaDir, { recursive: true });
    }
    
    // 2. Create or update _journal.json file
    const journalPath = path.join(metaDir, '_journal.json');
    const journalContent = {
      version: "5",
      dialect: "pg",
      entries: [
        {
          "idx": 0,
          "comment": "create user_role enum and users table",
          "when": new Date().toISOString(),
          "hash": "0000_red_karma",
          "checksum": "18c8e56a3c4c35cdf02a7d5f9f6f9e5175a2c5fc4f5f6c069c97c7af4e312dae"
        },
        {
          "idx": 1,
          "comment": "add profiles table",
          "when": new Date().toISOString(),
          "hash": "0001_abnormal_yellowjacket",
          "checksum": "da39a3ee5e6b4b0d3255bfef95601890afd80709"
        }
      ]
    };
    
    fs.writeFileSync(journalPath, JSON.stringify(journalContent, null, 2));
    console.log('Created _journal.json file');
    
    // 3. Create meta files for each migration
    // Meta for 0000_red_karma.sql
    const meta0000Path = path.join(metaDir, '0000_red_karma.json');
    const meta0000Content = {
      "version": "5",
      "dialect": "pg",
      "id": "0000_red_karma",
      "checksum": "18c8e56a3c4c35cdf02a7d5f9f6f9e5175a2c5fc4f5f6c069c97c7af4e312dae",
      "operations": [
        {
          "addTable": {
            "table": "users",
            "columns": {
              "id": {
                "name": "id",
                "dataType": "serial",
                "primaryKey": true,
                "notNull": true
              },
              "email": {
                "name": "email",
                "dataType": "varchar(255)",
                "notNull": true,
                "unique": true
              },
              "password_hash": {
                "name": "password_hash",
                "dataType": "varchar(255)",
                "notNull": true
              },
              "first_name": {
                "name": "first_name",
                "dataType": "varchar(100)",
                "notNull": true
              },
              "last_name": {
                "name": "last_name",
                "dataType": "varchar(100)",
                "notNull": true
              },
              "role": {
                "name": "role",
                "dataType": "user_role",
                "notNull": true
              },
              "is_verified": {
                "name": "is_verified",
                "dataType": "boolean",
                "notNull": true,
                "default": false
              },
              "created_at": {
                "name": "created_at",
                "dataType": "timestamp",
                "notNull": true,
                "default": "now()"
              }
            }
          }
        },
        {
          "createEnum": {
            "enum": "user_role",
            "values": ["athlete", "recruiter", "admin", "parent"]
          }
        }
      ]
    };
    
    fs.writeFileSync(meta0000Path, JSON.stringify(meta0000Content, null, 2));
    console.log('Created 0000_red_karma.json meta file');
    
    // Meta for 0001_abnormal_yellowjacket.sql
    const meta0001Path = path.join(metaDir, '0001_abnormal_yellowjacket.json');
    const meta0001Content = {
      "version": "5",
      "dialect": "pg",
      "id": "0001_abnormal_yellowjacket",
      "checksum": "da39a3ee5e6b4b0d3255bfef95601890afd80709",
      "operations": [
        {
          "addTable": {
            "table": "profiles",
            "columns": {
              "id": {
                "name": "id",
                "dataType": "serial",
                "primaryKey": true,
                "notNull": true
              },
              "created_at": {
                "name": "created_at",
                "dataType": "timestamp",
                "notNull": true,
                "default": "now()"
              },
              "user_id": {
                "name": "user_id",
                "dataType": "integer",
                "notNull": true,
                "foreignKeys": [
                  {
                    "tableId": "users",
                    "columnId": "id",
                    "onDelete": "cascade"
                  }
                ]
              }
            }
          }
        }
      ]
    };
    
    fs.writeFileSync(meta0001Path, JSON.stringify(meta0001Content, null, 2));
    console.log('Created 0001_abnormal_yellowjacket.json meta file');
    
    // Create a custom script to modify the first migration
    const customMigrationPath = path.join(__dirname, 'migrations/0000_red_karma_modified.sql');
    const customMigrationContent = `
-- Custom migration that skips enum creation if it already exists
DO $$
BEGIN
    -- Check if enum exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create enum if it doesn't exist
        CREATE TYPE "user_role" AS ENUM ('athlete', 'recruiter', 'admin', 'parent');
    END IF;
    
    -- Rest of the migration
    CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "first_name" VARCHAR(100) NOT NULL,
        "last_name" VARCHAR(100) NOT NULL,
        "role" user_role NOT NULL,
        "is_verified" BOOLEAN DEFAULT false NOT NULL,
        "created_at" TIMESTAMP DEFAULT now() NOT NULL
    );
END
$$;
    `;
    
    fs.writeFileSync(customMigrationPath, customMigrationContent);
    console.log('Created modified migration script');
    
    // Make backup of original migration
    const originalMigrationPath = path.join(__dirname, 'migrations/0000_red_karma.sql');
    if (fs.existsSync(originalMigrationPath)) {
      const backupPath = path.join(__dirname, 'migrations/0000_red_karma.sql.bak');
      fs.copyFileSync(originalMigrationPath, backupPath);
      console.log('Backed up original migration');
      
      // Replace original with modified version
      fs.copyFileSync(customMigrationPath, originalMigrationPath);
      console.log('Replaced original migration with modified version');
    }
    
    console.log('Migration meta files fixed successfully');
  } catch (error) {
    console.error('Error fixing migration meta:', error);
  }
}

fixMigrationMeta(); 