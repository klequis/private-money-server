import mongodb, { ObjectID } from 'mongodb'
import { hasProp } from 'lib'
import config from 'config'
import { mergeRight, isEmpty } from 'ramda'
// eslint-disable-next-line
import { green, yellow, redf } from 'logger'

const MongoClient = mongodb.MongoClient

let client

class DatabaseError extends Error {
  constructor(e, ...params) {
    super(...params)
    this.name = 'DatabaseError'
    this.message = e.message
  }
}

const idStringToObjectID = (obj) => {
  switch (typeof obj) {
    case 'string':
      return ObjectID(obj)
    case 'object':
      if (isEmpty(obj)) {
        return obj
      }
      if (!hasProp('_id', obj)) {
        return obj
      }
      const { _id: id } = obj
      const _id = typeof id === 'string' ? ObjectID(id) : id
      const final = mergeRight(obj, { _id })
      return final
    default:
      // TODO: should obj be returned?
      return obj
  }
}

const cfg = config()
const connectDB = async () => {
  try {
    if (!client) {
      client = await MongoClient.connect(cfg.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
    }
    return { db: client.db(cfg.dbName) }
  } catch (e) {
    throw new Error(e)
  }
}

export const close = async () => {
  if (client) {
    client.close()
  }
  client = undefined
}

export const findOneAndReplace = async (collection, filter, replacement) => {
  try {
    const { db } = await connectDB()
    const r = await db
      .collection(collection)
      .findOneAndReplace(filter, replacement)
    return r.ops
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {Array} data  an array of documents, without _id, to be inserted
 *
 * @returns {object}
 */
export const insertMany = async (collection, data) => {
  try {
    const { db } = await connectDB()
    const r = await db.collection(collection).insertMany(data)
    return r.ops
  } catch (e) {
    redf('dbFunctions.inserMany ERROR', e.message)
    redf('writeErrors', e.result.result.writeErrors)
    redf('op', e.result.result.writeErrors[0])
    console.log(e)
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @returns {boolean}
 *
 */
export const dropCollection = async (collection) => {
  try {
    const { db } = await connectDB()

    return await db.collection(collection).drop()
  } catch (e) {
    if (e.message === 'ns not found') {
      return true
    } else {
      throw new Error(e.message)
    }
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} data a documnet, without _id, to be inserted
 * @returns {object}
 *
 */
export const insertOne = async (collection, data) => {
  try {
    const { db } = await connectDB()
    const r = await db.collection(collection).insertOne(data)
    return r.ops
  } catch (e) {
    redf('dbFunctions ERROR', e.message)
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter filter criteria
 * @param {object} projection a valid projection
 * @param {object} collation
 * @returns {array}
 *
 */
export const find = async (
  collection,
  filter = {},
  projection = {},
  collation = {}
) => {
  try {
    const { db } = await connectDB()

    const ret = await db
      .collection(collection)
      .find(filter)
      .project(projection)
      .collation(collation)
      .toArray()
    return ret
  } catch (e) {
    throw new DatabaseError(e)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter filter criteria
 * @param {object} projection a valid projection
 * @returns {array}
 *
 */
export const findOne = async (collection, filter = {}, projection = {}) => {
  const f = idStringToObjectID(filter)
  try {
    const { db } = await connectDB()
    return await db.collection(collection).findOne(f, { projection })
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {string} id a valid _id as string
 * @param {object} projection a valid projection
 * @returns {object}
 */
export const findById = async (collection, id, projection = {}) => {
  try {
    const _id = idStringToObjectID(id)
    const { db } = await connectDB()
    return await db
      .collection(collection)
      .find({ _id })
      .project(projection)
      .toArray()
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter a valid mongodb filter
 * @returns {object}
 */
export const findOneAndDelete = async (collection, filter) => {
  try {
    const { db } = await connectDB()

    const r = await db.collection(collection).findOneAndDelete(filter)
    const { n, value } = r.lastErrorObject
    if (n === 0 && typeof value === 'undefined') {
      // throw an error
      throw new Error(
        `No document found for ${JSON.stringify(filter, null, 2)}`
      )
    }
    return [r.value]
  } catch (e) {
    throw new Error(e.message)
  }
}

export const deleteMany = async (collection, filter) => {
  try {
    const { db } = await connectDB()
    const r = await db.collection(collection).deleteMany(filter)
    return r.deletedCount
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 *
 * @param {string} collection the name of a collection
 * @param {object} filter a valid mongodb filter
 * @param {object} update document properties to be updated such as { title: 'new title', completed: true }
 * @param {boolean} returnOriginal if true, returns the original document instead of the updated one
 * @returns {object}
 *
 */
export const findOneAndUpdate = async (
  collection,
  filter = {},
  update,
  returnOriginal = false
) => {
  try {
    const _id = filter._id
    const objId = new ObjectID(_id)
    const f = { _id: objId }

    const { db } = await connectDB()

    const r = await db
      .collection(collection)
      .findOneAndUpdate(f, update, { returnOriginal: returnOriginal })
    return [r.value]
  } catch (e) {
    console.group('dbFunctions.findOneAndUpdate ERROR')
    console.log('collection', collection)
    console.log('filter', filter)
    console.log('update', update)
    console.groupEnd()
    throw new Error(e.message)
  }
}

export const updateMany = async (collection, filter = {}, update) => {
  try {
    const { db } = await connectDB()

    const r = await db.collection(collection).updateMany(filter, update)
    return { matchedCount: r.matchedCount, modifiedCount: r.modifiedCount }
  } catch (e) {
    console.group('dbFunctions.updateMany ERROR')
    console.log('collection', collection)
    console.log('filter', filter)
    console.log('update', update)
    console.groupEnd()
    throw new Error(e.message)
  }
}

export const createIndex = async (collection, field, options = {}) => {
  const { db } = await connectDB()
  const r = await db.collection(collection).createIndex(field, options)
}

export const createCollection = async (name, options) => {
  const { db } = await connectDB()
  const r = await db.createCollection(name, options)
}

export const executeAggregate = async (collection, query) => {
  const { db } = await connectDB()
  const ret = await db.collection(collection).aggregate(query).toArray()
  return ret
}
