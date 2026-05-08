import app, { ensureDatabase } from './app.js';

const port = Number(process.env.PORT || 4000);

ensureDatabase()
  .then(() => {
    app.listen(port, () => console.log(`API FRICAR en http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Error iniciando API FRICAR', error);
    process.exit(1);
  });
