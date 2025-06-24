// Static configuration values from API documentation
export const TENANT_ID = "valigate";
export const USER_ID = "auth0|67efd0df0f83c40778e7dde2"; // For all APIs except /stream
export const STREAM_USER_ID = "a51047e3-452e-49ee-a226-1659eaa50c3c"; // For /stream API only

// Base API configuration
export interface ApiConfig {
  baseUrl: string;
  tenantId: typeof TENANT_ID;
  userId: typeof USER_ID;
  streamUserId: typeof STREAM_USER_ID;
}

// API Configuration
export const API_CONFIG: ApiConfig = {
  baseUrl: "https://chatai.valigate.io/api",
  tenantId: TENANT_ID,
  userId: USER_ID,
  streamUserId: STREAM_USER_ID,
};

// Custom error class for API errors
export class ApiException extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiException";
  }
}

// Generic fetch wrapper with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiException(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException(
      error instanceof Error ? error.message : "Unknown error occurred",
      0
    );
  }
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
