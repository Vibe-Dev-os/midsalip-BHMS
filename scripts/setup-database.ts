import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function createDatabaseAndTables() {
  // First connect without database to create the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: parseInt(process.env.DB_PORT || "3306"),
  });

  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS tagamidsalip_db`);
    console.log("Database 'tagamidsalip_db' created or already exists");

    // Close connection and reconnect to the specific database
    await connection.end();

    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "tagamidsalip_db",
      port: parseInt(process.env.DB_PORT || "3306"),
      multipleStatements: true,
    });

    // Read and execute the migration SQL
    const migrationsDir = path.join(process.cwd(), "drizzle", "migrations");
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    
    if (files.length === 0) {
      console.log("No migration files found");
      await dbConnection.end();
      return;
    }

    // Sort files to ensure order
    files.sort();
    
    for (const file of files) {
      const migrationPath = path.join(migrationsDir, file);
      console.log(`Executing migration: ${file}`);
      const migrationSql = fs.readFileSync(migrationPath, "utf8");

      // Split the SQL by statement breakpoints and execute each statement
      const statements = migrationSql
        .split("--> statement-breakpoint")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await dbConnection.execute(statement);
          } catch (err: any) {
            // Ignore "table already exists" errors
            if (!err.message.includes("already exists")) {
              throw err;
            }
            console.log(`Table already exists, skipping...`);
          }
        }
      }
    }

    console.log("Database tables created successfully");
    await dbConnection.end();
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}

// Run the setup if this file is executed directly
createDatabaseAndTables()
  .then(() => {
    console.log("Database setup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });

export { createDatabaseAndTables };