import { isUndefined } from "lodash"
import { paginatedMapper } from "./helpers/paginatedMapper"
import { CollectionsWithConverters } from "@/data/firebaseHelpers/CollectionModels"
import { objKeys } from "@/helpers/objKeys"
import { Timestamp } from "firebase-admin/firestore"

const allCollections = []

export const addCreatedAtAndUpdatedAtToAllCollections = async (
  options: Record<string, any>
) => {
  await Promise.all(
    objKeys(CollectionsWithConverters).map(async (collectionName) => {
      await paginatedMapper(
        collectionName,
        (snap) => {
          const doc = snap.data()
          let changes = {}
          if (isUndefined(doc.createdAt)) {
            changes["createdAt"] = Timestamp.now()
          }
          if (isUndefined(doc.updatedAt)) {
            changes["updatedAt"] = Timestamp.now()
          }

          return changes
        },
        options
      )
    })
  )

  console.log("addCreatedAtAndUpdatedAtToAllCollections complete")
}
