import { Request, Response } from 'express';
import { handleToolRequest } from '../../src/handlers/tools';

describe('Tool Handlers', () => {
    it('should handle tool request successfully', async () => {
        const req = {
            body: {
                // Mock request body
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        await handleToolRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object)); // Adjust based on expected response
    });

    it('should handle tool request with validation error', async () => {
        const req = {
            body: {
                // Mock invalid request body
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        await handleToolRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Validation error message', // Adjust based on actual error handling
        });
    });
});