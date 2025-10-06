import { z } from 'zod';
import { ValidationError } from './errors.js';

// Esquemas de validación para Azure APIM
export const apiInfoSchema = z.object({
  name: z.string().min(1).max(80),
  displayName: z.string().min(1).max(300),
  description: z.string().optional(),
  path: z.string().min(1),
  protocols: z.array(z.enum(['http', 'https'])).min(1),
  serviceUrl: z.string().url().optional(),
  subscriptionRequired: z.boolean().optional(),
});

export const createApiVersionSchema = z.object({
  apiId: z.string().min(1),
  versionId: z.string().min(1).max(80),
  displayName: z.string().min(1).max(100),
  description: z.string().optional(),
  sourceApiId: z.string().optional(),
  versioningScheme: z.enum(['Segment', 'Query', 'Header']).optional(),
  versionQueryName: z.string().optional(),
  versionHeaderName: z.string().optional(),
});

export const createApiRevisionSchema = z.object({
  apiId: z.string().min(1),
  apiRevision: z.string().optional(),
  description: z.string().optional(),
  sourceApiRevision: z.string().optional(),
});

export const updateApiSchema = z.object({
  displayName: z.string().min(1).max(300).optional(),
  description: z.string().optional(),
  path: z.string().min(1).optional(),
  protocols: z.array(z.enum(['http', 'https'])).min(1).optional(),
  serviceUrl: z.string().url().optional(),
  subscriptionRequired: z.boolean().optional(),
});

// Esquemas para MCP
export const mcpToolRequestSchema = z.object({
  name: z.string().min(1),
  arguments: z.record(z.any()),
});

export const mcpResourceRequestSchema = z.object({
  uri: z.string().min(1),
});

// Funciones de validación
export function validateApiInfo(data: unknown) {
  try {
    return apiInfoSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid API information', { 
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    throw error;
  }
}

export function validateCreateApiVersion(data: unknown) {
  try {
    return createApiVersionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid API version creation data', {
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    throw error;
  }
}

export function validateCreateApiRevision(data: unknown) {
  try {
    return createApiRevisionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid API revision creation data', {
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    throw error;
  }
}

export function validateUpdateApi(data: unknown) {
  try {
    return updateApiSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid API update data', {
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    throw error;
  }
}

export function validateMcpToolRequest(data: unknown) {
  try {
    return mcpToolRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid MCP tool request', {
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    throw error;
  }
}

export function validateMcpResourceRequest(data: unknown) {
  try {
    return mcpResourceRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid MCP resource request', {
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    throw error;
  }
}

// Utilidades de validación
export function isValidApiId(apiId: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(apiId) && apiId.length >= 1 && apiId.length <= 80;
}

export function isValidVersionId(versionId: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(versionId) && versionId.length >= 1 && versionId.length <= 80;
}

export function isValidRevisionId(revisionId: string): boolean {
  return /^\d+$/.test(revisionId) && parseInt(revisionId) > 0 && parseInt(revisionId) <= 2147483647;
}

export function sanitizeApiPath(path: string): string {
  // Asegurar than el path comience con /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // Remover múltiples slashes consecutivos
  path = path.replace(/\/+/g, '/');
  
  // Remover trailing slash excepto para root
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  
  return path;
}







