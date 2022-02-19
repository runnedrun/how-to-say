import React from "react"
import { ReactNode } from "react"
import classNames from "classnames"

interface Icon {
  buttonIcon?: ReactNode
}
interface ButtonAssets {
  text?: string
  icon?: Icon
}

export interface ButtonProps {
  primary?: boolean
  secondary?: boolean
  white?: boolean
  isLeadingIcon?: boolean
  round?: boolean
  buttonAssets: ButtonAssets
  className?: string
  onClick: () => void
}

export const exampleProps: ButtonProps = {
  primary: false,
  secondary: true,
  white: false,
  isLeadingIcon: false,
  round: false,
  buttonAssets: {
    text: "Button text",
    icon: {
      buttonIcon: (
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
      ),
    },
  },
  onClick: () => {},
}

export const Button = ({
  primary,
  secondary,
  white,
  isLeadingIcon,
  round,
  buttonAssets,
  className,
  onClick,
}: ButtonProps) => {
  const defaultMode = !primary && !secondary
  return (
    <>
      <button
        onClick={onClick}
        type="button"
        className={`justify-center ${classNames({
          "inline-flex px-2.5 py-1.5 items-center border": buttonAssets.text,
          "border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-400 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500":
            primary || defaultMode,
          "border-transparent text-xs font-medium rounded text-secondary-700 bg-secondary-100 hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500": secondary,
          "border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500": white,
          "inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full": round,
          "inline-flex items-center p-1 border border-transparent rounded-full shadow-sm focus:ring-offset-2 focus:ring-indigo-500": !buttonAssets.text,
          [className]: true,
        })}`}
      >
        {!isLeadingIcon && buttonAssets.text}
        {!isLeadingIcon && buttonAssets.icon?.buttonIcon}

        {isLeadingIcon && buttonAssets.icon?.buttonIcon}
        {isLeadingIcon && buttonAssets.text}
      </button>
    </>
  )
}
