import { Timestamp } from "firebase/firestore"
import { ValueTypes } from "./ValueTypes"

export type ModelBaseFields = keyof Model<{}>
export const BaseFields: ModelBaseFields[] = [
  "uid",
  "archived",
  "archivedOn",
  "createdAt",
  "updatedAt",
]

export type Model<Type extends { [key: string]: ValueTypes }> = Type & {
  uid: string
  archived?: boolean
  archivedOn?: Timestamp
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
