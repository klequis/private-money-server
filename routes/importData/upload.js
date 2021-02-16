import wrap from 'routes/wrap'

// eslint-disable-next-line
import { green, yellow } from 'logger'

const upload = wrap(async (req, res) => {
  if (!req.files) {
    return res.status(500).send({ msg: 'file is not found' })
  }
  const myFile = req.files.file
  console.log(req.files.file)

  // Use the mv() method to place the file somewhere on your server

  console.log('path', `/${myFile.name}`)

  return res.send({
    file: myFile.name,
    path: `/${myFile.name}`,
    ty: myFile.type
  })
})

export default upload

/*
app.post('/upload', (req, res) => {
  if (!req.files) {
    return res.status(500).send({ msg: 'file is not found' })
  }

  const myFile = req.files.file
  console.log(req.files.file)

  // Use the mv() method to place the file somewhere on your server
  myFile.mv(`${__dirname}/public/${myFile.name}`, function (err) {
    if (err) {
      console.log(err)
      return res.status(500).send({ msg: 'fuck eroor' })
    }
    console.log('path', `/${myFile.name}`)
    return res.send({
      file: myFile.name,
      path: `/${myFile.name}`,
      ty: myFile.type
    })
  })
})

*/
