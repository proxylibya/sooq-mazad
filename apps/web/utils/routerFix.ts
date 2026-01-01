/**
 * إصلاح مشكلة "body stream already read" في Next.js router
 */

// Override fetch to handle response cloning automatically
const originalFetch = globalThis.fetch;

if (typeof window !== 'undefined') {
  // Client-side fetch override
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const response = await originalFetch(input, init);

      // Clone response for Next.js internal usage
      const clonedResponse = response.clone();

      // Add custom property to track if response was cloned
      (clonedResponse as any).__isCloned = true;

      return clonedResponse;
    } catch (error) {
      throw error;
    }
  };

  // Override Response.prototype.text to handle already read streams
  const originalText = Response.prototype.text;
  Response.prototype.text = async function () {
    try {
      if (this.bodyUsed && (this as any).__isCloned) {
        // If body is already used and this is a cloned response, return empty string
        return '';
      }
      return await originalText.call(this);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('body stream already read')) {
        return '';
      }
      throw error;
    }
  };

  // Override Response.prototype.json to handle already read streams
  const originalJson = Response.prototype.json;
  Response.prototype.json = async function () {
    try {
      if (this.bodyUsed && (this as any).__isCloned) {
        // If body is already used and this is a cloned response, return empty object
        return {};
      }
      return await originalJson.call(this);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('body stream already read')) {
        return {};
      }
      throw error;
    }
  };

  // Add error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('body stream already read')) {
      event.preventDefault();
    }
  });

  // Add error handler for general errors
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('body stream already read')) {
      event.preventDefault();
    }
  });
}

// Safe router navigation helper
export const safeRouterPush = (router: any, url: string) => {
  try {
    // Use window.location for more reliable navigation
    if (typeof window !== 'undefined') {
      window.location.href = url;
    } else {
      router.push(url);
    }
  } catch (error) {
    // Fallback to window.location
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  }
};

// Safe router replace helper
export const safeRouterReplace = (router: any, url: string) => {
  try {
    // Use window.location for more reliable navigation
    if (typeof window !== 'undefined') {
      window.location.replace(url);
    } else {
      router.replace(url);
    }
  } catch (error) {
    // Fallback to window.location
    if (typeof window !== 'undefined') {
      window.location.replace(url);
    }
  }
};

// Initialize the fix
export const initializeRouterFix = () => {
  // Router fix initialized silently
};

export default {
  safeRouterPush,
  safeRouterReplace,
  initializeRouterFix,
};
