import {
  DocumentData,
  SnapshotOptions,
  WithFieldValue,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase/firestore"
import { Model } from "../types/Model"

export const buildConverterForType = <
  Type extends Model<any>
>(): FirestoreDataConverter<Type> => {
  return {
    toFirestore: (data: WithFieldValue<Type>): DocumentData =>
      Object.assign({}, data),
    fromFirestore: (
      snap: QueryDocumentSnapshot<DocumentData>,
      options?: SnapshotOptions | undefined
    ) => {
      const data = snap.data() as Type
      return data as Type
    },
  }
}
