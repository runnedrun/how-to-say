import "../styles/globals.css"
import type { AppProps } from "next/app"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import initAuth from "@/data/auth/initAuth" // the module you created above
import { init } from "@/data/initFb"
import LogRocket from "logrocket"

init()
initAuth()

const isProd = process.env.NODE_ENV === "production"

// only initialize when in the browser
if (typeof window !== "undefined") {
  if (isProd) {
    console.log("initializing logging")
    LogRocket.init("rarkhs/how-to-say")
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
      />
      <Component {...pageProps} />
    </>
  )
}
export default MyApp
