/**
 * Interfaces for the Azure APIM MCP Server
 * This module exports all interface definitions for dependency injection and type safety
 */

// Core interfaces
export type { ILogger, ILoggerFactory } from './ILogger.js';

// Specialized service interfaces
export type { IApiManagementService } from './IApiManagementService.js';
export type { IApiVersioningService } from './IApiVersioningService.js';
export type { IGrpcService } from './IGrpcService.js';
export type { IProductsManagementService } from './IProductsManagementService.js';
export type { ISubscriptionsManagementService } from './ISubscriptionsManagementService.js';
export type { IApiOperationsService } from './IApiOperationsService.js';
export type { IBackendServicesService } from './IBackendServicesService.js';

// Re-export commonly used types
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type ApiProtocol = 'http' | 'https' | 'grpc' | 'grpcs';
export type VersioningScheme = 'Segment' | 'Query' | 'Header';

/**
 * Common response interface for all service operations
 */
export interface IServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Pagination interface for list operations
 */
export interface IPaginationOptions {
  top?: number;
  skip?: number;
  filter?: string;
}

/**
 * Error interface for consistent error handling
 */
export interface IServiceError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}







