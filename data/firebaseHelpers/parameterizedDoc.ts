import { buildParamaterizedObs } from "@/data/builders/buildParamterizedObs"
import { buildObsForDoc } from "@/data/builders/buildObsForDoc"
import { CollectionModels } from "@/data/firebaseHelpers/CollectionModels"
import { ParamaterizedObservable } from "../ParamaterizedObservable"

export const parameterizedDoc = <CollectionName extends keyof CollectionModels>(
  collectionName: CollectionName
): ParamaterizedObservable<
  { [key in `${CollectionName}Key`]: string | undefined },
  CollectionModels[CollectionName],
  CollectionName
> => {
  const paramKeyName = `${collectionName}Key` as const
  const startingArgs = {} as {
    [key in `${CollectionName}Key`]: string | undefined
  }
  startingArgs[paramKeyName] = undefined

  return buildParamaterizedObs(collectionName, startingArgs, (results) => {
    return buildObsForDoc(collectionName, results[paramKeyName])
  })
}
