import {
  Observable,
  BehaviorSubject,
  OperatorFunction,
  finalize,
  combineLatest,
  map,
  firstValueFrom,
  filter,
} from "rxjs"
import {
  ParamaterizedObservable,
  AttachFunctionType,
  KeyType,
} from "../ParamaterizedObservable"
import { ArgsMap, ValueType } from "@/data/builders/ArgsMap"

import { objKeys } from "@/helpers/objKeys"
import { filterUndefFromObj, objHasUndef } from "@/helpers/filterUndef"
import { isEqual, pick } from "lodash"

type BehaviorSubjectMap<ArgsType> = {
  [key in keyof ArgsType]: BehaviorSubject<ArgsType[key]>
}

type ObservableMap<ArgsType> = {
  [key in keyof ArgsType]: Observable<ArgsType[key]>
}

export const buildParamaterizedObs = <
  M,
  ArgsType extends ArgsMap,
  Name extends KeyType
>(
  name: Name,
  args: ArgsType,
  buildObs: (observableArgs: ObservableMap<ArgsType>) => Observable<M>
): ParamaterizedObservable<ArgsType, M, Name> => {
  const behaviorSubjectMap: BehaviorSubjectMap<ArgsType> = Object.keys(
    args
  ).reduce((subjMap, argName) => {
    const argValue = args[argName]
    const newBehaviorSubject = new BehaviorSubject<ValueType>(argValue)
    return { ...subjMap, [argName]: newBehaviorSubject }
  }, {} as BehaviorSubjectMap<ArgsType>)

  const getCurrentArgMap = () => {
    const startingArgs = {} as ArgsType
    objKeys(behaviorSubjectMap).forEach((key) => {
      startingArgs[key] = behaviorSubjectMap[
        key
      ].getValue() as ArgsType[typeof key]
    })
    return startingArgs
  }

  const attachObs = <
    D1 extends ArgsMap,
    R1 extends any,
    N1 extends keyof ArgsType,
    D2 extends ArgsMap,
    R2 extends any,
    N2 extends keyof ArgsType
  >(
    ...obsToAttach: [
      ParamaterizedObservable<D1, R1, N1>,
      ParamaterizedObservable<D2, R2, N2>?
    ]
  ): ParamaterizedObservable<Omit<ArgsType, N1 | N2> & D1 & D2, M, Name> => {
    const originalObsMapClone = {
      ...args,
    }

    obsToAttach.forEach((ob) => {
      if (!ob) return
      delete originalObsMapClone[ob.name]
    })

    const newObsMap = {
      ...originalObsMapClone,
      ...obsToAttach[0].originalArgs,
      ...obsToAttach[1]?.originalArgs,
    }

    const newPObs = buildParamaterizedObs(name, newObsMap, (args) => {
      const allArgs = { ...args } as typeof args
      const argSubscriptions = []
      obsToAttach.forEach((attachingOb) => {
        if (!attachingOb) return
        objKeys(args).forEach((argName) => {
          const stringArgName = argName as string
          const argObs = args[argName] as Observable<any>
          if (stringArgName in attachingOb.originalArgs) {
            const sub = argObs.subscribe((value) => {
              attachingOb.attach({ [argName]: value } as any)
            })
            argSubscriptions.push(sub)
          }
          delete allArgs[argName]
        })
        allArgs[attachingOb.name] = attachingOb as Observable<any>
      })

      return combineLatest([buildObs(allArgs)])
        .pipe(map((_) => _[0]))
        .pipe(
          finalize(() => {
            argSubscriptions.forEach((sub) => sub.unsubscribe())
          })
        )
    })

    return (newPObs as unknown) as ParamaterizedObservable<
      Omit<ArgsType, N1 | N2> & D1 & D2,
      M,
      Name
    >
  }

  const filterUndefSubjectMap = {} as ObservableMap<ArgsType>
  objKeys(behaviorSubjectMap).forEach((key) => {
    const subj = behaviorSubjectMap[key]
    filterUndefSubjectMap[key] = subj.pipe(
      filter((value) => {
        return typeof value !== "undefined"
      })
    )
  })

  const obs = buildObs(filterUndefSubjectMap) as ParamaterizedObservable<
    ArgsType,
    M,
    Name
  >

  const attach: AttachFunctionType<ArgsType, M, Name> = (newArgs) => {
    const noUndef = filterUndefFromObj(newArgs)
    Object.keys(noUndef).forEach((argName) => {
      const argValue = newArgs[argName]
      behaviorSubjectMap[argName]?.next(argValue)
    })
    return obs
  }

  obs.attach = attach

  const getWithArgs: (newArgs: Partial<ArgsType>) => Promise<M> = async (
    newArgs
  ) => {
    const clone = buildParamaterizedObs(name, args, buildObs)
    return await clone.attach(newArgs)
  }

  obs.getWithArgs = getWithArgs

  obs.attachObs = attachObs

  obs.withName = (newName) => {
    return buildParamaterizedObs(newName, args, buildObs)
  }

  obs.pipe = (
    ...operations: OperatorFunction<any, any>[]
  ): ParamaterizedObservable<ArgsType, any, Name> => {
    const newObs = buildParamaterizedObs(name, getCurrentArgMap(), (args) => {
      return buildObs(args)
        .pipe(...(operations as []))
        .pipe(
          finalize(() => {
            subs.forEach((_) => _.unsubscribe())
          })
        )
    }) as ParamaterizedObservable<ArgsType, M, Name>

    const subs = objKeys(behaviorSubjectMap).map((key) => {
      const subj = behaviorSubjectMap[key]
      return subj.subscribe((newValue) => {
        const updateObj = { [key]: newValue } as Partial<ArgsType>
        newObs.attach(updateObj)
      })
    })

    return newObs
  }

  Object.defineProperty(obs, "name", {
    configurable: false,
    writable: false,
    value: name,
  })

  obs.originalArgs = args

  obs.getCurrentParams = getCurrentArgMap
  obs.obs = () => {
    return obs as Observable<M>
  }

  obs.then = (handler) => {
    return firstValueFrom(obs).then(handler)
  }

  return obs
}
