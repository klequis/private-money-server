import fse from 'fs-extra'

export const fileExists = async (fullName) => {
  return fse.pathExists(fullName)
}
