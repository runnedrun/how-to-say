import { Timestamp } from "@firebase/firestore"

export type Optional<T> = T | undefined | null

export type ValueTypes = Optional<
  string | Timestamp | number | string[] | number[] | boolean | Object
>
