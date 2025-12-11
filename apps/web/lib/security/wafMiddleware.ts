import { NextResponse, type NextRequest } from 'next/server';

// Minimal, Edge-compatible WAF stub to avoid runtime/build errors
// Do NOT use Node-only APIs here (fs, net, crypto, etc.).

export type Threat = { type: string; matched: string };
export type InspectResult = {
  allowed: boolean;
  blockReason?: string;
  threats: Threat[];
};

function basicHeuristics(request: NextRequest): Threat[] {
  try {
    const url = new URL(request.url);
    const q = url.search.toLowerCase();
    const suspicious: Threat[] = [];

    const patterns: Array<{ type: string; re: RegExp }> = [
      { type: 'xss', re: /<script|javascript:/i },
      { type: 'sql', re: /(union\s+select|drop\s+table|--|;)/i },
    ];

    for (const { type, re } of patterns) {
      if (re.test(q)) {
        suspicious.push({ type, matched: re.source });
      }
    }

    return suspicious;
  } catch {
    return [];
  }
}

export const wafMiddleware = {
  async inspectRequest(request: NextRequest): Promise<InspectResult> {
    // Light-touch: detect obvious patterns but don't block in development.
    const threats = basicHeuristics(request);

    // Always allow for now to avoid breaking UX; logging happens in middleware.ts
    return { allowed: true, threats };
  },

  createBlockedResponse(reason: string): NextResponse {
    return new NextResponse(JSON.stringify({ error: 'blocked', reason: reason || 'forbidden' }), {
      status: 403,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache, no-store, must-revalidate',
      },
    });
  },
};

export default wafMiddleware;
