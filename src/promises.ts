const TIMEOUT_ERROR_MESSAGE = "Timeout Error";
const RESPONSE_ERROR_MESSAGE = "Response Error";
const RETRY_ERROR_MESSAGE = "Retry Error";

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

// 반환하지 않아도 될것같은데?

async function retry<T>(
  promiseFunction: () => Promise<T>,
  maximumRetry: number = 5,
  retryInterval: number = 3000,
  error: Error = new Error(RETRY_ERROR_MESSAGE)
): Promise<any> {
  const shouldRetry = maximumRetry > 0;
  console.log(maximumRetry);
  if (!shouldRetry) {
    return Promise.reject(new Error(RETRY_ERROR_MESSAGE));
  }

  try {
    const result = await timeout(promiseFunction(), retryInterval);
    return result;
  } catch (err) {
    return retry(promiseFunction, maximumRetry - 1, retryInterval, error);
  }

  // return timeout(promiseFunction(), retryInterval).catch(error => {
  //   return retry(promiseFunction, maximumRetry - 1, retryInterval, error);
  // });
}

export {
  sleep,
  timeout,
  retry,
  TIMEOUT_ERROR_MESSAGE,
  RESPONSE_ERROR_MESSAGE,
  RETRY_ERROR_MESSAGE,
};
