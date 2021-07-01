import { wrap } from 'routes/wrap'
import formidable from '../../formidable/src'
import path from 'path'
import fs from 'fs-extra'
import { green } from 'chalk'
import * as R from 'ramda'
import { isNilOrEmpty } from 'lib/isNilOrEmpty'

/*
    When a non-csv file is uploaded result will be
    result {
      fields: { filename: [ filename, acctId ] },
      files: {},
      uploadDir: 'root/server/uploads'
    }

*/
const getFilenameNonCsv = (result) => {
  const { fields } = result
  return R.keys(fields)[0]
}

const makeReturnMessage = (result) => {
  const { files } = result
  if (isNilOrEmpty(files)) {
    // get filename from
    return {
      data: { filename: getFilenameNonCsv(result) },
      error: 'Only .csv files are accepted.'
    }
  } else {
    return {
      // data: { filename: files.uploadedFiles.originalFilename },
      data: {
        filename: R.path(['files', 'uploadedFiles', 'originalFilename'], result)
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
  // console.log('typeof files', typeof files)
  // files.forEach((f) => console.log('f', typeof f))
  // console.log('files', files)
  // console.log(
  //   'files.uploadedFiles.originalFilename',
  //   files.uploadedFiles.originalFilename
  // )
  // console.log('files', files.uploadedFiles)
  /*
      If a file which is not .csv is uploaded `result.files will === {}`
      Returning {} would add not useful information to the client
      so filter it/them out.
  */
  console.log('result', result)

  res.json(makeReturnMessage(result))
  // res.json({ b: 'a' })

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
