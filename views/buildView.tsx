import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { capitalizeFirstLetter } from "@/helpers/capitalizeFirstLetter"
import { objKeys, objStringKeys } from "@/helpers/objKeys"
import React, { useEffect, useState } from "react"
import { BehaviorSubject, combineLatest } from "rxjs"
import { SSRPropsContext } from "next-firebase-auth"
import _, { merge } from "lodash"
import { Redirect } from "next"
import { isDemoMode } from "@/helpers/isDemoMode"
import { useRouter } from "next/router"
import { logEvent, setCurrentScreen } from "@/analytics/logEvent"

import { redirectWithDestination } from "@/helpers/redirectWithDestination"

import {
  jsonifyTimestamps,
  hydrateTimestamps,
} from "@/data/fetchHelpers/jsonifyTimestamps"

type StateDescriptor = Record<
  string,
  {
    initialValue: any
    description?: string
  }
>

type InitialValuesFromStateDescriptor<
  StateDescriptorType extends StateDescriptor
> = {
  [key in keyof StateDescriptorType]: StateDescriptorType[key]["initialValue"]
}

type SettersFromStateDescriptor<StateDescriptorType extends StateDescriptor> = {
  [key in keyof StateDescriptorType & string as `set${Capitalize<key>}`]: (
    value: StateDescriptorType[key]["initialValue"]
  ) => void
}

type ExampleProps = Record<string, any>

type DataObservables<
  StateDescriptorType extends StateDescriptor,
  PropsType extends ExampleProps
> = {
  [key: string]: {
    obs: ParamaterizedObservable<
      Partial<Record<keyof StateDescriptorType | keyof PropsType, any>>,
      any,
      any
    >
  }
}

type ParamObsFromDataObsMap<
  DataObservablesType extends DataObservables<any, any>
> = {
  [key in keyof DataObservablesType]: DataObservablesType[key]["obs"]
}

type ParamObsModelTypeFromParamObsMap<
  ParamObsMap extends Record<string, ParamaterizedObservable<any, any, any>>
> = {
  [key in keyof ParamObsMap]: ParamObsMap[key] extends ParamaterizedObservable<
    any,
    infer ModelType,
    any
  >
    ? ModelType
    : never
}

type ModelTypeFromDataObservables<
  DataObservablesType extends DataObservables<any, any>
> = ParamObsModelTypeFromParamObsMap<
  ParamObsFromDataObsMap<DataObservablesType>
>

type Component<ParentState, ParentData, ParentProps> = {
  exampleComponent?: React.ReactNode
  exampleProps?: Record<string, any>
  state?: StateDescriptor
}

type Components<ParentState, ParentData, ParentProps> = {
  [key: string]: Component<ParentState, ParentData, ParentProps>
}

type InteractionTypes = "click" | "see" | "type"
type TimesRestriction = "once" | "atLeastOnce"

type Journey<
  ComponentsType extends Components<any, any, any>,
  StateDescriptorType extends StateDescriptor,
  ExamplePropsType extends ExampleProps,
  DataObservablesType extends DataObservables<
    StateDescriptorType,
    ExamplePropsType
  >
> = Partial<
  {
    [key in keyof ComponentsType]: {
      interaction: InteractionTypes
      times?: TimesRestriction
      genParams?: {
        e: object
        state: InitialValuesFromStateDescriptor<StateDescriptorType>
        data: ModelTypeFromDataObservables<DataObservablesType>
        props: ComponentsType[key]["exampleProps"]
      }
    }
  }
>

type StateArgs<
  StateDescriptorType extends StateDescriptor
> = InitialValuesFromStateDescriptor<StateDescriptorType> &
  SettersFromStateDescriptor<StateDescriptorType>

type ViewProperties<
  StateDescriptorType extends StateDescriptor,
  ExamplePropsType extends ExampleProps,
  DataObservablesType extends DataObservables<
    StateDescriptorType,
    ExamplePropsType
  >,
  ComponentType extends Component<
    StateDescriptorType,
    ExamplePropsType,
    DataObservablesType
  >
> = {
  state: StateArgs<StateDescriptorType> & StateArgs<ComponentType["state"]>
  props: {
    [key in keyof ExamplePropsType]: ExamplePropsType[key]
  } &
    ComponentType["exampleProps"]
  data: {
    [key in keyof DataObservablesType]: ModelTypeFromDataObservables<DataObservablesType>[key]
  }
  context: RequestContext
}

