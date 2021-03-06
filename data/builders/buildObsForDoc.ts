import { collection, doc } from "firebase/firestore"
import { buildConverterForType } from "./buildConverterForType"
import { docData } from "rxfire/firestore"
import { Model } from "../types/Model"
import { ObsOrValue } from "../types/ObsOrValue"
import { isObservable, of, BehaviorSubject, switchMap, tap } from "rxjs"
import { CollectionModels } from "@/data/firebaseHelpers/CollectionModels"
import { init } from "../initFb"

type PossibleString = null | string | undefined

export const buildObsForDoc = <
  CollectionName extends keyof CollectionModels,
  M extends CollectionModels[CollectionName]
>(
  collectionName: CollectionName,
  id: ObsOrValue<PossibleString>
) => {
  const idObs = isObservable(id) ? id : of(id)
  return idObs.pipe(
    switchMap((id) => {
      const db = init()

      if (id) {
        const stringId = String(id)
        const docRef = doc(collection(db, collectionName), stringId)
        const convertedDoc = docRef.withConverter(buildConverterForType<M>())
        return docData(convertedDoc, { idField: "uid" })
      } else {
        const emptyObs = new BehaviorSubject<M>(null as M)
        return emptyObs
      }
    })
  )
}
