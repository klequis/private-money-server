import * as R from 'ramda'
import {
  operatorSelectFieldNames,
  criteriaSelectFieldNames
} from 'db/constants'

// eslint-disable-next-line
import { blue, yellow, redf } from 'logger'

const isCriterionFieldPropValueValid = (criterion) => {
  const { field } = criterion
  return R.includes(field, criteriaSelectFieldNames)
    ? ''
    : `${field} is not a valid property for criteria.field`
}

const isCriterionValuePropValueLongEnough = (criterion) => {
  if (!R.has('value')(criterion)) {
    return "Criterion is missing required property 'value'"
  }
  const { value } = criterion

  return value.length > 2
    ? ''
    : `criterion: value prop must be 3 or more characters, received ${value} with length ${value.length}`
}

const isCriterionOperatorPropValueValid = (criterion) => {
  const { operator } = criterion
  return R.includes(operator, operatorSelectFieldNames)
    ? ''
    : `${operator} is not a valid value for criterion.value`
}

const isCriterionActive = (criterion) => {
  const { active } = criterion
  return active
    ? ''
    : 'Received criterion where criterion.active=false. Cannot process inactive criterion.'
}

const predicates = [
  isCriterionActive,
  isCriterionFieldPropValueValid,
  isCriterionValuePropValueLongEnough,
  isCriterionOperatorPropValueValid
]

const check = R.pipe(
  (x) => ({
    _id: x._id,
    errors: predicates.map((p) => p(x))
  }),
  (x) => ({ _id: x._id, errors: R.filter((e) => e !== '', x.errors) })
)

const criteriaValidation = (criteria) => {
  const _is = R.filter((e) => e.errors.length > 0)(R.map(check, criteria))
  return _is
}

export default criteriaValidation
