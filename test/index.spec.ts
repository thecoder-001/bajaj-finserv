import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

async function callWorker(path: string, method: string, body?: any) {
  const req = new Request(`http://example.com${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ctx = createExecutionContext();
  const res = await worker.fetch(req, env);
  await waitOnExecutionContext(ctx);
  return res;
}

describe("BFHL Worker", () => {
  it("responds correctly to Example A", async () => {
    const res = await callWorker("/bfhl", "POST", { data: ["a","1","334","4","R","$"] });
    expect(res.status).toBe(200);

    const json = await res.json() as any;
    expect(json.is_success).toBe(true);
    expect(json.odd_numbers).toEqual(["1"]);
    expect(json.even_numbers).toEqual(["334","4"]);
    expect(json.alphabets).toEqual(["A","R"]);
    expect(json.special_characters).toEqual(["$"]);
    expect(json.sum).toBe("339");
    expect(json.concat_string).toBe("Ra");
  });

  it("responds with 404 for invalid route", async () => {
    const res = await callWorker("/", "GET");
    expect(res.status).toBe(404);
  });
});
