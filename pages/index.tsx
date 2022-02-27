import React from "react"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { config } from "../views/index/config"
import Head from "next/head"
import logo from "../public/logo.jpeg"

import Image from "next/image"
import { creators } from "@/data/fb"
import { useRouter } from "next/router"

const IndexPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = config.Parent(({ state: { name, setName } }) => {
  const router = useRouter()
  const createNameAndRedirect = async () => {
    console.log("evnt", name)
    const nameId = name.replace(/\s/g, "-").replace(/\./, "").toLowerCase()
    const ref = await creators.name({
      displayName: name,
    })
    window.location.href = `/edit?suggestedNameId=${nameId}&editKey=${ref.id}`
  }

  const view = (
    <div className="min-h-full bg-black text-white">
      <div className="flex justify-center pt-10">
        <Image className="h-30" height={222} width={222} src={logo}></Image>
      </div>
      <div className="flex flex-col items-center justify-center text-3xl">
        <div className="w-2/4 text-center">
          <div className="mb-10 mt-10">Hard to pronounce name?</div>
          <div className="mb-10">Record your own audio.</div>
          <div>
            When someone asks you how to pronounce your name, send a link,
            instead of writing it out.
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-center">
        <div>
          <div className="fun-font mb-5 text-2xl">
            Get your link in 1 minute.
          </div>
        </div>
        <input
          className="w-3/12 rounded-md p-3 text-black"
          placeholder="your name"
          onChange={(event) => setName(event.target.value)}
        ></input>
        <button
          className="fun-font mt-5 rounded-md border-2 border-white p-2 text-2xl"
          onClick={createNameAndRedirect}
        >
          Go
        </button>
      </div>
    </div>
  )
  return (
    <>
      <Head>
        <title>Make a new name</title>
        <meta name="description" content={`Make a new name`} />
        <link rel="icon" href="/favicon.jpeg" />
      </Head>
      <main className="h-full">{view}</main>
    </>
  )
})

IndexPage.displayName = "IndexPage"

export const getServerSideProps = config.prefetchData

export default IndexPage
