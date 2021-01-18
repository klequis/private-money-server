import csv from 'csvtojson'

export const readCsvFile = async (account) => {
  const { dataFilename, hasHeaders } = account

  if (hasHeaders) {
    const json = await csv({
      trim: true,
      checkType: true,
      noheader: false,
      headers: []
    }).fromFile(`data/${dataFilename}`)
    return json
  } else {
    const json = await csv({
      trim: true,
      checkType: true,
      noheader: true,
      headers: []
    }).fromFile(`data/${dataFilename}`)
    return json
  }
}
