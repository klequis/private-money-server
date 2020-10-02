// run with: nodemon --exec npx babel-node create-test-user.js todo-test

import mongodb, { ObjectID } from 'mongodb'
import chalk from 'chalk'

const mongoUrl = 'mongodb://localhost:27017/todo-test'
let dbName = ''

const MongoClient = mongodb.MongoClient

let client

const connectDB = async () => {
  if (!client) {
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true
    })
  }

  return { db: client.db(dbName) }
}

const close = async () => {
  if (client) {
    client.close()
  }
  client = undefined
}

const logFailure = (message, value = '') => {
  console.log(chalk.bgRed(` ${message} `), value)
}

const logSuccess = (message, value = '') => {
  console.log(chalk.bgGreen(` ${message} `), value)
}

const execCmd = async (params = {}, options = {}) => {
  const opts = {
    useAdmin: options.useAdmin || false
  }
  console.log('**options**', options);
  
  try {
    const { db } = await connectDB()
    
    const cmd = {}
    Object.keys(params).forEach(k => {
      cmd[k] = params[k]
    })
    console.log('execCmd: ', cmd)
    let ret
    if (opts.useAdmin) {
      console.log('** using admin **');
      
      const admin = db.admin()
      ret = await admin.command(params)
    } else {
      ret = await db.command(params)
    }
    logSuccess(`result: `, ret)
    return ret
  } catch (e) {
    logFailure(`execCmd: `, e)
  } finally {
    await close()
  }
}

const createRole = async (roleName, dbName) => {
  await execCmd({
    // createRole: `${roleName}@${dbName}`,
    createRole: roleName,
    privileges: [
      {
        resource: { db: dbName, collection: '' },
        actions: ['find', 'insert', 'remove', 'update']
      }
    ],
    roles: [],
    writeConcern: { w: 'majority', wtimeout: 5000 }
  })
}

const createTestUser = async (userName) => {
  await execCmd({
    // createUser: `${userName}@${dbName}`,
    createUser: userName,
    pwd: 'password@1',
    // roles: [{ role: 'todoTest', db: dbName }],
    roles: [ 'todoTest' ],
    writeConcern: { w: 'majority', wtimeout: 5000 }
  })
}

const dropRole = async roleName => {
  await execCmd({
    dropRole: roleName
  })
}

const dropUser = async userName => {
  await execCmd({
    dropUser: userName
  })
}

/*
    List roles
    doc: https://docs.mongodb.com/manual/reference/command/usersInfo/#dbcmd.usersInfo
*/
const listUserDefinedRoles = async () => {
  return await execCmd({
    rolesInfo: 1,
    showBuiltinRoles: 0,
    showPrivileges: true
  })
}

const listAllRoles = async () => {
  return await execCmd({
    rolesInfo: 1,
    showPrivileges: true,
    // forAllDbs: true
  }, { useAdmin: true })
}


const listUsers = async () => {
  const ret = await execCmd({ usersInfo: 1 })
  const users = ret.users
  console.log('-----------------------------')
  console.group('List of users')
  console.log(users)
  console.groupEnd()
  return users
}

const dropAllUsers = async userName => {
  const users = await listUsers()
  console.log('******************************')
  console.log('users ', users)
  users.forEach(async u => {
    await dropUser(u.user)
    // console.log(u.user)
  })
  console.log('******************************')
  
}

const dropAllUserDefinedRoles = async () => {
  const ret = await listUserDefinedRoles()
  ret.roles.forEach(async r => {
    await dropRole(r.role)
  })
}

const printDbName = async () => {
  const { db } = await connectDB()
  const ret = await db.stats()
  logSuccess('dbName = ', ret.db)
}

// https://docs.mongodb.com/manual/reference/command/listDatabases/#dbcmd.listDatabases
const listDatabases = async () => {
  execCmd({
    listDatabases: 1,
    nameOnly: true
  })
}

// https://docs.mongodb.com/manual/reference/command/listCollections/#dbcmd.listCollections
const listCollections = async () => {
  const ret = await execCmd({
    listCollections: 1,
    authorizedCollections: true,
    nameOnly: true
  })
  const cols = ret.cursor.firstBatch
  console.group('Collections')
  cols.forEach(c => console.log(`- ${c.name}`))
  console.groupEnd()
  return cols
}

const main = async () => {
  console.log()
  console.log()
  console.log()

  const args = process.argv.slice(2)
  dbName = args[0]

  if (!dbName) {
    logFailure('parameter dbName is required')
    return
  }
  await dropAllUsers()
  await listUsers()
}

main()
