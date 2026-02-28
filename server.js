require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    if (process.env.DATABASE_URL) {
      try {
        execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
      } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
      }
    }
    await sequelize.authenticate();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
