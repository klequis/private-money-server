import { wrap } from 'routes/wrap'
import formidable from '../../formidable/src'
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
  try {
    const uploadDir = path.join(__dirname, '../../uploads')
    await chkUploadsDir(uploadDir)
    yellow('upload: uploadDir', uploadDir)
    const form = formidable({
      multiples: true,
      uploadDir: uploadDir // - doesn't work :(
    })
    yellow('upload: form', form)
    form.parse(req, async (err, fields, files) => {
      if (err) {
        yellow('upload: PARSE ERROR')
        next(err)
        return
      }
      yellow('upload: RETURNING JSON')
      res.json({ fields, files, uploadDir })
    })
    form.on('error', (error) => {
      console.log('err', error)
    })
    form.on('end', () => console.log('DONE'))
  } catch (e) {
    console.log('e', e)
  }
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
