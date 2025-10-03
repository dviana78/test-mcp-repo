import request from 'supertest';
import { app } from '../../src/server'; // Adjust the import based on your server setup

describe('Integration Tests for Server', () => {
  it('should respond with a 200 status for the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });

  // Add more integration tests as needed
});