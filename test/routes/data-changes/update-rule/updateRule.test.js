import { expect } from 'chai'
import sendRequest from 'test/sendRequest'
import { redf, green, yellow } from 'logger'

const newRule = {
  _id: '5e4b11ea7834d2aa640765e5',
  acctId: 'saphire.chase.credit-card.8567',
  criteria: [
    {
      _id: '5e57d48edfb85a470c44e5b8',
      field: 'description',
      operation: 'beginsWith',
      value: '24 Hour Fitness'
    }
  ],
  actions: [
    {
      actionType: 'replaceAll',
      field: 'description',
      replaceWithValue: '24 Hour Fitness',
      _id: '5e57d48edfb85a470c44e5b9'
    },
    {
      actionType: 'categorize',
      category1: 'gym',
      _id: '5e57d48edfb85a470c44e5ba'
    }
  ]
}

describe('test update-rule', function() {
  const _id = '5e4b11ea7834d2aa640765e5'
  const uri = `/api/rules/ruleid/${_id}`
  it('get the rule', async function() {
    const r = await sendRequest({
      method: 'GET',
      uri: uri,
      status: 200
    })
    const { body } = r
    const { criteria } = body[0]
    // yellow('criteria[0].value before', criteria[0].value)
  })
  it('is rule changed', async function() {
    const r = await sendRequest({
      method: 'PATCH',
      uri: uri,
      status: 200,
      body: newRule
    })
    const { body } = r
    const { criteria } = body[0]
    // yellow('criteria[0].value after', criteria[0].value)
    // expect(criteria[0].value).to.equal('24 Hour Fitness 88')
  })
})
