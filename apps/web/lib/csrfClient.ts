// CSRF Protection Client-side utilities
export interface CSRFTokenResponse {
  token: string;
  expires: string;
}

class CSRFClient {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  async getToken(): Promise<string> {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data: CSRFTokenResponse = await response.json();
      this.token = data.token;
      this.tokenExpiry = new Date(data.expires);

      return this.token;
    } catch (error) {
      console.error('CSRF token fetch failed:', error);
      throw error;
    }
  }

  async makeSecureRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();

    const headers = new Headers(options.headers);
    headers.set('X-CSRF-Token', token);
    headers.set('Content-Type', 'application/json');

    return fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin',
    });
  }

  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
  }

  isTokenValid(): boolean {
    return this.token !== null && this.tokenExpiry !== null && new Date() < this.tokenExpiry;
  }
}

export const csrfClient = new CSRFClient();
export default CSRFClient;
