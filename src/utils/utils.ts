/**
 * Return the value if it is defined; otherwise thrown an error.
 * @param value A value that might not be defined.
 * @param message Error message if the value is not defined.
 */
function checkUndefined<T>(value: T | null | undefined, message: string): T {
  if (value === undefined || value === null) {
    throw new Error(message);
  }

  return value;
}

/**
 * Wrap a function call with a cache. On first call the wrapped function is invoked to obtain a result. Subsequent
 * calls return the cached result.
 * @param f A function whose result should be cached.
 */
function cache<T>(f: () => T): () => T {
  let value: T | undefined;
  return () => {
    if (value === undefined) {
      value = f();
    }
    return value;
  };
}

function toHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, byte => {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}

export {toHexString, checkUndefined, cache};
