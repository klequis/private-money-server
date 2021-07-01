import { isNil, isEmpty } from 'ramda'

/*
    isNil
    - null -> true
    - undefined -> true

    isEmpty
    - []   -> true
    - ''   -> true
    - null -> false
    - {}   -> true
*/

export const isNilOrEmpty = (value) => {
  if (isNil(value) || isEmpty(value)) {
    return true
  }
  return false
}
