// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/#cleaner-code-with-generators

const wrap = (fn) => (...args) => fn(...args).catch(args[2])

export default wrap

// a potential replacement for wrap
// const asyncUtil = (fn) =>
//   function asyncUtilWrap(...args) {
//     const fnReturn = fn(...args)
//     const next = args[args.length - 1]
//     return Promise.resolve(fnReturn).catch(next)
//   }
