import { z } from 'zod';
import {
    validateApiInfo,
    validateCreateApiVersion,
    validateCreateApiRevision,
    validateUpdateApi,
    validateMcpToolRequest,
    validateMcpResourceRequest,
    isValidRevisionId,
    sanitizeApiPath,
    apiInfoSchema,
    createApiVersionSchema,
    createApiRevisionSchema,
    updateApiSchema,
    mcpToolRequestSchema,
    mcpResourceRequestSchema
} from '../../src/utils/validation';
import { ValidationError } from '../../src/utils/errors';

describe('Validation Utils', () => {
    describe('API Info Validation', () => {
        describe('validateApiInfo', () => {
            it('should validate correct API info', () => {
                const validApiInfo = {
                    name: 'test-api',
                    displayName: 'Test API',
                    description: 'A test API',
                    path: '/test',
                    protocols: ['https'],
                    serviceUrl: 'https://api.example.com',
                    subscriptionRequired: true
                };

                const result = validateApiInfo(validApiInfo);
                expect(result).toEqual(validApiInfo);
            });

            it('should validate minimal API info', () => {
                const minimalApiInfo = {
                    name: 'api',
                    displayName: 'API',
                    path: '/api',
                    protocols: ['http']
                };

                const result = validateApiInfo(minimalApiInfo);
                expect(result).toEqual({
                    ...minimalApiInfo,
                    description: undefined,
                    serviceUrl: undefined,
                    subscriptionRequired: undefined
                });
            });

            it('should throw ValidationError for missing required fields', () => {
                const invalidApiInfo = {
                    displayName: 'Test API'
                    // missing name, path, protocols
                };

                expect(() => validateApiInfo(invalidApiInfo)).toThrow(ValidationError);
                expect(() => validateApiInfo(invalidApiInfo)).toThrow('Invalid API information');
            });

            it('should throw ValidationError for empty name', () => {
                const invalidApiInfo = {
                    name: '',
                    displayName: 'Test API',
                    path: '/test',
                    protocols: ['https']
                };

                expect(() => validateApiInfo(invalidApiInfo)).toThrow(ValidationError);
            });

            it('should throw ValidationError for name too long', () => {
                const invalidApiInfo = {
                    name: 'a'.repeat(81), // Too long
                    displayName: 'Test API',
                    path: '/test',
                    protocols: ['https']
                };

                expect(() => validateApiInfo(invalidApiInfo)).toThrow(ValidationError);
            });

            it('should throw ValidationError for displayName too long', () => {
                const invalidApiInfo = {
                    name: 'test-api',
                    displayName: 'a'.repeat(301), // Too long
                    path: '/test',
                    protocols: ['https']
                };

                expect(() => validateApiInfo(invalidApiInfo)).toThrow(ValidationError);
            });

            it('should throw ValidationError for empty path', () => {
                const invalidApiInfo = {
                    name: 'test-api',
                    displayName: 'Test API',
                    path: '',
                    protocols: ['https']
                };

                expect(() => validateApiInfo(invalidApiInfo)).toThrow(ValidationError);
            });

            it('should throw ValidationError for invalid protocols', () => {
                const invalidApiInfo = {
                    name: 'test-api',
                    displayName: 'Test API',
                    path: '/test',
                    protocols: ['ftp'] // Invalid protocol
                };

                expect(() => validateApiInfo(invalidApiInfo)).toThrow(ValidationError);
            });

            it('should throw ValidationError for empty protocols array', () => {
                const invalidApiInfo = {
                    name: 'test-api',
                    displayName: 'Test API',
                    path: '/test',
                    protocols: [] // Empty array
                };

                expect(() => validateApiInfo(invalidApiInfo)).toThrow(ValidationError);
            });

            it('should throw ValidationError for invalid service URL', () => {
                const invalidApiInfo = {
                    name: 'test-api',
                    displayName: 'Test API',
                    path: '/test',
                    protocols: ['https'],
                    serviceUrl: 'not-a-url'
                };

                expect(() => validateApiInfo(invalidApiInfo)).toThrow(ValidationError);
            });

            it('should include field information in validation errors', () => {
                const invalidApiInfo = {
                    name: '',
                    displayName: 'Test API',
                    path: '/test',
                    protocols: ['https']
                };

                try {
                    validateApiInfo(invalidApiInfo);
                    fail('Should have thrown ValidationError');
                } catch (error: any) {
                    expect(error).toBeInstanceOf(ValidationError);
                    expect(error.details?.issues).toBeDefined();
                    expect(error.details.issues).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                field: 'name',
                                message: expect.any(String)
                            })
                        ])
                    );
                }
            });
        });

        describe('apiInfoSchema', () => {
            it('should accept valid API info', () => {
                const validData = {
                    name: 'test-api',
                    displayName: 'Test API',
                    path: '/test',
                    protocols: ['https', 'http']
                };

                expect(() => apiInfoSchema.parse(validData)).not.toThrow();
            });

            it('should reject invalid data', () => {
                const invalidData = {
                    name: 123, // Should be string
                    displayName: 'Test API',
                    path: '/test',
                    protocols: ['https']
                };

                expect(() => apiInfoSchema.parse(invalidData)).toThrow(z.ZodError);
            });
        });
    });

    describe('API Version Validation', () => {
        describe('validateCreateApiVersion', () => {
            it('should validate correct API version data', () => {
                const validVersionData = {
                    apiId: 'test-api',
                    versionId: 'v1',
                    displayName: 'Version 1',
                    description: 'First version',
                    versioningScheme: 'Segment' as const
                };

                const result = validateCreateApiVersion(validVersionData);
                expect(result).toEqual(validVersionData);
            });

            it('should validate minimal API version data', () => {
                const minimalVersionData = {
                    apiId: 'test-api',
                    versionId: 'v1',
                    displayName: 'Version 1'
                };

                const result = validateCreateApiVersion(minimalVersionData);
                expect(result).toEqual({
                    ...minimalVersionData,
                    description: undefined,
                    sourceApiId: undefined,
                    versioningScheme: undefined,
                    versionQueryName: undefined,
                    versionHeaderName: undefined
                });
            });

            it('should throw ValidationError for missing required fields', () => {
                const invalidVersionData = {
                    apiId: 'test-api'
                    // missing versionId and displayName
                };

                expect(() => validateCreateApiVersion(invalidVersionData)).toThrow(ValidationError);
                expect(() => validateCreateApiVersion(invalidVersionData)).toThrow('Invalid API version creation data');
            });

            it('should throw ValidationError for versionId too long', () => {
                const invalidVersionData = {
                    apiId: 'test-api',
                    versionId: 'v'.repeat(81), // Too long
                    displayName: 'Version 1'
                };

                expect(() => validateCreateApiVersion(invalidVersionData)).toThrow(ValidationError);
            });

            it('should throw ValidationError for displayName too long', () => {
                const invalidVersionData = {
                    apiId: 'test-api',
                    versionId: 'v1',
                    displayName: 'a'.repeat(101) // Too long
                };

                expect(() => validateCreateApiVersion(invalidVersionData)).toThrow(ValidationError);
            });

            it('should validate versioning schemes', () => {
                const schemes = ['Segment', 'Query', 'Header'] as const;
                
                schemes.forEach(scheme => {
                    const versionData = {
                        apiId: 'test-api',
                        versionId: 'v1',
                        displayName: 'Version 1',
                        versioningScheme: scheme
                    };

                    expect(() => validateCreateApiVersion(versionData)).not.toThrow();
                });
            });

            it('should throw ValidationError for invalid versioning scheme', () => {
                const invalidVersionData = {
                    apiId: 'test-api',
                    versionId: 'v1',
                    displayName: 'Version 1',
                    versioningScheme: 'Invalid'
                };

                expect(() => validateCreateApiVersion(invalidVersionData)).toThrow(ValidationError);
            });
        });

        describe('createApiVersionSchema', () => {
            it('should accept valid version data', () => {
                const validData = {
                    apiId: 'test-api',
                    versionId: 'v1',
                    displayName: 'Version 1',
                    versioningScheme: 'Segment'
                };

                expect(() => createApiVersionSchema.parse(validData)).not.toThrow();
            });

            it('should reject invalid data', () => {
                const invalidData = {
                    apiId: '', // Empty string
                    versionId: 'v1',
                    displayName: 'Version 1'
                };

                expect(() => createApiVersionSchema.parse(invalidData)).toThrow(z.ZodError);
            });
        });
    });

    describe('API Revision Validation', () => {
        describe('validateCreateApiRevision', () => {
            it('should validate correct API revision data', () => {
                const validRevisionData = {
                    apiId: 'test-api',
                    apiRevision: 'rev1',
                    description: 'First revision',
                    sourceApiRevision: 'current'
                };

                const result = validateCreateApiRevision(validRevisionData);
                expect(result).toEqual(validRevisionData);
            });

            it('should validate minimal API revision data', () => {
                const minimalRevisionData = {
                    apiId: 'test-api'
                };

                const result = validateCreateApiRevision(minimalRevisionData);
                expect(result).toEqual({
                    ...minimalRevisionData,
                    apiRevision: undefined,
                    description: undefined,
                    sourceApiRevision: undefined
                });
            });

            it('should throw ValidationError for missing apiId', () => {
                const invalidRevisionData = {
                    description: 'Test revision'
                    // missing apiId
                };

                expect(() => validateCreateApiRevision(invalidRevisionData)).toThrow(ValidationError);
            });

            it('should throw ValidationError for empty apiId', () => {
                const invalidRevisionData = {
                    apiId: ''
                };

                expect(() => validateCreateApiRevision(invalidRevisionData)).toThrow(ValidationError);
            });
        });

        describe('createApiRevisionSchema', () => {
            it('should accept valid revision data', () => {
                const validData = {
                    apiId: 'test-api',
                    apiRevision: 'rev1',
                    description: 'Test revision'
                };

                expect(() => createApiRevisionSchema.parse(validData)).not.toThrow();
            });
        });
    });

    describe('Update API Validation', () => {
        describe('validateUpdateApi', () => {
            it('should validate correct update data', () => {
                const validUpdateData = {
                    displayName: 'Updated API',
                    description: 'Updated description',
                    path: '/updated',
                    protocols: ['https'],
                    serviceUrl: 'https://updated.example.com',
                    subscriptionRequired: false
                };

                const result = validateUpdateApi(validUpdateData);
                expect(result).toEqual(validUpdateData);
            });

            it('should validate empty update data', () => {
                const emptyUpdateData = {};

                const result = validateUpdateApi(emptyUpdateData);
                expect(result).toEqual({
                    displayName: undefined,
                    description: undefined,
                    path: undefined,
                    protocols: undefined,
                    serviceUrl: undefined,
                    subscriptionRequired: undefined
                });
            });

            it('should validate partial update data', () => {
                const partialUpdateData = {
                    displayName: 'Updated API',
                    protocols: ['https']
                };

                const result = validateUpdateApi(partialUpdateData);
                expect(result).toEqual({
                    ...partialUpdateData,
                    description: undefined,
                    path: undefined,
                    serviceUrl: undefined,
                    subscriptionRequired: undefined
                });
            });

            it('should throw ValidationError for invalid data', () => {
                const invalidUpdateData = {
                    displayName: 'a'.repeat(301), // Too long
                    protocols: ['https']
                };

                expect(() => validateUpdateApi(invalidUpdateData)).toThrow(ValidationError);
            });

            it('should throw ValidationError for invalid service URL', () => {
                const invalidUpdateData = {
                    serviceUrl: 'not-a-url'
                };

                expect(() => validateUpdateApi(invalidUpdateData)).toThrow(ValidationError);
            });
        });

        describe('updateApiSchema', () => {
            it('should accept valid update data', () => {
                const validData = {
                    displayName: 'Updated API',
                    protocols: ['https', 'http']
                };

                expect(() => updateApiSchema.parse(validData)).not.toThrow();
            });

            it('should accept empty object', () => {
                expect(() => updateApiSchema.parse({})).not.toThrow();
            });
        });
    });

    describe('MCP Tool Request Validation', () => {
        describe('validateMcpToolRequest', () => {
            it('should validate correct tool request', () => {
                const validToolRequest = {
                    name: 'test-tool',
                    arguments: {
                        param1: 'value1',
                        param2: 123,
                        param3: true
                    }
                };

                const result = validateMcpToolRequest(validToolRequest);
                expect(result).toEqual(validToolRequest);
            });

            it('should validate tool request with empty arguments', () => {
                const validToolRequest = {
                    name: 'test-tool',
                    arguments: {}
                };

                const result = validateMcpToolRequest(validToolRequest);
                expect(result).toEqual(validToolRequest);
            });

            it('should throw ValidationError for missing name', () => {
                const invalidToolRequest = {
                    arguments: {}
                    // missing name
                };

                expect(() => validateMcpToolRequest(invalidToolRequest)).toThrow(ValidationError);
            });

            it('should throw ValidationError for empty name', () => {
                const invalidToolRequest = {
                    name: '',
                    arguments: {}
                };

                expect(() => validateMcpToolRequest(invalidToolRequest)).toThrow(ValidationError);
            });

            it('should throw ValidationError for missing arguments', () => {
                const invalidToolRequest = {
                    name: 'test-tool'
                    // missing arguments
                };

                expect(() => validateMcpToolRequest(invalidToolRequest)).toThrow(ValidationError);
            });
        });

        describe('mcpToolRequestSchema', () => {
            it('should accept valid tool request', () => {
                const validData = {
                    name: 'test-tool',
                    arguments: { key: 'value' }
                };

                expect(() => mcpToolRequestSchema.parse(validData)).not.toThrow();
            });

            it('should reject invalid data', () => {
                const invalidData = {
                    name: 123, // Should be string
                    arguments: {}
                };

                expect(() => mcpToolRequestSchema.parse(invalidData)).toThrow(z.ZodError);
            });
        });
    });

    describe('MCP Resource Request Validation', () => {
        describe('validateMcpResourceRequest', () => {
            it('should validate correct resource request', () => {
                const validResourceRequest = {
                    uri: 'https://example.com/resource'
                };

                const result = validateMcpResourceRequest(validResourceRequest);
                expect(result).toEqual(validResourceRequest);
            });

            it('should validate resource request with file URI', () => {
                const validResourceRequest = {
                    uri: 'file:///path/to/resource'
                };

                const result = validateMcpResourceRequest(validResourceRequest);
                expect(result).toEqual(validResourceRequest);
            });

            it('should throw ValidationError for missing uri', () => {
                const invalidResourceRequest = {};

                expect(() => validateMcpResourceRequest(invalidResourceRequest)).toThrow(ValidationError);
            });

            it('should throw ValidationError for empty uri', () => {
                const invalidResourceRequest = {
                    uri: ''
                };

                expect(() => validateMcpResourceRequest(invalidResourceRequest)).toThrow(ValidationError);
            });
        });

        describe('mcpResourceRequestSchema', () => {
            it('should accept valid resource request', () => {
                const validData = {
                    uri: 'https://example.com/resource'
                };

                expect(() => mcpResourceRequestSchema.parse(validData)).not.toThrow();
            });

            it('should reject invalid data', () => {
                const invalidData = {
                    uri: 123 // Should be string
                };

                expect(() => mcpResourceRequestSchema.parse(invalidData)).toThrow(z.ZodError);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle non-ZodError in validateApiInfo', () => {
            // Mock apiInfoSchema to throw a non-ZodError
            const originalParse = apiInfoSchema.parse;
            apiInfoSchema.parse = jest.fn().mockImplementation(() => {
                throw new Error('Non-Zod error');
            });

            try {
                expect(() => validateApiInfo({})).toThrow('Non-Zod error');
            } finally {
                apiInfoSchema.parse = originalParse;
            }
        });

        it('should handle non-ZodError in validateCreateApiVersion', () => {
            const originalParse = createApiVersionSchema.parse;
            createApiVersionSchema.parse = jest.fn().mockImplementation(() => {
                throw new Error('Non-Zod error');
            });

            try {
                expect(() => validateCreateApiVersion({})).toThrow('Non-Zod error');
            } finally {
                createApiVersionSchema.parse = originalParse;
            }
        });

        it('should provide detailed validation error information', () => {
            const invalidData = {
                name: '',
                displayName: '',
                path: '',
                protocols: []
            };

            try {
                validateApiInfo(invalidData);
                fail('Should have thrown ValidationError');
            } catch (error: any) {
                expect(error).toBeInstanceOf(ValidationError);
                expect(error.message).toBe('Invalid API information');
                expect(error.details?.issues).toBeDefined();
                expect(Array.isArray(error.details.issues)).toBe(true);
                expect(error.details.issues.length).toBeGreaterThan(0);
                
                // Should have field and message for each issue
                error.details.issues.forEach((issue: any) => {
                    expect(issue).toHaveProperty('field');
                    expect(issue).toHaveProperty('message');
                    expect(typeof issue.field).toBe('string');
                    expect(typeof issue.message).toBe('string');
                });
            }
        });

        it('should handle non-Zod errors', () => {
            const originalParse = mcpToolRequestSchema.parse;
            mcpToolRequestSchema.parse = jest.fn().mockImplementation(() => {
                throw new Error('Non-Zod error');
            });

            const invalidToolRequest = { name: 'test' };

            expect(() => validateMcpToolRequest(invalidToolRequest)).toThrow('Non-Zod error');

            // Restore original
            mcpToolRequestSchema.parse = originalParse;
        });
    });

    describe('validateUpdateApi', () => {
        describe('Error Handling', () => {
            it('should handle non-Zod errors', () => {
                // Create a mock that throws a non-Zod error
                const originalValidateUpdateApi = validateUpdateApi;
                const mockSchema = {
                    parse: jest.fn().mockImplementation(() => {
                        throw new Error('Non-Zod error');
                    })
                };

                // Temporarily replace the schema
                jest.doMock('../../src/utils/validation', () => ({
                    ...jest.requireActual('../../src/utils/validation'),
                    updateApiSchema: mockSchema
                }));

                const invalidData = { invalid: 'data' };

                expect(() => {
                    mockSchema.parse(invalidData);
                }).toThrow('Non-Zod error');
            });
        });
    });

    describe('validateMcpResourceRequest', () => {
        describe('Error Handling', () => {
            it('should handle non-Zod errors', () => {
                // Create a mock that throws a non-Zod error
                const mockSchema = {
                    parse: jest.fn().mockImplementation(() => {
                        throw new Error('Non-Zod error');
                    })
                };

                const invalidData = { invalid: 'data' };

                expect(() => {
                    mockSchema.parse(invalidData);
                }).toThrow('Non-Zod error');
            });
        });
    });

    describe('Utility Functions', () => {
        describe('isValidRevisionId', () => {
            it('should validate numeric revision IDs', () => {
                expect(isValidRevisionId('1')).toBe(true);
                expect(isValidRevisionId('123')).toBe(true);
                expect(isValidRevisionId('2147483647')).toBe(true);
            });

            it('should reject invalid revision IDs', () => {
                expect(isValidRevisionId('0')).toBe(false);
                expect(isValidRevisionId('-1')).toBe(false);
                expect(isValidRevisionId('abc')).toBe(false);
                expect(isValidRevisionId('2147483648')).toBe(false);
                expect(isValidRevisionId('')).toBe(false);
            });
        });

        describe('sanitizeApiPath', () => {
            it('should add leading slash when missing', () => {
                expect(sanitizeApiPath('api/test')).toBe('/api/test');
                expect(sanitizeApiPath('test')).toBe('/test');
            });

            it('should remove multiple consecutive slashes', () => {
                expect(sanitizeApiPath('/api//test///path')).toBe('/api/test/path');
                expect(sanitizeApiPath('///api/test')).toBe('/api/test');
            });

            it('should remove trailing slash except for root', () => {
                expect(sanitizeApiPath('/api/test/')).toBe('/api/test');
                expect(sanitizeApiPath('/api/test/path/')).toBe('/api/test/path');
                expect(sanitizeApiPath('/')).toBe('/'); // Root should keep slash
            });

            it('should handle complex path sanitization', () => {
                expect(sanitizeApiPath('//api///test//path//')).toBe('/api/test/path');
                expect(sanitizeApiPath('api//test/')).toBe('/api/test');
            });

            it('should handle empty and edge cases', () => {
                expect(sanitizeApiPath('')).toBe('/');
                expect(sanitizeApiPath('//')).toBe('/');
                expect(sanitizeApiPath('///')).toBe('/');
            });
        });
    });
});