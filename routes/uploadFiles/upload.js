import wrap from 'routes/wrap'
import formidable from 'formidable'
import path from 'path'
import fse from 'fs-extra'

// eslint-disable-next-line
import { green, yellow } from 'logger'

const chkDataDir = async (dirPath) => {
  try {
    await fse.ensureDir(dirPath)
    return true
  } catch (err) {
    return false
  }
}

const upload = wrap(async (req, res, next) => {
  const dirname = __dirname
  const dataDir = path.join(__dirname, '../data')
  const dirChk = await chkDataDir(dataDir)

  if (!dirChk) {
    res.json({ error: 'could not create data directory' })
  }
  const form = formidable({ multiples: true, uploadDir: dataDir })
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    res.json({ fields, files, dirname, dataDir })
  })
})

export default upload
