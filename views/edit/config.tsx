import { parameterizedDoc } from "@/data/firebaseHelpers/parameterizedDoc"
import { parameterizedWhere } from "@/data/firebaseHelpers/parameterizedWhere"
import { buildView } from "../buildView"

export const config = buildView({ name: "Edit name" })({
  savingText: {
    initialValue: "",
  },
  savingTextTimeout: {
    initialValue: null as NodeJS.Timeout,
  },
  savingIdTimeout: {
    initialValue: null as NodeJS.Timeout,
  },
})({
  nameKey: undefined as string,
})({
  nameForEditKey: {
    obs: parameterizedDoc("name"),
  },
})((query) => {
  const nameKey = (query.editKey || null) as string
  return { globalProps: { nameKey } }
})({
  NameDisplay: {},
  EditableNameDisplay: {},
})({})
