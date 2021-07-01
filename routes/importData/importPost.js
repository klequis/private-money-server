import { wrap } from 'routes/wrap'
import formidable from '../../formidable/src'
import path from 'path'
import fs from 'fs-extra'
import { green } from 'chalk'
import * as R from 'ramda'
import { isNilOrEmpty } from 'lib/isNilOrEmpty'
import { yellow } from 'logger'

/*
    When a non-csv file is uploaded result will be
    result {
      fields: { filename: [ filename, acctId ] },
      files: {},
      uploadDir: 'root/server/uploads'
    }

*/
const makeNonCsvFileReturn = (result) => {
  const { fields } = result

  return {
    data: { filename: R.keys(fields)[0] },
    error: 'Only .csv files are accepted.'
  }
}

const makeReturnMessage = (result) => {
  const { files } = result
  if (isNilOrEmpty(files)) {
    makeNonCsvFileReturn(result)
  } else {
    const file = R.path(['files', 'uploadedFiles'], result)
    return {
      data: {
        lastModifiedDate: R.prop('lastModifiedDate')(file),
        filePath: R.prop('filepath')(file),
        newFilename: R.prop('newFilename')(file),
        originalFilename: R.prop('originalFilename')(file),
        acctId: R.prop('originalFilename')(file)
      },
      error: null
    }
  }
}

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
    multiples: false,
    uploadDir: uploadDir // - doesn't work :(
  })

  const result = await new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }
      green('files', files)
      resolve({ fields, files, uploadDir })
    })
  })
  res.json(makeReturnMessage(result))

  form.on('error', function (error) {
    console.log('err', error)
  })
})

export default importPost
