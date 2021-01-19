import csv from 'csvtojson'

export const readCsvFile = async (account) => {
  const { dataFilename, hasHeaders, acctId } = account

  if (hasHeaders) {
    const json = await csv({
      trim: true,
      checkType: true,
      noheader: false,
      headers: []
    }).fromFile(`data/${dataFilename}`)
    return { acctId, data: json }
  } else {
    const json = await csv({
      trim: true,
      checkType: true,
      noheader: true,
      headers: []
    }).fromFile(`data/${dataFilename}`)
    // returning acctId to help with validation (record count)
    return { acctId, data: json }
  }
}
