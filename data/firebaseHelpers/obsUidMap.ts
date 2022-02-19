import {
  ModelFromArrayObservable,
  ModelFromArrayObservableOrParamObservable,
} from "@/helpers/observableTypeHelpers"
import { ModelFromArrayParamObs } from "@/helpers/paramObsTypeHelpers"
import { map, Observable } from "rxjs"
import { ValuesType } from "utility-types"
import { ArgsMap } from "../builders/ArgsMap"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import { Model } from "../types/Model"
import { AllModels } from "./CollectionModels"

export const obsUidMap = <
  InputType extends ParamaterizedObservable<any, any, any> | Observable<any>,
  PObsName extends string,
  PObsParams extends ArgsMap
>(
  arrayObs: InputType
): InputType extends ParamaterizedObservable<any, any, any>
  ? ParamaterizedObservable<
      PObsParams,
      Record<string, ModelFromArrayParamObs<InputType>>,
      PObsName
    >
  : Observable<Record<string, ModelFromArrayObservable<InputType>>> => {
  type ModelType = ModelFromArrayObservableOrParamObservable<InputType>
  const returnObs = arrayObs.pipe(
    map((items) => {
      const correctItems = items as ModelType[]
      const mapping = {} as {
        [key: string]: ModelType
      }
      correctItems.forEach((item: Model<any>) => {
        if (item) {
          mapping[item.uid] = item
        }
      })
      return mapping
    })
  )

  return returnObs as InputType extends ParamaterizedObservable<any, any, any>
    ? ParamaterizedObservable<
        PObsParams,
        Record<string, ModelFromArrayParamObs<InputType>>,
        PObsName
      >
    : Observable<Record<string, ModelFromArrayObservable<InputType>>>
}
