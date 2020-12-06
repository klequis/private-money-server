# Routes


- getData(filter = {})
- loadData()

ROUTE - get '/' dataImport()
```js
importData.dataImport() {
  transformData(account, rawData) {
    mapToFields.amount._getFieldValue(fieldName, account, doc) {
      if (field.name === amount) {
        _getValueForAmount(account, doc) {
          if (hasCreditDebitFields) {
            _getValueForCreditDebitFields(account, doc)
          } else {
            _getValueforAmountField(account, doc)
          }
        }
      } else {
        _getValueForOtherField
      }
    }
  }
}

```

**`transformData()`**
```js

amount: R.pipe(
  _getAmountValue
)(tFields.amount.name, account, doc)


// const _getAmountValue = (fieldName, account, doc) => {
//   const { hasDebitCreditFields, swapAmountFieldSign } = account
//   const value = hasDebitCreditFields
//     ? _getDebitOrCreditValue(field, account, doc)
//     : _getAmountFieldValue(account, doc)

//   return swapAmountFieldSign
//     ? -value
//     : value
// }


const _getAmountFieldValue = (field, account, doc) => {
  const { hasCreditDebitFields, swapAmountFieldSign } = account

  let value

  if (hasCreditDebitFields) {
    const creditVal = _getValueFromRawData(tFields.credit.name, account, doc)
    const debitVal = _getValueFromRawData(tFields.debit.name, account, doc)
    if (_isZeroOrEmpty(creditVal) && !_isZeroOrEmpty(debitVal)) {
      // amount is a debit
      value = debitVal
    } else if (!_isZeroOrEmpty(creditVal) && _isZeroOrEmpty(debitVal)) {
      // amount is a credit
      value = creditVal
    } else {
      thorw new Error('both credit & debit are zero (0)')
    }
  }
  return value
}

const _getFieldValueFromRawData = (fieldName, account, doc) => {
  const { colMap } = account
  const colNum = R.prop(fieldName, colMap)
  return doc[`field${colNum}`]
}

```