import { parameterizedWhere } from "@/data/firebaseHelpers/parameterizedWhere"
import { buildView } from "../buildView"

export const config = buildView({ name: "Name" })({})({
  nameId: undefined as string,
})({
  namesForNameId: {
    obs: parameterizedWhere("name", "nameId"),
  },
})((query) => {
  const nameId = query.nameId as string
  return { globalProps: { nameId } }
})({
  NameDisplay: {},
  // EditableNameDisplay: {},
})({})
