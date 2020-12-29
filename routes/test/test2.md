I have an array of Rules.

```js
[
  {
    _id: ObjectId('5e95fe747886220133884c7e'),
    criteria: [
      {
        _id: '5e95fe747886220133884c7b',
        field: 'description',
        operator: 'equals',
        value: 'CHECK 2455'
      },
      {
        _id: '5e95fe747886220133884c7c',
        field: 'debit',
        operator: 'equals',
        value: '-40'
      }
    ],
    actions: [
      {
        _id: '5e95fe747886220133884c7d',
        action: 'replaceAll',
        field: 'description',
        findValue: '',
        numAdditionalChars: '',
        replaceWithValue: 'Michael Costanza CHK 2455 ',
        category1: '',
        category2: ''
      },
      {
        _id: 'a0INPP6Xb',
        action: 'categorize',
        field: '',
        findValue: '',
        numAdditionalChars: '',
        replaceWithValue: '',
        category1: 'daniel',
        category2: 'tutoring-michael'
      }
    ]
  },
  {},
  ...
]
```

Rules have Criteria which is an array of objects with 4 fields each. Call them Criterion

I get all the rules that have a criterion with `field: 'debit'`. Call them Debit Criterion.

Currently, the `value` property for Debit Criterion is a number as string ('-40').

I need to go through the criterion for each rule and change the `value` properties value to a number.

- map the rules
  -> rule
  - map the criteria
    - if criterion.field === 'debit' -> R.mergeRight(criterion, { value: Number()})
