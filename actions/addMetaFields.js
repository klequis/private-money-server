

const addMetaFields = () => {
  db.collection.update(
    {},
    [ { $set: { active: { $eq: [ "$a", "Hello" ] } } } ],
    { multi: true }
  )
  /////////////////////
  db.members.update(
    { },
    [
       { $set: { status: "Modified", comments: [ "$misc1", "$misc2" ], lastUpdate: "$$NOW" } },
       { $unset: [ "misc1", "misc2" ] }
    ],
    { multi: true }
 )
}