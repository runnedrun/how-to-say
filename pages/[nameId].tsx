import React from "react"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { config } from "../views/[nameId]/config"
import ErrorPage from "next/error"
import Head from "next/head"
import { NameDisplay } from "@/views/[nameId]/NameDisplay"

const Hylite: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = config.Parent(({ data: { namesForNameId } }) => {
  const name = namesForNameId[0]
  return name ? (
    <>
      <Head>
        <title>How to pronounce {name.displayName}</title>
        <meta
          name="description"
          content={`How to pronounce ${name.displayName}`}
        />
        <link rel="icon" href="/hylite_favicon.png" />
      </Head>
      <main className="h-full">{<NameDisplay />}</main>
    </>
  ) : (
    <ErrorPage statusCode={404}></ErrorPage>
  )
})

Hylite.displayName = "Hylite"

export const getServerSideProps = config.prefetchData

export default Hylite
