import request from 'supertest';
import app from '../../src/app.js';

describe('GET /', () => {
    it('should return a welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('Hello');
    });
});