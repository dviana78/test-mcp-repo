export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpToolRequest {
  name: string;
  arguments: Record<string, any>;
}

export interface McpToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpResourceRequest {
  uri: string;
}

export interface McpResourceResponse {
  contents: Array<{
    uri: string;
    mimeType: string;
    text?: string;
    blob?: string;
  }>;
}

export interface McpPromptDefinition {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface McpPromptRequest {
  name: string;
  arguments?: Record<string, string>;
}

export interface McpPromptResponse {
  description?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: {
      type: 'text';
      text: string;
    };
  }>;
}

export interface McpServerCapabilities {
  logging?: Record<string, unknown>;
  prompts?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  tools?: {
    listChanged?: boolean;
  };
}

export interface McpInitializeRequest {
  protocolVersion: string;
  capabilities: McpServerCapabilities;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface McpInitializeResponse {
  protocolVersion: string;
  capabilities: McpServerCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
}

// Legacy interfaces for backward compatibility
export interface MCPRequest {
    context: string;
    data: any;
    timestamp: Date;
}

export interface MCPResponse {
    status: string;
    message: string;
    data?: any;
}

export interface MCPError {
    code: string;
    message: string;
    details?: string;
}

export interface MCPService {
    processRequest(request: MCPRequest): Promise<MCPResponse>;
    handleError(error: MCPError): void;
}







