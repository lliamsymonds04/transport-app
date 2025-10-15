const express = require('express');
import type { Request, Response } from 'express';
import type { LatLng } from './lib/getRoute.js';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from TypeScript Express API!' });
});

app.get('/route', async (req: Request, res: Response) => {
  const { getRoute } = require('./lib/getRoute');
  const { startLat, startLng, endLat, endLng } = req.query;
  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ error: 'Missing start or end query parameters' });
  }

  const startCoords: LatLng = {
    latitude: parseFloat(startLat as string),
    longitude: parseFloat(startLng as string),
  };

  const endCoords: LatLng = {
    latitude: parseFloat(endLat as string),
    longitude: parseFloat(endLng as string),
  };

  try {
    const route = await getRoute(startCoords, endCoords);
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});