type TransformProperties<
  StateDescriptorType extends StateDescriptor,
  ExamplePropsType extends ExampleProps,
  DataObservablesType extends DataObservables<
    StateDescriptorType,
    ExamplePropsType
  >,
  ComponentType extends Component<
    StateDescriptorType,
    ExamplePropsType,
    DataObservablesType
  >
> = {
  state: InitialValuesFromStateDescriptor<StateDescriptorType> &
    InitialValuesFromStateDescriptor<ComponentType["state"]>
  props: {
    [key in keyof ExamplePropsType]: ExamplePropsType[key]
  } &
    ComponentType["exampleProps"]
  data: {
    [key in keyof DataObservablesType]: ModelTypeFromDataObservables<DataObservablesType>[key]
  }
  context: RequestContext
}

export type ComponentBuilderForComponent<
  StateDescriptorType extends StateDescriptor,
  ExamplePropsType extends ExampleProps,
  DataObservablesType extends DataObservables<
    StateDescriptorType,
    ExamplePropsType
  >,
  ComponentType extends Component<
    StateDescriptorType,
    ExamplePropsType,
    DataObservablesType
  >
> = React.FC<
  ViewProperties<
    StateDescriptorType,
    ExamplePropsType,
    DataObservablesType,
    ComponentType
  >
>

export type ComponentBuilder<
  StateDescriptorType extends StateDescriptor,
  ExamplePropsType extends ExampleProps,
  DataObservablesType extends DataObservables<
    StateDescriptorType,
    ExamplePropsType
  >,
  ComponentDescriptor extends Component<any, any, any>
> = ((
  component: ComponentBuilderForComponent<
    StateDescriptorType,
    ExamplePropsType,
    DataObservablesType,
    ComponentDescriptor
  >
) => React.FC<ComponentDescriptor["exampleProps"]>) & {
  config: ComponentBuilders<any, any, any, any>
  componentDescriptor: ComponentDescriptor
}

export type ComponentBuilders<
  StateDescriptorType extends StateDescriptor,
  ExamplePropsType extends ExampleProps,
  DataObservablesType extends DataObservables<
    StateDescriptorType,
    ExamplePropsType
  >,
  ComponentsType extends Components<any, any, any>
> = {
  [key in keyof ComponentsType]: ComponentBuilder<
    StateDescriptorType,
    ExamplePropsType,
    DataObservablesType,
    ComponentsType[key]
  >
} & {
  buildTransform: <FnReturnType>(
    tranformFn: (
      args: TransformProperties<
        StateDescriptorType,
        ExamplePropsType,
        DataObservablesType,
        {}
      >
    ) => FnReturnType
  ) => () => FnReturnType
  Parent: ParentHoc<StateDescriptorType, ExamplePropsType, DataObservablesType>
  prefetchData: (
    ctx: SSRPropsContext
  ) => Promise<
    | {
        props: {
          globalProps: ExamplePropsType
          initialState?: Partial<
            InitialValuesFromStateDescriptor<StateDescriptorType>
          >
          prefetch: ModelTypeFromDataObservables<DataObservablesType>
          context: RequestContext
        }
      }
    | {
        redirect: Redirect
      }
  >
}

type RequestContext = {
  host: string
}

type ParentHoc<
  StateDescriptorType extends StateDescriptor,
  ExamplePropsType extends ExampleProps,
  DataObservablesType extends DataObservables<
    StateDescriptorType,
    ExamplePropsType
  >
> = (
  component: (
    args: ViewProperties<
      StateDescriptorType,
      ExamplePropsType,
      DataObservablesType,
      {}
    > & { updateGlobalProps: (props: Partial<ExamplePropsType>) => void }
  ) => React.ReactElement
) => (props: {
  globalProps: ExamplePropsType
  prefetch: ModelTypeFromDataObservables<DataObservablesType>
  initialState?: Partial<InitialValuesFromStateDescriptor<StateDescriptorType>>
  context: RequestContext
}) => React.ReactElement

type ConfigType = {
  adminOnly?: boolean
  name: string
}

type BuildInitialValues<
  ExamplePropsType extends ExampleProps,
  StateDescriptorType extends StateDescriptor
