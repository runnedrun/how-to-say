import { setters } from "@/data/fb"

import { Timestamp } from "@firebase/firestore"
import moment from "moment"

export const prepareNameJourney = async () => {
  await setters.name("test-1", {
    nameId: "xinqing-lu",
    displayName: "Xinqing Lu",
    pronunciationDescription: "Ching Ching",
    pronunciationRecording:
      "https://firebasestorage.googleapis.com/v0/b/how-to-say-d54c1.appspot.com/o/pronunciation_recordings%2Fxinqing-lu-123567.ogg?alt=media&token=62b9cbf3-5c28-4911-a6ba-0385ab325595",
  })
}
