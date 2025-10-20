import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import type { LatLng } from './lib/getRoute.js';
import { getRoute } from './lib/getRoute.js';
import { getVehicleLocations } from './lib/getVehicleLocations.js';

const app = express();
app.use(express.json());

//cors middleware
const allowedOrigins = ['http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.get('/', (_: Request, res: Response) => {
  res.json({ message: 'Hello from API!' });
});

app.get('/route', async (req: Request, res: Response) => {
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

app.get('/vehicle-locations', async (_: Request, res: Response) => {
  try {
    const vehicleLocations = await getVehicleLocations();
    res.json(vehicleLocations);
  } catch (error) {
    console.error('Error fetching vehicle locations:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle locations' });
  }
});

export default app