> = (
  query: Record<string, string | string[]>
) => {
  globalProps: ExamplePropsType
  initialState?: Partial<InitialValuesFromStateDescriptor<StateDescriptorType>>
}

const getInitialComponentStateFromReplay = (
  componentName: string,
  props: object
) => {
  const query = useRouter().query
  const replayStateAndProps = query.sessionReplayData as string

  return {}
}

const buildInitialValuesWithReplay = (
  buildInitialValues: BuildInitialValues<any, any>,
  query: Record<string, string | string[]>
) => {
  let { globalProps, initialState } = buildInitialValues(query)
  let initialComponentState = {}
  const replayStateAndProps = query.sessionReplayData as string
  if (replayStateAndProps) {
    const {
      global: { state, props },
      components: { state: componentState },
    } = hydrateTimestamps(JSON.parse(replayStateAndProps))
    globalProps = { ...globalProps, ...props }
    initialState = { ...initialState, ...state }

    componentState
    initialComponentState = {}
  }
  return { globalProps, initialState, initialComponentState }
}

export const buildView: (
  config: ConfigType
) => <StateDescriptorType extends StateDescriptor>(
  stateDescriptor: StateDescriptorType
) => <ExamplePropsType extends ExampleProps>(
  exampleProps: ExamplePropsType
) => <
  DataObservablesType extends DataObservables<
    StateDescriptorType,
    ExamplePropsType
  >
>(
  data: DataObservablesType
) => <
  ComponentsType extends Components<
    StateDescriptorType,
    DataObservablesType,
    ExamplePropsType
  >
>(
  buildInitialValues?: BuildInitialValues<ExamplePropsType, StateDescriptorType>
) => (
  components: ComponentsType
) => (
  journey: Journey<
    ComponentsType,
    StateDescriptorType,
    ExamplePropsType,
    DataObservablesType
  >
) => ComponentBuilders<
  StateDescriptorType,
  ExamplePropsType,
  DataObservablesType,
  ComponentsType
