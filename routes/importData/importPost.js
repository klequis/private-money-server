import { wrap } from 'routes/wrap'
import formidable from '../../formidable/src'
import path from 'path'
import fs from 'fs-extra'
// import * as R from 'ramda'

/*
    Import will fail silently if the uploads/ directory does not exist
*/
const importPost = wrap(async (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads')

  await fs.ensureDir(uploadDir)

  const form = formidable({
    filter: function ({ name, originalFilename, mimetype }) {
      return mimetype && mimetype.includes('text/csv')
    },
    multiples: true,
    uploadDir: uploadDir // - doesn't work :(
  })

  const a = await new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }
      resolve({ fields, files, uploadDir })
    })
  })
  const { /* fields, */ files } = a
  console.log(
    'files.uploadedFiles.originalFilename',
    files.uploadedFiles.originalFilename
  )
  // console.log('files', files.uploadedFiles)

  res.json({ result: files.uploadedFiles.originalFilename })

  // TODO: Confirm this code is needed or not
  // const r = files.uploadedFiles.map((f) => {
  //   return {
  //     lastModifiedDate: f.lastModifiedDate,
  //     filePath: f.filepath,
  //     newFilename: f.newFilename,
  //     originalFilename: f.originalFilename,
  //     acctId: fields[f.originalFilename][1]
  //   }
  // })
  // res.json(r.map((f) => f.originalFilename))

  form.on('error', function (error) {
    console.log('err', error)
  })
})

export default importPost
