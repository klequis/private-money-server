export const wrap = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/#cleaner-code-with-generators
// Pervious -->
// const wrap = (fn) => (...args) => fn(...args).catch(args[2])
// export default wrap
// <--

// a potential replacement for wrap
// const asyncUtil = (fn) =>
//   function asyncUtilWrap(...args) {
//     const fnReturn = fn(...args)
//     const next = args[args.length - 1]
//     return Promise.resolve(fnReturn).catch(next)
//   }