> = (config) => (stateDescriptor) => (exampleProps) => (dataDescriptor) => (
  buildInitialValues = () => ({ globalProps: {} as typeof exampleProps })
) => (componentsDescriptor) => (journey) => {
  const componentBuilders = {} as ComponentBuilders<
    typeof stateDescriptor,
    typeof exampleProps,
    typeof dataDescriptor,
    typeof componentsDescriptor
  >

  const propsSubject = new BehaviorSubject<typeof exampleProps>(
    {} as typeof exampleProps
  )

  const updatePropsSubject = (update: typeof exampleProps) => {
    const current = propsSubject.getValue()
    propsSubject.next({ ...current, ...update })
  }

  const initialValuesFromStateDescriptor = {} as InitialValuesFromStateDescriptor<
    typeof stateDescriptor
  >

  objKeys(stateDescriptor).forEach((key) => {
    const descriptor = stateDescriptor[key]
    initialValuesFromStateDescriptor[key] = descriptor.initialValue
  })

  const stateSubject = new BehaviorSubject(initialValuesFromStateDescriptor)

  type DataResultsType = ModelTypeFromDataObservables<typeof dataDescriptor>
  const dataSubject = new BehaviorSubject({} as DataResultsType)

  const dataObservables = {} as ParamObsFromDataObsMap<typeof dataDescriptor>
  objKeys(dataDescriptor).forEach((key) => {
    const descriptor = dataDescriptor[key]
    dataObservables[key] = descriptor.obs
  })

  const attachStateAndPropsToObservables = (
    state: InitialValuesFromStateDescriptor<typeof stateDescriptor>,
    props: typeof exampleProps
  ) => {
    Object.values(dataObservables).forEach((obs) => {
      const stateToPassThrough = _.pick(state, objKeys(obs.originalArgs))
      const propsToPassThrough = _.pick(props, objKeys(obs.originalArgs))
      const allParamsToAttach = {
        ...stateToPassThrough,
        ...propsToPassThrough,
      }

      obs?.attach && obs?.attach(allParamsToAttach)
    })
  }

  combineLatest([stateSubject, propsSubject]).subscribe(([state, props]) => {
    attachStateAndPropsToObservables(state, props)
  })

  objKeys(dataDescriptor).map((dataLabel) => {
    const obs = dataDescriptor[dataLabel].obs
    obs?.subscribe((value) => {
      const update = {} as DataResultsType
      update[dataLabel] = value
      dataSubject.next({ ...dataSubject.getValue(), ...update })
    })
  })

  const manageGlobalProps = () => {
    const [globalPropsState, setGlobalPropsState] = useState(
      {} as typeof exampleProps
    )

    useEffect(() => {
      const sub = propsSubject.subscribe((value) => {
        setGlobalPropsState(value)
      })
      return sub.unsubscribe.bind(sub)
    }, [])

    return globalPropsState
  }

  const manageDataAndState = (localStateDescriptor: StateDescriptor) => {
    const globalStateDescriptors = stateDescriptor
    const globalSettersToPassThrough = {} as SettersFromStateDescriptor<
      typeof globalStateDescriptors
    >
    const localSettersToPassThrough = {} as SettersFromStateDescriptor<
      typeof localStateDescriptor
    >
    const localStateDescriptorStateInitialValue = {} as InitialValuesFromStateDescriptor<
      typeof localStateDescriptor
    >

    objKeys(localStateDescriptor || {}).forEach((key) => {
      const descriptor = localStateDescriptor[key]
      localStateDescriptorStateInitialValue[key] = descriptor.initialValue
    })

    const [localStateDescriptorState, setLocalStateDescriptorState] = useState(
      localStateDescriptorStateInitialValue
    )

    objStringKeys(localStateDescriptor || {}).forEach((key) => {
      type ValueType = typeof localStateDescriptor[typeof key]["initialValue"]
      type SetKeyType = `set${Capitalize<typeof key>}`
      type SetterType = SettersFromStateDescriptor<
        typeof localStateDescriptor
      >[SetKeyType]
      localSettersToPassThrough[
        `set${capitalizeFirstLetter(key)}` as SetKeyType
      ] = (((newValue: ValueType) => {
        setLocalStateDescriptorState((oldState) => ({
          ...oldState,
          [key]: newValue,
        }))
      }) as unknown) as SetterType
    })

    objStringKeys(globalStateDescriptors).forEach((key) => {
      type ValueType = typeof globalStateDescriptors[typeof key]["initialValue"]
      type SetKeyType = `set${Capitalize<typeof key>}`
      type SetterType = SettersFromStateDescriptor<
        typeof globalStateDescriptors
      >[SetKeyType]
      globalSettersToPassThrough[
        `set${capitalizeFirstLetter(key)}` as SetKeyType
      ] = (((newValue: ValueType) => {
        const currentValue = stateSubject.getValue()
        const newState = { ...currentValue, [key]: newValue }
        stateSubject.next(newState)
      }) as unknown) as SetterType
    })

    const [localState, localStateSetter] = useState(stateSubject.getValue())

    useEffect(() => {
      const sub = stateSubject.subscribe((state) => {
        localStateSetter(state)
      })
      sub.unsubscribe.bind(sub)
    }, [])

    const [data, setData] = useState(dataSubject.getValue())

    useEffect(() => {
      const sub = dataSubject.subscribe((value) => {
        setData(value)
      })
      return sub.unsubscribe.bind(sub)
    }, [])

    return {
      state: {
        ...localState,
        ...globalSettersToPassThrough,
        ...localStateDescriptorState,
        ...localSettersToPassThrough,
      },
      data,
    }
  }

  let reqContext = null as RequestContext

  let firstRender = true
  let analyticsContext = {} as any
  componentBuilders.Parent = (Component) => {
    return ({ prefetch, context }) => {
      const router = useRouter()

      useEffect(() => {
        const logScreen = () => {
          const { globalProps, initialState } = buildInitialValues(router.query)
          analyticsContext = {
            initialState,
            props: globalProps,
            path: router.pathname,
          }

          setCurrentScreen(config.name)

          logEvent("screen_view", analyticsContext)
        }

        router.events.on("routeChangeComplete", logScreen)
        logScreen()

        return () => {
          router.events.off("routeChangeComplete", logScreen)
        }
      }, [])

      const setPropsAndState = () => {
        const { globalProps, initialState } = buildInitialValuesWithReplay(
          buildInitialValues,
          router.query
        )

        propsSubject.next(globalProps)

        if (initialState) {
          stateSubject.next({ ...stateSubject.getValue(), ...initialState })
        }
      }

      useEffect(setPropsAndState, [router.query])

      if (firstRender) {
        const withConvertedDates = hydrateTimestamps(prefetch)
        dataSubject.next(withConvertedDates as DataResultsType)

        setPropsAndState()

        reqContext = context

        firstRender = false
      }

      const props = manageGlobalProps()
      const { state, data } = manageDataAndState({})

      return (
        <Component
          props={props}
          state={state}
          data={data}
          updateGlobalProps={updatePropsSubject}
          context={context}
        ></Component>
      )
    }
  }

  componentBuilders.buildTransform = (transformFn) => {
    return () => {
      const props = propsSubject.getValue()
      const state = stateSubject.getValue()
      const data = dataSubject.getValue()
      return transformFn({ props, state, data, context: reqContext })
    }
  }

  componentBuilders.prefetchData = async (context) => {
    const user = context.AuthUser
    let { globalProps, initialState } = buildInitialValuesWithReplay(
      buildInitialValues,
      context.query
    )

    const stateOrEmptyObj = initialState || {}
    const initialStateToAttach = merge(stateSubject.getValue(), stateOrEmptyObj)

    const prefetchResults = {} as DataResultsType
    const prefetchResultsWithTimestamps = {} as DataResultsType
    await Promise.all(
      objKeys(dataObservables).map(async (key) => {
        const obs = dataObservables[key]

        const argsToPass = _.pick(
          {
            ...initialStateToAttach,
            ...globalProps,
          },
          objKeys(obs.originalArgs)
        )

        console.log("before", argsToPass)
        const value = await obs.getWithArgs(argsToPass)
        console.log("after", obs.name)

        const timestampsStringified = jsonifyTimestamps(value)
        prefetchResultsWithTimestamps[key] = value

        prefetchResults[key] =
          typeof value === "undefined"
            ? null
            : (timestampsStringified as typeof value)
      })
    )

    if (
      config.adminOnly &&
      !user?.email?.includes("@hylitepeople.com") &&
      !isDemoMode()
    ) {
      const redirectPath = redirectWithDestination("/sign_in")({ ctx: context })
      return {
        redirect: {
          destination: redirectPath,
          permanent: false,
        },
      }
    }

    reqContext = {
      host: context.req.headers.host,
    }

    dataSubject.next(prefetchResultsWithTimestamps)

    return {
      props: {
        globalProps,
        initialState: initialStateToAttach,
        prefetch: prefetchResults,
        context: reqContext,
      },
    }
  }

  objKeys(componentsDescriptor).forEach((componentName) => {
    type ComponentDescriptorType = typeof componentsDescriptor[typeof componentName]
    const descriptor = componentsDescriptor[componentName]
    const hoc = (
      Component: ComponentBuilderForComponent<
        typeof stateDescriptor,
        typeof exampleProps,
        typeof dataDescriptor,
        ComponentDescriptorType
      >
    ) => (localProps: ComponentDescriptorType["exampleProps"]) => {
      const props = manageGlobalProps()
      const stateDescriptor = descriptor.state || {}
      const initialStateForComponent = getInitialComponentStateFromReplay(
        componentName as string,
        localProps
      )
      const stateDescriptorWithInitialValues = {}
      objKeys(stateDescriptor || {}).forEach((stateName) => {
        const initialValueObj = stateDescriptor[stateName]
        if (initialStateForComponent[stateName]) {
          stateDescriptorWithInitialValues[stateName] = {
            ...initialValueObj,
            initialValue: initialStateForComponent[stateName],
          }
        } else if (initialValueObj) {
          stateDescriptorWithInitialValues[stateName] = initialValueObj
        }
      })
      const { state, data } = manageDataAndState(
        stateDescriptorWithInitialValues
      )

      useEffect(() => {
        logEvent(`rendered_${componentName}`, {
          ...analyticsContext,
          ...localProps,
        })
      }, [])

      return (
        <span
          style={{ display: "contents" }}
          onClick={() => {
            logEvent(`clicked_${componentName}`, {
              ...analyticsContext,
              ...localProps,
            })
          }}
        >
          <Component
            state={state}
            props={{ ...localProps, ...props }}
            data={data}
            context={reqContext}
          ></Component>
        </span>
      )
    }

    hoc.componentDescriptor = descriptor
    hoc.config = componentBuilders

    componentBuilders[
      componentName
    ] = hoc as typeof componentBuilders[typeof componentName]
  })

  return componentBuilders
}
