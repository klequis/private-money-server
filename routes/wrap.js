// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/#cleaner-code-with-generators

const wrap = fn => (...args) => fn(...args).catch(args[2])

/* istanbul ignore next */
// const w1 = fn => (...args) => {
//   fn.catch(e => {
//     yellow('wrap: e', e)
//   })
// }

/* istanbul ignore next */
// const w2 = fn => (...args) =>
//   fn(...args).catch(() => {
//     green('length', args.length)
//     args[2](args[0])
//   })

export default wrap
