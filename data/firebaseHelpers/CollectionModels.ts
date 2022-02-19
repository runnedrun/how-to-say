import { buildConverterForType } from "../builders/buildConverterForType"
import { FirestoreDataConverter } from "@firebase/firestore"
import { Name } from "../types/Name"

export const CollectionsWithConverters: {
  [key in keyof CollectionModels]: FirestoreDataConverter<CollectionModels[key]>
} = {
  name: buildConverterForType<Name>(),
}

export type AllModels = {
  name: Name
}

export type CollectionModels = AllModels
