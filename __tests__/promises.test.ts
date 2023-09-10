const {
  sleep,
  timeout,
  retry,
  TIMEOUT_ERROR_MESSAGE,
  RESPONSE_ERROR_MESSAGE,
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
  // const [MAXIMUM_RETRY, INTEGER] = [2, 150];

  const MAXIMUM_RETRY = 10;

  const INTEGER = {
    PASS: 100,
    BASE: 200,
    // OVER: 200,
    OVER: 2000,
  } as const;
  // const PROMISE_END_TIME = {
  //   OVER: INTEGER + 50,
  //   PASS: INTEGER - 50,
  // };

  const RESPONSE_DATA = "return data";

  test("retry가 일어난걸 체크", async () => {
    // 첫케이스
    const start = new Date();
    await retry(
      () => mockResolvedPromise(RESPONSE_DATA, INTEGER.OVER),
      MAXIMUM_RETRY,
      INTEGER.BASE
    );
    const end = new Date();
    const difference = end.getTime() - start.getTime();

    // await expect(difference).toBeGreaterThanOrEqual(INTEGER.BASE);
    expect(difference).toBeLessThanOrEqual(INTEGER.OVER * 2);

    // 두번째 케이스
  });

  /*
  test("retry no Because only resolve", async () => {
    const start = new Date();
    const result = await retry(
      () => mockResolvedPromise(RESPONSE_DATA, PROMISE_END_TIME.PASS),
      MAXIMUM_RETRY,
      INTEGER
    );
    const end = new Date();

    const diffrence = end.getTime() - start.getTime();
    expect(diffrence).toBeLessThanOrEqual(INTEGER);
  });

  */

  // test(`retryed only once Because the first promise is resolved when the second promise is pending.`, async () => {
  //   const start = new Date();
  //   const result = await retry(
  //     () => mockResolvedPromise(RESPONSE_DATA, PROMISE_END_TIME.OVER),
  //     MAXIMUM_RETRY,
  //     INTEGER
  //   );
  //   const end = new Date();

  //   const diffrence = end.getTime() - start.getTime();

  //   expect(result).toBe(RESPONSE_DATA);
  //   // to be greater than or equal why? end time is all retry after
  //   expect(diffrence).toBeGreaterThanOrEqual(PROMISE_END_TIME.OVER);
  // });

  // test(`어떤거 체크할까 2번 pending일때 1번이 resolved가 되었을 떄 더이상 호출을 하지 않는지`, async () => {
  //   const start = new Date();
  //   const result = await retry(
  //     () => mockResolvedPromise(RESPONSE_DATA, PROMISE_END_TIME.OVER * 5),
  //     2,
  //     INTEGER
  //   );
  //   const end = new Date();

  //   const diffrence = end.getTime() - start.getTime();

  //   // count 확인해보자.
  //   expect(result).toBe([RESPONSE_DATA, 2]);
  //   expect(diffrence).toBeLessThanOrEqual(INTEGER * MAXIMUM_RETRY);
  //   expect(diffrence).toBeGreaterThanOrEqual(PROMISE_END_TIME.OVER);

  //   // 왜 throw error를 하는걸까?
  // });

  // test("0번인 경우");
});

// pending인지 fullfilled인지 확인하는것도 있으면 좋겠다.
