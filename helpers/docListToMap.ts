import { Model } from "@/data/types/Model"

export const docListToMap = (list: Model<any>[]) => {
  const map = {}
  list.forEach((doc) => {
    map[doc.uid] = doc
  })
  return map
}
