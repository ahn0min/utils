const {
  sleep,
  timeout,
  TIMEOUT_ERROR_MESSAGE,
  RESPONSE_ERROR_MESSAGE,
} = require("@/promises");

describe("sleep", () => {
  test("sleeps for half a second passing 500", async () => {
    const start: Date = new Date();
    await sleep(500);
    const end: Date = new Date();
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

describe("timout", () => {
  // 정상적일 때 체크할 데이터
  const data = "resolved data";

  // 끝났고 요청성공일때
  test("fulfilled within the specified time", async () => {
    const success = await timeout(mockResolvedPromise(data, 100), 300);
    expect(success).toBe(data);
  });

  // 끝났는데 요청실패일때
  test("fulfilled within the specified time", async () => {
    // response error인 경우
    // const fail = await timeout(mockRejectedPromise(data, 100), 300);

    await expect(async () => {
      await timeout(mockRejectedPromise(RESPONSE_ERROR_MESSAGE, 100), 300);
    }).rejects.toThrowError(new Error(RESPONSE_ERROR_MESSAGE));
  });

  // 요청이 안왔는데 시간이 끝났을 때
  test("not fulfilled within the specified time and new Timeout Error", async () => {
    await expect(async () => {
      await timeout(mockResolvedPromise(data, 300), 100);
    }).rejects.toThrowError(new Error(TIMEOUT_ERROR_MESSAGE));
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
