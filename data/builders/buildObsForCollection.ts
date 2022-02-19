import {
  collection,
  getFirestore,
  query as buildQuery,
  QueryConstraint,
} from "firebase/firestore"
import { buildConverterForType } from "./buildConverterForType"
import { collectionData } from "rxfire/firestore"
import { combineLatest, isObservable, mergeMap, of, switchMap, tap } from "rxjs"
import { ObsOrValue } from "../types/ObsOrValue"
import { CollectionModels } from "@/data/firebaseHelpers/CollectionModels"

export const buildObsForCollection = <
  CollectionName extends keyof CollectionModels,
  M extends CollectionModels[CollectionName]
>(
  collectionName: CollectionName,
  queries: ObsOrValue<QueryConstraint>[]
) => {
  const db = getFirestore()
  const collectionRef = collection(db, collectionName)
  const convertedCollection = collectionRef.withConverter(
    buildConverterForType<M>()
  )
  const constraintObs = queries.map((constraint) => {
    return isObservable(constraint) ? constraint : of(constraint)
  })

  const combinedConstraints = constraintObs.length
    ? combineLatest(constraintObs)
    : of([] as QueryConstraint[])

  const collectionObs = combinedConstraints.pipe(
    mergeMap((constraints) => {
      const nonNullConstraints = constraints.filter(Boolean)
      const query = buildQuery(convertedCollection, ...nonNullConstraints)
      return collectionData(query, { idField: "uid" })
    })
  )

  return collectionObs
}
