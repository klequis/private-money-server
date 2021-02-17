import wrap from 'routes/wrap'
import formidable from 'formidable'

// eslint-disable-next-line
import { green, yellow } from 'logger'

const upload = wrap(async (req, res, next) => {
  const form = formidable({ multiples: true })

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }

    res.json({ fields, files })
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
