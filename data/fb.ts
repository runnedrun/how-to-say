import {
  doc,
  DocumentReference,
  FirestoreDataConverter,
  setDoc,
  collection,
  Timestamp,
} from "@firebase/firestore"
import {
  CollectionModels,
  AllModels,
  CollectionsWithConverters,
} from "./firebaseHelpers/CollectionModels"

import { init } from "./initFb"

const refFunctions = {} as {
  [key in keyof CollectionModels]: (id?: string) => DocumentReference
}

const setterFunctions = {} as {
  [key in keyof AllModels]: (
    id: string,
    newData: Partial<AllModels[key]>
  ) => Promise<void>
}

type CreatorFunction<Key extends keyof AllModels> = (
  newData: Omit<AllModels[Key], "uid">
) => Promise<DocumentReference<AllModels[Key]>>

const creatorFunctions = {} as {
  [key in keyof CollectionModels]: CreatorFunction<key>
}

Object.keys(CollectionsWithConverters).forEach(
  (collectionNameString: string) => {
    const collectionName = collectionNameString as keyof CollectionModels
    const converter = CollectionsWithConverters[
      collectionName
    ] as FirestoreDataConverter<CollectionModels[typeof collectionName]>

    const refFunction = (docId?: string) => {
      const firestore = init()

      const newOrExistingDoc = docId
        ? doc(collection(firestore, collectionName), docId)
        : doc(collection(firestore, collectionName))

      return newOrExistingDoc.withConverter(converter)
    }

    const filterUndefinedValuesAndUid = (object: { [key: string]: any }) => {
      const keys = Object.keys(object) as (keyof typeof object)[]
      return keys
        .filter((key) => {
          const value = object[key]
          return typeof value !== "undefined" && key !== "uid"
        })
        .reduce((builder, key) => {
          builder[key] = object[key]
          return builder
        }, {} as typeof object)
    }

    refFunctions[collectionName] = refFunction

    setterFunctions[collectionName] = (
      docId: string,
      newData: Partial<CollectionModels[typeof collectionName]>
    ) => {
      const undefFiltered = filterUndefinedValuesAndUid(newData)
      const withUpdatedAt = {
        ...undefFiltered,
        updatedAt: Timestamp.now(),
      }

      const done = setDoc(refFunction(docId), withUpdatedAt, {
        merge: true,
      })
      return done
    }

    const creatorFunction = (
      initData: Omit<CollectionModels[typeof collectionName], "uid">
    ) => {
      const undefFiltered = filterUndefinedValuesAndUid(initData)
      const withArchivedFalse = {
        ...undefFiltered,
        archived: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
      const ref = refFunction()
      return setDoc(ref, withArchivedFalse, {
        merge: true,
      }).then((_) => ref)
    }

    creatorFunctions[collectionName] = creatorFunction as any
  }
)

export const fb = refFunctions
export const setters = setterFunctions
export const creators = creatorFunctions
