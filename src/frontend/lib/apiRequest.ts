interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return {
      success: response.ok,
      data: response.ok ? data : undefined,
      error: !response.ok ? data.error : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
} 