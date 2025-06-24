// Static configuration values from API documentation
export const TENANT_ID = "valigate";
export const USER_ID = "auth0|67efd0df0f83c40778e7dde2"; // For all APIs except /stream
export const STREAM_USER_ID = "a51047e3-452e-49ee-a226-1659eaa50c3c"; // For /stream API only

export interface ApiConfig {
  baseUrl: string;
  tenantId: string;
  userId: string;
  streamUserId: string;
}

export const API_CONFIG: ApiConfig = {
  baseUrl: "https://chatai.valigate.io/api",
  tenantId: TENANT_ID,
  userId: USER_ID,
  streamUserId: STREAM_USER_ID,
};

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
      const errorMessage =
        errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
