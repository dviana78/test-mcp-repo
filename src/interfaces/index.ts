/**
 * Interfaces for the Azure APIM MCP Server
 * This module exports all interface definitions for dependency injection and type safety
 */

export type { ILogger, ILoggerFactory } from './ILogger';
export type { IApimService, IApimServiceConfig, IApimServiceFactory } from './IApimService';

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