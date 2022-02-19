import React, { useState } from "react"
import type { NextPage } from "next"
import { Button } from "@/tailwind-components/application_ui/Button"
import { prepareNameJourney } from "@/prep/prepareNameJourney"

const TriggerWithLoading = ({
  triggerFn,
  label,
}: {
  triggerFn: () => Promise<any>
  label: string
}) => {
  const [loading, setLoading] = useState(false)

  const runTriggerAndSetLoading = async () => {
    setLoading(true)
    await triggerFn()
    setLoading(false)
  }

  return (
    <Button
      onClick={runTriggerAndSetLoading}
      buttonAssets={{ text: loading ? "running..." : label }}
    ></Button>
  )
}

const TestPage: NextPage = () => {
  return (
    <div>
      <div className="mt-10">
        <TriggerWithLoading
          triggerFn={prepareNameJourney}
          label="prepare name journey"
        ></TriggerWithLoading>
      </div>
    </div>
  )
}

export default TestPage
