const TIMEOUT_ERROR_MESSAGE = "Timeout Error";
const RESPONSE_ERROR_MESSAGE = "Response Error";

/**
 * This method receives a time in milliseconds and returns a promise that resolves after that time.
 * @param {number} time - The time in milliseconds.
 * @returns {Promise} - The promise that resolves after the time.
 */
function sleep(time: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * * If the promise is not fulfilled within the specified time, a Timeout Error is throw reject.
 * @template T
 * @param {Promise<T>} promise
 * @param {number} [time=8000]
 * @returns {Promise<T>}
 * @throws {TimeoutError} Throws a TimeoutError if the timeout is exceeded.
 */
function timeout<T>(promise: Promise<T>, time = 8000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject(new Error(TIMEOUT_ERROR_MESSAGE)),
      time
    );

    promise
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

/**
 *  description
 * @template T
 * @param {Promise<T>} promiseFunction
 * @param {number} maximumRetry
 * @param {number} retryInterval
 *
 */

/*
✅ 이전에 작성항 코드
async function retry<T>(
  promiseFunction: () => Promise<T>,
  maximumRetry: number,
  retryInterval: number
) {
  let retryCount = 0;

  function isMaximum() {
    return retryCount >= maximumRetry;
  }

  // 한번만 retry를 하네 지금보니까.
  // for문같은걸 돌려줘야하네.

  // for(let i = 0; i < maximumRetry; i++) {
  //   try {

  //   } catch(err) {}
  // }

  const retryTimeoutId = setTimeout(() => {
    if (isMaximum()) {
      throw new Error("isMaximum");
    }

    console.log(`retry start count is ${retryCount}`);
    promiseFunction();
    retryCount++;
  }, retryInterval);

  try {
    const response = await promiseFunction();
    clearTimeout(retryTimeoutId);
    // return response;
    console.log("retryCount", retryCount);
    return [response, retryCount];
  } catch (err) {
    if (isMaximum()) {
      throw new Error(
        "Timeout Error: you promise function call is over maximum retry"
      );
    }
    // 그렇지 않은 경우에는 걍 여기서 끝내버린다. 어차피 retry에서 throw 해줄거기때문에
  }
}

*/

// async function retry<T>(
//   promiseFunction: () => Promise<T>,
//   maximumRetry: number,
//   retryInterval: number
// ) {
//   const setTimeoutIds = [];

//   for (let retryCount = 0; retryCount < maximumRetry; retryCount++) {
//     const timeoutId = setTimeout(() => {}, retryInterval * retryCount + 1);
//     setTimeoutIds.push();
//   }

//   let retryCount = 0;

//   function isMaximum() {
//     return retryCount >= maximumRetry;
//   }

//   // const retryTimeoutId = setTimeout(() => {
//   //   if (isMaximum()) {
//   //     throw new Error("isMaximum");
//   //   }

//   //   console.log(`retry start count is ${retryCount}`);
//   //   promiseFunction();
//   //   retryCount++;
//   // }, retryInterval);

//   // try {
//   //   const response = await promiseFunction();
//   //   clearTimeout(retryTimeoutId);
//   //   // return response;
//   //   console.log("retryCount", retryCount);
//   //   return [response, retryCount];
//   // } catch (err) {
//   //   if (isMaximum()) {
//   //     throw new Error(
//   //       "Timeout Error: you promise function call is over maximum retry"
//   //     );
//   //   }
//   //   // 그렇지 않은 경우에는 걍 여기서 끝내버린다. 어차피 retry에서 throw 해줄거기때문에
//   // }
// }

// 반환하지 않아도 될것같은데?

async function retry<T>(
  promiseFunction: () => Promise<T>,
  maximumRetry: number = 5,
  retryInterval: number = 3000
): Promise<any> {
  const retryCount = 0;
  const shouldRetry = retryCount <= maximumRetry;

  console.log(`
  maximumRetry: ${maximumRetry}
  `);

  if (shouldRetry) {
    // 얘는 넘기지 않고 몇초간 기다린다.
    try {
      const result = promiseFunction();
      await timeout(result, retryInterval);

      return result;
    } catch (err) {
      // 타임아웃에서 throw error를 했다면
      return retry(promiseFunction, maximumRetry - 1, retryInterval);
    }

    // console.error(difference);
    // console.log(start.getSeconds(), end.getSeconds());

    // 아직까지 이전 그게 끝나지 않았다면 retry해준다.
  }

  return Promise.reject("retry error");
}

// function run();

export { sleep, timeout, retry, TIMEOUT_ERROR_MESSAGE, RESPONSE_ERROR_MESSAGE };
