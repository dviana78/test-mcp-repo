import { ToolsHandler } from '../../../src/handlers/tools';
import { ApiManagementService } from '../../../src/services/api-management.service';
import { ApiVersioningService } from '../../../src/services/api-versioning.service';
import { GrpcService } from '../../../src/services/grpc.service';
import { ProductsManagementService } from '../../../src/services/products-management.service';
import { SubscriptionsManagementService } from '../../../src/services/subscriptions-management.service';
import { ApiOperationsService } from '../../../src/services/api-operations.service';
import { BackendServicesService } from '../../../src/services/backend-services.service';

describe('ToolsHandler', () => {
    let toolsHandler: ToolsHandler;
    let mockApiManagementService: jest.Mocked<ApiManagementService>;
    let mockApiVersioningService: jest.Mocked<ApiVersioningService>;
    let mockGrpcService: jest.Mocked<GrpcService>;
    let mockProductsManagementService: jest.Mocked<ProductsManagementService>;
    let mockSubscriptionsManagementService: jest.Mocked<SubscriptionsManagementService>;
    let mockApiOperationsService: jest.Mocked<ApiOperationsService>;
    let mockBackendServicesService: jest.Mocked<BackendServicesService>;

    beforeEach(() => {
        // Create mock services
        mockApiManagementService = {
            listApis: jest.fn(),
            getApi: jest.fn(),
            createApiFromYaml: jest.fn(),
        } as any;

        mockApiVersioningService = {
            createApiVersion: jest.fn(),
            createApiRevision: jest.fn(),
            listApiVersions: jest.fn(),
            listApiRevisions: jest.fn(),
        } as any;

        mockGrpcService = {
            createGrpcApiFromProto: jest.fn(),
        } as any;

        mockProductsManagementService = {
            listProducts: jest.fn(),
            getProduct: jest.fn(),
            createProduct: jest.fn(),
            getApiProducts: jest.fn(),
            addApiToProduct: jest.fn(),
        } as any;

        mockSubscriptionsManagementService = {
            listSubscriptions: jest.fn(),
            getSubscription: jest.fn(),
            createSubscription: jest.fn(),
        } as any;

        mockApiOperationsService = {
            getApiOperations: jest.fn(),
        } as any;

        mockBackendServicesService = {
            listBackends: jest.fn(),
        } as any;

        toolsHandler = new ToolsHandler(
            mockApiManagementService,
            mockApiVersioningService,
            mockGrpcService,
            mockProductsManagementService,
            mockSubscriptionsManagementService,
            mockApiOperationsService,
            mockBackendServicesService
        );
    });

    it('should create an instance of ToolsHandler', () => {
        expect(toolsHandler).toBeInstanceOf(ToolsHandler);
    });

    it('should have all available tools', () => {
        const tools = toolsHandler.getAvailableTools();
        expect(tools).toBeDefined();
        expect(Array.isArray(tools)).toBe(true);
        expect(tools.length).toBeGreaterThan(0);
        
        // Check that some expected tools exist
        const toolNames = tools.map(tool => tool.name);
        expect(toolNames).toContain('list_apis');
        expect(toolNames).toContain('create_product');
        expect(toolNames).toContain('list_subscriptions');
    });

    it('should execute list_apis tool successfully', async () => {
        mockApiManagementService.listApis.mockResolvedValue([]);

        const result = await toolsHandler.executeTool({
            name: 'list_apis',
            arguments: {}
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(mockApiManagementService.listApis).toHaveBeenCalled();
    });

    it('should handle invalid tool name', async () => {
        const result = await toolsHandler.executeTool({
            name: 'invalid_tool',
            arguments: {}
        });

        expect(result).toBeDefined();
        expect(result.isError).toBe(true);
        expect(result.content).toBeDefined();
        expect(result.content[0].text).toContain('Unknown tool: invalid_tool');
    });
});