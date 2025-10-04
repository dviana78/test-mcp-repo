import { GrpcService } from '../../../src/services/grpc.service';
import { AzureClient } from '../../../src/services/azure-client';
import { Logger } from '../../../src/utils/logger';
import { ValidationError } from '../../../src/utils/errors';

describe('GrpcService', () => {
    let grpcService: GrpcService;
    let azureClient: AzureClient;
    let logger: Logger;
    let mockApiManagementClient: any;

    beforeEach(() => {
        // Set environment variables for testing
        process.env.AZURE_APIM_RESOURCE_GROUP = 'test-rg';
        process.env.AZURE_APIM_SERVICE_NAME = 'test-apim';
        
        // Mock ApiManagementClient methods
        mockApiManagementClient = {
            api: {
                createOrUpdate: jest.fn(),
                beginCreateOrUpdateAndWait: jest.fn(),
            },
        };

        // Mock AzureClient for testing
        azureClient = {
            testConnection: jest.fn().mockResolvedValue(true),
            getClient: jest.fn().mockReturnValue(mockApiManagementClient),
            handleAzureError: jest.fn().mockImplementation((error) => { throw error; }),
        } as any;
        
        logger = new Logger('Test');
        jest.spyOn(logger, 'info').mockImplementation();
        jest.spyOn(logger, 'error').mockImplementation();
        
        grpcService = new GrpcService(azureClient, logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance of GrpcService', () => {
        expect(grpcService).toBeInstanceOf(GrpcService);
    });

    it('should implement IGrpcService interface', () => {
        expect(typeof grpcService.createGrpcApiFromProto).toBe('function');
    });

    describe('createGrpcApiFromProto', () => {
        it('should create gRPC API from protobuf successfully', async () => {
            const mockGrpcApi = {
                name: 'grpc-api', 
                displayName: 'gRPC API',
                path: 'grpc/example',
                protocols: ['grpcs'],
                serviceUrl: 'grpc://localhost:50051'
            };
            
            mockApiManagementClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockGrpcApi);            const protoDefinition = `
                syntax = "proto3";
                package example;
                service ExampleService {
                    rpc GetExample(ExampleRequest) returns (ExampleResponse);
                }
                message ExampleRequest {
                    string id = 1;
                }
                message ExampleResponse {
                    string result = 1;
                }
            `;

            const params = {
                apiId: 'grpc-api',
                displayName: 'gRPC API',
                protoDefinition,
                path: 'grpc/example',
                serviceUrl: 'grpc://localhost:50051'
            };

            const result = await grpcService.createGrpcApiFromProto(params);

            expect(result).toEqual({
                id: 'grpc-api',
                name: 'grpc-api',
                displayName: 'gRPC API',
                description: undefined,
                path: 'grpc/example',
                protocols: ['grpcs'],
                serviceUrl: 'grpc://localhost:50051',
                apiVersion: undefined,
                apiVersionSetId: undefined,
                isCurrent: undefined,
                isOnline: undefined,
                type: undefined,
                subscriptionRequired: undefined,
                authenticationSettings: undefined
            });
            expect(mockApiManagementClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'grpc-api',
                expect.objectContaining({
                    displayName: 'gRPC API',
                    path: '/grpc/example',
                    serviceUrl: 'grpc://localhost:50051',
                    protocols: ['https'],
                    apiType: 'http',
                    format: 'openapi',
                    import: true,
                    subscriptionRequired: true
                })
            );
            expect(logger.info).toHaveBeenCalledWith('Creating native gRPC API via Azure Application Gateway integration', expect.any(Object));
        });

        it('should handle errors when creating gRPC API', async () => {
            const params = {
                apiId: 'grpc-api',
                displayName: 'gRPC API',
                protoDefinition: 'invalid proto',
                path: 'grpc/example'
            };

            await expect(grpcService.createGrpcApiFromProto(params))
                .rejects.toThrow('Protobuf definition must contain at least one service with RPC methods');
            expect(logger.error).toHaveBeenCalledWith('Failed to create gRPC API from protobuf', expect.any(ValidationError));
        });

        it('should create gRPC API with custom protocols', async () => {
            const mockGrpcApi = {
                name: 'custom-grpc-api',
                displayName: 'Custom gRPC API',
                path: 'grpc/custom',
                protocols: ['http', 'https', 'grpc']
            };
            mockApiManagementClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockGrpcApi);

            const params = {
                apiId: 'custom-grpc-api',
                displayName: 'Custom gRPC API',
                protoDefinition: `
                    syntax = "proto3";
                    package example;
                    service ExampleService {
                        rpc GetExample(ExampleRequest) returns (ExampleResponse);
                    }
                    message ExampleRequest {
                        string id = 1;
                    }
                    message ExampleResponse {
                        string result = 1;
                    }
                `,
                path: 'grpc/custom',
                protocols: ['http', 'https', 'grpc'] as ('http' | 'https' | 'grpc' | 'grpcs')[]
            };

            const result = await grpcService.createGrpcApiFromProto(params);

            expect(result).toEqual({
                id: 'custom-grpc-api',
                name: 'custom-grpc-api',
                displayName: 'Custom gRPC API',
                description: undefined,
                path: 'grpc/custom',
                protocols: ['http', 'https', 'grpc'],
                serviceUrl: undefined,
                apiVersion: undefined,
                apiVersionSetId: undefined,
                isCurrent: undefined,
                isOnline: undefined,
                type: undefined,
                subscriptionRequired: undefined,
                authenticationSettings: undefined
            });
            expect(mockApiManagementClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'custom-grpc-api',
                expect.objectContaining({
                    displayName: 'Custom gRPC API',
                    path: '/grpc/custom',
                    protocols: ['https'],
                    apiType: 'http',
                    format: 'openapi',
                    import: true,
                    subscriptionRequired: true
                })
            );
        });

        it('should create gRPC API with versioning', async () => {
            const mockGrpcApi = {
                name: 'versioned-grpc-api',
                displayName: 'Versioned gRPC API',
                path: 'grpc/versioned',
                protocols: ['grpcs'],
                apiVersion: 'v1'
            };
            mockApiManagementClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockGrpcApi);

            const params = {
                apiId: 'versioned-grpc-api',
                displayName: 'Versioned gRPC API',
                protoDefinition: `
                    syntax = "proto3";
                    package example;
                    service ExampleService {
                        rpc GetExample(ExampleRequest) returns (ExampleResponse);
                    }
                    message ExampleRequest {
                        string id = 1;
                    }
                    message ExampleResponse {
                        string result = 1;
                    }
                `,
                path: 'grpc/versioned',
                versioningScheme: 'Segment' as 'Segment',
                initialVersion: 'v1'
            };

            const result = await grpcService.createGrpcApiFromProto(params);

            expect(result).toEqual({
                id: 'versioned-grpc-api',
                name: 'versioned-grpc-api',
                displayName: 'Versioned gRPC API',
                description: undefined,
                path: 'grpc/versioned',
                protocols: ['grpcs'],
                serviceUrl: undefined,
                apiVersion: 'v1',
                apiVersionSetId: undefined,
                isCurrent: undefined,
                isOnline: undefined,
                type: undefined,
                subscriptionRequired: undefined,
                authenticationSettings: undefined
            });
            expect(mockApiManagementClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'versioned-grpc-api',
                expect.objectContaining({
                    displayName: 'Versioned gRPC API',
                    path: '/grpc/versioned',
                    protocols: ['https'],
                    apiType: 'http',
                    format: 'openapi',
                    import: true,
                    subscriptionRequired: true
                })
            );
        });

        it('should create gRPC API with all optional parameters', async () => {
            const mockGrpcApi = {
                name: 'full-grpc-api',
                displayName: 'Full gRPC API',
                description: 'Complete gRPC API',
                path: 'grpc/full',
                protocols: ['grpcs'],
                serviceUrl: 'grpcs://api.example.com:443',
                apiVersion: 'v2',
                subscriptionRequired: false
            };
            mockApiManagementClient.api.beginCreateOrUpdateAndWait.mockResolvedValue(mockGrpcApi);

            const params = {
                apiId: 'full-grpc-api',
                displayName: 'Full gRPC API',
                protoDefinition: `
                    syntax = "proto3";
                    package example;
                    service ExampleService {
                        rpc GetExample(ExampleRequest) returns (ExampleResponse);
                    }
                    message ExampleRequest {
                        string id = 1;
                    }
                    message ExampleResponse {
                        string result = 1;
                    }
                `,
                description: 'Complete gRPC API',
                path: 'grpc/full',
                serviceUrl: 'grpcs://api.example.com:443',
                protocols: ['grpcs'] as ('grpcs')[],
                subscriptionRequired: false,
                versioningScheme: 'Header' as 'Header',
                initialVersion: 'v2',
                versionHeaderName: 'API-Version'
            };

            const result = await grpcService.createGrpcApiFromProto(params);

            expect(result).toEqual({
                id: 'full-grpc-api',
                name: 'full-grpc-api',
                displayName: 'Full gRPC API',
                description: 'Complete gRPC API',
                path: 'grpc/full',
                protocols: ['grpcs'],
                serviceUrl: 'grpcs://api.example.com:443',
                apiVersion: 'v2',
                apiVersionSetId: undefined,
                isCurrent: undefined,
                isOnline: undefined,
                type: undefined,
                subscriptionRequired: false,
                authenticationSettings: undefined
            });
            expect(mockApiManagementClient.api.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(
                'test-rg',
                'test-apim',
                'full-grpc-api',
                expect.objectContaining({
                    displayName: 'Full gRPC API',
                    path: '/grpc/full',
                    protocols: ['https'],
                    apiType: 'http',
                    format: 'openapi',
                    import: true,
                    subscriptionRequired: false,
                    serviceUrl: 'grpcs://api.example.com:443'
                })
            );
        });
    });
});
