const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: './../config.env' });

const pool = new Pool();

const createUsersTable =
  'CREATE TABLE users (name VARCHAR(100), user_id VARCHAR(50) PRIMARY KEY, email VARCHAR(100) UNIQUE, password VARCHAR(200), password_changed_at TIMESTAMP DEFAULT NULL, password_reset_token VARCHAR(200) DEFAULT NULL, password_reset_expires TIMESTAMP DEFAULT NULL)';

const createProjectsTable =
  'CREATE TABLE projects (name VARCHAR(100), description VARCHAR(2000), project_id VARCHAR(50) PRIMARY KEY, created_by VARCHAR(50) REFERENCES users(user_id), created_at TIMESTAMP NOT NULL)';

const userType = "CREATE TYPE usert AS ENUM ('admin', 'normal')";

const createUsersProjectsRelationsTable =
  'CREATE TABLE users_projects_relations (user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE, project_id VARCHAR(50) REFERENCES projects(project_id) ON DELETE CASCADE, designation VARCHAR(50), user_type usert)';

(async () => {
  try {
    await pool.query(
      'DROP TABLE users_projects_relations; DROP TABLE projects; DROP TABLE users;DROP TYPE usert;'
    );
    await pool.query(createUsersTable);
    console.log('Created users table successfully');
    await pool.query(createProjectsTable);
    console.log('Created projects table successfully');
    await pool.query(userType);
    console.log('Declared a custom Enum type: usert');
    await pool.query(createUsersProjectsRelationsTable);
    console.log('Created users_projects_relations table successfully');
  } catch (error) {
    console.log(error.message);
  }
})();
