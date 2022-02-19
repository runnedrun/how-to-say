import React from "react"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { config } from "../views/edit/config"
import ErrorPage from "next/error"
import Head from "next/head"
import { EditableNameDisplay } from "@/views/edit/EditableNameDisplay"

const EditableNamePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = config.Parent(({ data: { nameForEditKey } }) => {
  const view = <EditableNameDisplay />
  return nameForEditKey ? (
    <>
      <Head>
        <title>Edit: {nameForEditKey.displayName}</title>
        <meta
          name="description"
          content={`Edit: ${nameForEditKey.displayName}`}
        />
        <link rel="icon" href="/favicon.jpeg" />
      </Head>
      <main className="h-full">{view}</main>
    </>
  ) : (
    <ErrorPage statusCode={404}></ErrorPage>
  )
})

EditableNamePage.displayName = "EditableNamePage"

export const getServerSideProps = config.prefetchData

export default EditableNamePage
