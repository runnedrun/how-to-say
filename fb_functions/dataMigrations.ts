import "./fixTsPaths"
import * as firebase from "firebase-admin/app"
const firestore = require("@google-cloud/firestore")
// import { addArchivedToLocationEmployees } from "./data_migration/addArchivedToLocationEmployees"
const arg = require("arg")

import { getFirestore } from "firebase-admin/firestore"
import { addCreatedAtAndUpdatedAtToAllCollections } from "./data_migration/addCreatedAtAndUpdatedAtToAllCollections"

firebase.initializeApp()

const getProjectId = async () => {
  const client = new firestore.v1.FirestoreAdminClient()
  const projectId = await client.getProjectId()

  return projectId
}

const testPrep = async () => {
  const projectId = await getProjectId()

  if (!projectId.includes("demo")) {
    console.log("cannot prep unless a demo project")
    return
  }

  const firestore = getFirestore()
  let writeBatch = firestore.batch()
  let writeCount = 0
  const collectionReference = firestore.collection("locationEmployee")
  for (let i = 0; i < 600; i++) {
    const doc = collectionReference.doc()
    writeBatch.create(doc, {
      test: true,
    })
    writeCount++
    if (writeCount % 400 === 0) {
      await writeBatch.commit()
      writeBatch = firestore.batch()
    }
  }

  await writeBatch.commit()

  console.log("completed prep", writeCount)
}

const run = async () => {
  const projectId = await getProjectId()

  console.log("running migration for projectId: ", projectId)

  const args = arg({
    "--dry": Boolean,
    "--probe": Boolean,
  })

  addCreatedAtAndUpdatedAtToAllCollections(args)
  // addArchivedToLocationEmployees(args)
}

// testPrep()
run()
