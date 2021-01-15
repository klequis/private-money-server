1. dropDatabases
2. getAccounts
3. chkAcctFilesExist
4. for each account
   1. getAccount
   2. readRawData
   3. transformData
      1. mapToFields
   4. insertMany(wdTransactionsCollection)
5. createIndicies
6. runRules

# More generally

1. make the accounts obj
2. use promise.all to get the data
3. send through pipe to transform data

# There is this

```js
// Using Promise.map and async/await:
await Promise.map(fileNames, function (fileName) {
  // Promise.map awaits for returned promises as well.
  return fs.readFileAsync(fileName)
})
console.log('done')
```

```js
const accts1 = await _getAccounts()
const accts2 = await chkAcctFilesExist(accts1)
```

getAccounts
.then promise.all(p1, p2, p...) // array of \_readCsvFile promises

R.pipe(

)
