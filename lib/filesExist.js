import fse from 'fs-extra'

export const filesExist = async (fullName) => {
  return fse.pathExists(fullName)
}
