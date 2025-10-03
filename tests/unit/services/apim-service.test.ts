import { ApimService } from '../../../src/services/apim-service';
import { AzureClient } from '../../../src/services/azure-client';

describe('ApimService', () => {
    let apimService: ApimService;
    let azureClient: AzureClient;

    beforeEach(() => {
        azureClient = new AzureClient();
        apimService = new ApimService(azureClient);
    });

    it('should create an instance of ApimService', () => {
        expect(apimService).toBeInstanceOf(ApimService);
    });

    // Add more tests for ApimService methods here
});