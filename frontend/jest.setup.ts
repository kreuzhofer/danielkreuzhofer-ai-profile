import "@testing-library/jest-dom";

// Add Web API globals for testing Next.js API routes
// These are available in Node.js 18+ but not automatically in Jest's jsdom environment
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream, TransformStream } from "stream/web";

// Polyfill Web API globals for streams
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
global.ReadableStream = ReadableStream as typeof global.ReadableStream;
global.TransformStream = TransformStream as typeof global.TransformStream;

// Polyfill Response for stream handler tests
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: ReadableStream | null;
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body as ReadableStream | null;
      this.ok = init?.status ? init.status >= 200 && init.status < 300 : true;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
    }

    async json() {
      if (!this.body) return null;
      const reader = this.body.getReader();
      const chunks: Uint8Array[] = [];
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) chunks.push(result.value);
      }
      const text = new TextDecoder().decode(Buffer.concat(chunks));
      return JSON.parse(text);
    }
  } as unknown as typeof Response;
}
