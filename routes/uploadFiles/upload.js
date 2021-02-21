import wrap from 'routes/wrap'
import formidable from 'formidable'
import path from 'path'
import fse from 'fs-extra'

// eslint-disable-next-line
import { green, yellow } from 'logger'

const chkUploadsDir = async (dirPath) => {
  try {
    await fse.ensureDir(dirPath)
    return true
  } catch (err) {
    return false
  }
}

const upload = wrap(async (req, res, next) => {
  const dirname = __dirname
  const uploadsDir = path.join(__dirname, '../../uploads')
  const dirChk = await chkUploadsDir(uploadsDir)

  if (!dirChk) {
    res.json({ error: 'could not create upload directory' })
  }
  const form = formidable({
    multiples: true,
    uploadDir: uploadsDir
  })
  console.log('form', form)
  // form.uploadDir
  // form.uploadDir: '/home/klequis/dev/formidable-express-react-ex/server/uploads'
  form.uploadDir = uploadsDir
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    res.json({ fields, files, dirname, uploadsDir })
  })
})

export default upload

/*
const upload = wrap(async (req, res, next) => {
  const dataDir = path.join(__dirname, '../../data')
  const dirChk = await chkDataDir(dataDir)

  yellow('dataDir', dataDir)

  if (!dirChk) {
    res.json({ error: 'could not create data directory' })
  }
  const form = formidable({ multiples: true, uploadDir: dataDir })
  yellow('form', form)
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }

    res.json({ fields, files, dataDir })
  })
})
*/
