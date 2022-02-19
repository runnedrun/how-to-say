import { isDemoMode } from "@/helpers/isDemoMode"
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions"

const buildCallableFunction = <ArgType>(funcName) => {
  const functions = getFunctions()
  isDemoMode() && connectFunctionsEmulator(functions, "localhost", 5001)
  const func = httpsCallable(functions, funcName)
  return (args: ArgType) => {
    return func(args)
  }
}
