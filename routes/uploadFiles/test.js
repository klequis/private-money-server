import wrap from 'routes/wrap'

// eslint-disable-next-line
import { green, yellow } from 'logger'

const test = wrap(async (req, res, next) => {
  res.send({ message: 'hello from text' })
})

export default test
