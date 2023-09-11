const {
  sleep,
  timeout,
  retry,
  TIMEOUT_ERROR_MESSAGE,
  RESPONSE_ERROR_MESSAGE,
  RETRY_ERROR_MESSAGE,
} = require("@/promises");

describe("sleep", () => {
  test("sleeps for half a second passing 500", async () => {
    const start: Date = new Date();
    await sleep(500);
    const end: Date = new Date();

    // TODO: consider check time to time difference utils
    const diff: number = end.getTime() - start.getTime();
    expect(diff).toBeGreaterThanOrEqual(499);
  });

  test("sleeps for 0.1 seconds passing 100", async () => {
    const start: Date = new Date();
    await sleep(100);
    const end: Date = new Date();
    const diff: number = end.getTime() - start.getTime();
    expect(diff).toBeGreaterThanOrEqual(99);
  });

  test("sleeps for 1 second without params", async () => {
    const start: Date = new Date();
    await sleep();
    const end: Date = new Date();
    const diff: number = end.getTime() - start.getTime();
    expect(diff).toBeGreaterThanOrEqual(999);
  });
});

function mockResolvedPromise(value: any, time: number) {
  return new Promise(resolve => setTimeout(() => resolve(value), time));
}

function mockRejectedPromise(error: any, time: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(error)), time)
  );
}

describe("timeout", () => {
  const data = "resolved data";

  test("In case of only resolve", async () => {
    const success = await timeout(mockResolvedPromise(data, 100), 300);
    expect(success).toBe(data);
  });

  test("In case of only rejected", async () => {
    await expect(() =>
      timeout(mockRejectedPromise(RESPONSE_ERROR_MESSAGE, 100), 300)
    ).rejects.toThrow(new Error(RESPONSE_ERROR_MESSAGE));
  });

  test("In case of timeout and resolve", async () => {
    await expect(() =>
      timeout(mockResolvedPromise(data, 300), 100)
    ).rejects.toThrow(new Error(TIMEOUT_ERROR_MESSAGE));
  });

  test("In case of timeout and rejected", async () => {
    await expect(() =>
      timeout(mockRejectedPromise(RESPONSE_ERROR_MESSAGE, 300), 100)
    ).rejects.toThrow(new Error(TIMEOUT_ERROR_MESSAGE));
  });
});

// test를 먼저 짜보자.

describe("retry", () => {
  const MAXIMUM_RETRY = 3;
  const INTEGER = {
    PASS: 50,
    BASE: 100,
    OVER: 150,
    MAX: 200,
  } as const;
  const RESPONSE_DATA = "return data";

  const passPromise = () => mockResolvedPromise(RESPONSE_DATA, INTEGER.PASS);
  const overPromise = () => mockResolvedPromise(RESPONSE_DATA, INTEGER.OVER);
  const maxOverPromise = () =>
    mockResolvedPromise(RESPONSE_DATA, INTEGER.MAX * (MAXIMUM_RETRY + 1));

  // Resolved 일 때
  test("no retry only one call", async () => {
    const startTime = new Date().getTime();
    const result = await retry(passPromise, MAXIMUM_RETRY, INTEGER.MAX);
    const endTime = new Date().getTime();
    const diffrence = endTime - startTime;

    expect(diffrence).toBeGreaterThanOrEqual(INTEGER.PASS);
    expect(diffrence).toBeLessThanOrEqual(INTEGER.BASE);
    expect(result).toBe(RESPONSE_DATA);
  });

  test("retry count over", async () => {
    const startTime = new Date().getTime();
    await expect(
      async () => await retry(maxOverPromise, MAXIMUM_RETRY, INTEGER.MAX)
    ).rejects.toThrow(new Error(RETRY_ERROR_MESSAGE));
    const endTime = new Date().getTime();
    const diffrence = endTime - startTime;

    expect(diffrence).toBeGreaterThanOrEqual(INTEGER.MAX * MAXIMUM_RETRY);
    expect(diffrence).toBeLessThanOrEqual(INTEGER.MAX * (MAXIMUM_RETRY + 1));
  });

  test("retring success first promise function", async () => {
    const startTime = new Date().getTime();
    const result = await retry(overPromise, MAXIMUM_RETRY, INTEGER.BASE);
    const endTime = new Date().getTime();
    const diffrence = endTime - startTime;

    expect(result).toBe(RESPONSE_DATA);
    expect(diffrence).toBeGreaterThanOrEqual(INTEGER.BASE);
    expect(diffrence).toBeLessThanOrEqual(INTEGER.MAX);
  });
});

// pending인지 fullfilled인지 확인하는것도 있으면 좋겠다.
