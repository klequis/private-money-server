// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/#cleaner-code-with-generators

export const wrap =
  (fn) =>
  (...args) =>
    fn(...args).catch(args[2])
