import request from 'supertest';
import app from '../../src/app.js';
import type { Route, RouteLeg, RouteStep, RoutesAPIResponse } from '../../src/lib/routeTypes.js';

describe('GET /', () => {
    it('should return a welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('Hello');
    });
});

// test the route endpoint
describe('GET /route', () => {
    let originalApiKey: string | undefined;

    // Save the original API key before each test
    beforeEach(() => {
        originalApiKey = process.env.GOOGLE_MAPS_API_KEY;
    });

    // Restore the original API key after each test
    afterEach(() => {
        process.env.GOOGLE_MAPS_API_KEY = originalApiKey;
    });

    it('should return 400 if query parameters are missing', async () => {
        const res = await request(app).get('/route');
        expect(res.statusCode).toEqual(400);
    });

    it('should return 500 if GOOGLE_MAPS_API_KEY is not set', async () => {
        process.env.GOOGLE_MAPS_API_KEY = '';
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
            .query({ startLat: '-27.469891', startLng: '153.025124', endLat: '-27.495432', endLng: '153.012024' });
        
        expect(res.statusCode).toEqual(200);
        
        const body: RoutesAPIResponse = res.body;
        
        expect(body).toHaveProperty('routes');
        expect(Array.isArray(body.routes)).toBe(true);

        body.routes.forEach((route: Route) => {
            expect(route).toHaveProperty('legs');
            expect(Array.isArray(route.legs)).toBe(true);
            expect(route).toHaveProperty('polyline');
            expect(typeof route.polyline.encodedPolyline).toBe('string');

            route.legs.forEach((leg: RouteLeg) => {
                expect(leg).toHaveProperty('steps');
                expect(Array.isArray(leg.steps)).toBe(true);

                leg.steps.forEach((step: RouteStep) => {
                    expect(step).toHaveProperty('travelMode');
                    expect(['WALK', 'TRANSIT']).toContain(step.travelMode);
                    expect(step).toHaveProperty('polyline');
                    expect(typeof step.polyline.encodedPolyline).toBe('string');

                    if (step.travelMode === 'TRANSIT') {
                        expect(step).toHaveProperty('transitDetails');
                    }
                });
            });
        });
    });
});