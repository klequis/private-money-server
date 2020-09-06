export const types = {
  String: 'string',
  Number: 'number'
}

const Rule = {
  _id: String,
  acctId: String,
  critera: {
    description: String,
    type: String,
    cridit: Number,
    debit: Number
  },
  actionType: {
    actionType: String,
    field: String,
    findValue: String,
    numAdditionalChars: Number,
    replaceWithValue: String,
    category1: String,
    category2: String
  }
}

export default Rule
