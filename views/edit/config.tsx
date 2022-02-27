import { parameterizedDoc } from "@/data/firebaseHelpers/parameterizedDoc"
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
  suggestedName: undefined as string,
})({
  nameForEditKey: {
    obs: parameterizedDoc("name"),
  },
})((query) => {
  const nameKey = (query.editKey || null) as string
  const suggestedName = (query.suggestedNameId || null) as string
  return { globalProps: { nameKey, suggestedName } }
})({
  NameDisplay: {},
  EditableNameDisplay: {},
})({})
