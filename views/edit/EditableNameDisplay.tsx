import { config } from "./config"
import ReactAudioPlayer from "react-audio-player"
import { InputGroup } from "@/tailwind-components/application_ui/input_groups/InputGroup"
import { fb, setters } from "@/data/fb"
import { Name } from "@/data/types/Name"
import TextArea from "@/tailwind-components/application_ui/input_groups/TextArea"
import AudioReactRecorder, { RecordState } from "audio-react-recorder"
import { useEffect, useState } from "react"
import classNames from "classnames"
import { getDownloadURL, getStorage, ref, uploadBytes } from "@firebase/storage"
import e from "cors"
import {
  getFirestore,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore"

type AudioRecorderProps = {
  name: Name
}
const AudioRecorder = ({ name }: AudioRecorderProps) => {
  const [recordingState, setRecordingState] = useState(null as RecordState)
  const [localRecordingUrl, setLocalRecordingUrl] = useState(null as string)
  const [blobToUpload, setBlobToUpload] = useState(null)
  const [uploading, setUploading] = useState(false)

  const upload = () => {
    const storage = getStorage()
    setUploading(true)
    const fileRef = ref(
      storage,
      `pronunciation_recordings/test-${Date.now()}.jpg`
    )
    const upload = uploadBytes(fileRef, blobToUpload)
    upload.then(() => {
      setUploading(false)
      getDownloadURL(fileRef).then((url) => {
        setters.name(name.uid, {
          pronunciationRecording: url,
        })
        setLocalRecordingUrl(null)
        setBlobToUpload(null)
        setRecordingState(null)
      })
    })
  }

  const buttonClasses = "rounded-md bg-white p-2 mr-2 cursor-pointer"
  let controls = <div></div>
  if (!recordingState) {
    controls = (
      <div
        className={classNames(buttonClasses)}
        onClick={() => {
          setRecordingState(RecordState.START)
        }}
      >
        Record Pronunciation
      </div>
    )
  } else if (recordingState === RecordState.START) {
    controls = (
      <div
        className={classNames(buttonClasses)}
        onClick={() => {
          setRecordingState(RecordState.STOP)
        }}
      >
        Stop Recording
      </div>
    )
  } else if (!uploading) {
    controls = (
      <div className="flex">
        <div className={classNames(buttonClasses)} onClick={upload}>
          Upload
        </div>
        <div
          className={classNames(buttonClasses)}
          onClick={() => {
            setRecordingState(RecordState.START)
          }}
        >
          Record Again
        </div>
      </div>
    )
  } else {
    controls = <div className={classNames(buttonClasses)}>Uploading...</div>
  }

  const onStop = (audioData) => {
    setLocalRecordingUrl(audioData.url)
    setBlobToUpload(audioData.blob)
  }
  let recorder = <div></div>
  if (typeof window !== "undefined") {
    recorder = (
      <AudioReactRecorder
        canvasWidth={"200px"}
        canvasHeight={"50px"}
        state={recordingState}
        onStop={onStop}
        type="audio/ogg"
      />
    )
  }

  return (
    <div className="mt-10">
      <div className="mb-5 flex justify-center">{controls}</div>
      <div className="flex justify-center">{recorder}</div>
      {name.pronunciationRecording && (
        <div className="flex justify-center">
          <ReactAudioPlayer
            className="mt-16"
            src={localRecordingUrl || name.pronunciationRecording}
            controls
          />
        </div>
      )}
    </div>
  )
}

const idTakenError = "Error: That url is already taken."

export const EditableNameDisplay = config.EditableNameDisplay(
  ({
    data: { nameForEditKey },
    props: { nameKey, suggestedName },
    state: {
      savingText,
      setSavingText,
      savingTextTimeout,
      setSavingTextTimeout,
      savingIdTimeout,
      setSavingIdTimeout,
    },
  }) => {
    const name = nameForEditKey

    const onChange = (fieldName: keyof Name) => (value: string) => {
      console.log("RINNING", fieldName, value)
      setSavingText("Editing...")

      clearTimeout(savingTextTimeout)

      setSavingTextTimeout(
        setTimeout(() => {
          setSavingText("Saved!")
          setSavingTextTimeout(
            setTimeout(() => {
              setSavingText("")
            }, 2000)
          )
        }, 1005)
      )
      setters.name(nameKey, {
        [fieldName]: value,
      })
    }

    const checkIfIdIsValid = (name: string) => {
      const valid = !new RegExp(/[^-\w]+/g).test(name)
      if (!valid) {
        setSavingText(
          "Error: Invalid url. Please only use - and letters/numbers"
        )
      }
      return valid
    }

    const checkIfIdIsTaken = async (id) => {
      const firestore = getFirestore()
      const q = query(collection(firestore, "name"), where("nameId", "==", id))
      const qDocs = await getDocs(q)
      const isSelf = qDocs.docs.some((doc) => doc.id === name.uid)
      if (qDocs.docs.length && !isSelf) {
        setSavingText(idTakenError)
      } else {
        setSavingText("Saved!")
        setSavingTextTimeout(
          setTimeout(() => {
            setSavingText("")
          }, 2000)
        )

        setters.name(name.uid, {
          nameId: id,
        })
      }
    }

    const onIdChange = (id: string) => {
      clearTimeout(savingIdTimeout)
      setSavingText("Editing...")
      setSavingIdTimeout(
        setTimeout(() => {
          if (checkIfIdIsValid(id)) {
            checkIfIdIsTaken(id)
          }
        }, 1000)
      )
    }

    const errorText = savingText.startsWith("Error") ? (
      <div className="text-red-400">{savingText || "\u00A0"}</div>
    ) : (
      <div className="text-white">{savingText || "\u00A0"}</div>
    )

    console.log(name.displayName, "wowojwoj")

    useEffect(() => {
      console.log("siuggest", suggestedName)
      if (suggestedName) {
        const isTaken = checkIfIdIsTaken(suggestedName)
        if (isTaken) {
          setSavingText(idTakenError)
        } else {
          setters.name(name.uid, {
            nameId: suggestedName,
          })
        }
      }
    }, [suggestedName])

    return (
      <div className="min-h-full bg-black pb-10">
        <div className="flex justify-center pt-3">{errorText}</div>
        <div className="mt-5 text-center text-white">
          Copy this url to edit your name later: https://sayname.how/
          {name.nameId}
          ?editKey=
          {name.uid}
        </div>
        <div className="flex flex-col items-center justify-center p-5">
          <div className="flex items-center p-5 text-2xl">
            <div className="text-white">sayname.how/</div>
            <input
              type="text"
              defaultValue={name.nameId || suggestedName}
              onChange={(e) => onIdChange(e.target.value)}
            ></input>
          </div>

          <div className="border-2 p-5 text-3xl">
            <input
              defaultValue={name.displayName}
              onChange={(e) => onChange("displayName")(e.target.value)}
            ></input>
          </div>
          <div className="mt-16 text-3xl">
            <TextArea
              label={{
                text:
                  "Please describe the pronunciation of your name, as best you can. (optional)",
                className: "text-white",
              }}
              defaultValue={name.pronunciationDescription}
              onChange={onChange("pronunciationDescription")}
            ></TextArea>
          </div>
          <div>
            <AudioRecorder name={name} />
          </div>
          {name.nameId && name.pronunciationRecording && (
            <a
              href={`/${name.nameId}`}
              target="_blank"
              className="fun-font mt-5 cursor-pointer rounded-md border-2 border-white p-4 text-white"
            >
              Check it out!
            </a>
          )}
        </div>
      </div>
    )
  }
)
