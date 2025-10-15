import request from 'supertest';
import app from '../../src/app.js';

describe('GET /', () => {
    it('should return a welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('Hello');
    });
});

// test the route endpoint
describe('GET /route', () => {
    it('should return 400 if query parameters are missing', async () => {
        const res = await request(app).get('/route');
        expect(res.statusCode).toEqual(400);
    });

    it('should return 500 if GOOGLE_MAPS_API_KEY is not set', async () => {
        const res = await request(app)
            .get('/route')
            .query({ startLat: '37.7749', startLng: '-122.4194', endLat: '34.0522', endLng: '-118.2437' });
        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toContain('Failed to fetch route');
    });

    it('should return 500 if GOOGLE_MAPS_API_KEY is invalid', async () => {
        process.env.GOOGLE_MAPS_API_KEY = 'INVALID_KEY';
        const res = await request(app)
            .get('/route')
            .query({ startLat: '37.7749', startLng: '-122.4194', endLat: '34.0522', endLng: '-118.2437' });
        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toContain('Failed to fetch route');
    });

    it("should return 200 and route data if GOOGLE_MAPS_API_KEY is valid", async () => {
        const res = await request(app)
            .get('/route')
            .query({ startLat: '37.7749', startLng: '-122.4194', endLat: '34.0522', endLng: '-118.2437' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('routes');
    });
});