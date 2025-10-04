import { ApiInfo } from '../types';

/**
 * Interface for gRPC Service
 * Handles gRPC API creation from Protobuf definitions with HTTP transcoding
 */
export interface IGrpcService {
  /**
   * Create a new gRPC API from Protobuf definition with optional versioning
   * @param params - gRPC API creation parameters
   * @returns Promise resolving to created gRPC API details
   */
  createGrpcApiFromProto(params: {
    apiId: string;
    displayName: string;
    description?: string;
    path?: string;
    serviceUrl?: string;
    protoDefinition: string;
    protocols?: string[];
    subscriptionRequired?: boolean;
    initialVersion?: string;
    versioningScheme?: 'Segment' | 'Query' | 'Header';
    versionQueryName?: string;
    versionHeaderName?: string;
  }): Promise<ApiInfo>;
}