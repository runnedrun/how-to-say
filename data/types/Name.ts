import { Model } from "./Model"

export type Name = Model<{
  nameId?: string
  displayName: string
  pronunciationDescription?: string
  pronunciationRecording?: string
}>
