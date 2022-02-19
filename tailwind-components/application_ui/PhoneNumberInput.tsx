import { useState } from "react"
import PhoneFormatter from "react-headless-phone-input"
import {
  AllInputProps,
  InputGroup,
  ValidationError,
} from "./input_groups/InputGroup"

export const PhoneNumberInput = ({
  defaultValue,
  onValueChange,
  validationError,
  ...otherProps
}: {
  defaultValue: string
  onValueChange: (value: string) => void
  validationError?: ValidationError
} & Partial<AllInputProps>) => {
  const [e164, setE164] = useState<string | undefined>(defaultValue)

  return (
    <PhoneFormatter
      defaultCountry="US"
      value={String(e164 || "")}
      onChange={(value) => {
        setE164(value || "")
        onValueChange(value || "")
      }}
    >
      {({ impossible, onInputChange, inputValue, onBlur }) => {
        return (
          <InputGroup
            value={inputValue}
            onBlur={onBlur}
            className="col-span-4"
            label={{ text: "Phone Number" }}
            type={"tel"}
            autoComplete="tel"
            onValueChange={(value) => {
              onInputChange(value)
            }}
            validationError={validationError}
            {...otherProps}
          ></InputGroup>
        )
      }}
    </PhoneFormatter>
  )
}
