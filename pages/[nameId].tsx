import React from "react"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { config as nameConfig } from "../views/[nameId]/config"
import ErrorPage from "next/error"
import Head from "next/head"
import { NameDisplay } from "@/views/[nameId]/NameDisplay"

const NamePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = nameConfig.Parent(({ data: { namesForNameId } }) => {
  const name = namesForNameId[0]

  const view = <NameDisplay />
  return name ? (
    <>
      <Head>
        <title>How to pronounce {name.displayName}</title>
        <meta
          name="description"
          content={`How to pronounce ${name.displayName}`}
        />
        <link rel="icon" href="/favicon.jpeg" />
      </Head>
      <main className="h-full">{view}</main>
    </>
  ) : (
    <ErrorPage statusCode={404}></ErrorPage>
  )
})

NamePage.displayName = "NamePage"

export const getServerSideProps = nameConfig.prefetchData

export default NamePage
