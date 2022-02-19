import { config } from "./config"
import ReactAudioPlayer from "react-audio-player"

export const NameDisplay = config.NameDisplay(
  ({ data: { namesForNameId } }) => {
    const name = namesForNameId[0]
    return (
      <div className="h-full bg-black">
        <div className="flex flex-col items-center justify-center p-5">
          <div className="border-2 p-5 text-3xl text-white md:text-9xl">
            {name.displayName}
          </div>
          <div className="mt-16 text-3xl text-white">
            "{name.pronunciationDescription}"
          </div>
          <ReactAudioPlayer
            className="mt-16"
            src={name.pronunciationRecording}
            controls
          />
        </div>
      </div>
    )
  }
)
