import app from './app.js';
import 'dotenv/config';

// Load .env in development if dotenv is installed. Use dynamic import to avoid crashing when dotenv is not present.
// if (process.env.NODE_ENV !== 'production') {
//   try {
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     await import('dotenv/config');
//   } catch (err) {
//   }
// }

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
