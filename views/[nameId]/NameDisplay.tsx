import { config } from "./config"

export const NameDisplay = config.NameDisplay(
  ({ data: { namesForNameId } }) => {
    const name = namesForNameId[0]
    return <div>{name.displayName}</div>
  }
)
