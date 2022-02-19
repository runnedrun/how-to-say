import React, { useState, useEffect, useRef } from "react"
import { ChevronUpIcon, ChevronDownIcon, XIcon } from "@heroicons/react/solid"
import { Key } from "ts-keycode-enum"
import classNames from "classnames"
import { objKeys } from "@/helpers/objKeys"
import _ from "lodash"
export interface Item {
  id?: string
  text: string
  imageHref?: string
  disabled?: boolean
}

export const exampleItems: Item[] = [
  {
    id: "1",
    text: "Wade Cooper",
    imageHref:
      "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "2",
    text: "Arlene Mccoy",
    imageHref:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "3",
    text: "Devon Webb",
    imageHref:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
  },
  {
    id: "4",
    text: "Tom Cook",
    imageHref:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "5",
    text: "Tanya Fox",
    imageHref:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "6",
    text: "Hellen Schmidt",
    imageHref:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "7",
    text: "Caroline Schultz",
    imageHref:
      "https://images.unsplash.com/photo-1568409938619-12e139227838?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "8",
    text: "Mason Heaney",
    imageHref:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "9",
    text: "Claudie Smitham",
    imageHref:
      "https://images.unsplash.com/photo-1584486520270-19eca1efcce5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "10",
    text: "Emil Schaefer",
    imageHref:
      "https://images.unsplash.com/photo-1561505457-3bcad021f8ee?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
]

interface TypeaheadDropdownProps {
  items: Item[]
  label: string
  onChange: ({
    selected,
    userGenerated,
  }: {
    selected: Record<string, Item>
    userGenerated: string[]
  }) => void
  multiSelect?: boolean
  selectAllText?: string
  maxSelectedItemsDisplayed?: number
  validationError?: string
  allowUserGeneratedOptions?: boolean
  userGeneratedOptionLabel?: string
  imagePlaceholder?: React.ReactNode
  defaultSelection?: Record<string, Item>
  disableDeselect?: boolean
  allowFiltering?: boolean
}

export const exampleProps: TypeaheadDropdownProps = {
  items: exampleItems,
  label: "Assigned To",
  onChange: () => {},
}

export const TypeaheadDropdown = ({
  items,
  label,
  onChange,
  multiSelect = false,
  selectAllText,
  maxSelectedItemsDisplayed = 4,
  validationError,
  allowUserGeneratedOptions = false,
  userGeneratedOptionLabel = "other",
  imagePlaceholder,
  defaultSelection,
  disableDeselect,
  allowFiltering = true,
}: TypeaheadDropdownProps) => {
  const [selected, setSelected] = useState<{
    [key: string]: Item
  }>(defaultSelection || {})
  const [allItems, setAllItems] = useState(items)
  const [openDropdown, setOpenDropdown] = useState(false)
  const [searchItem, setSearchItem] = useState("")

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const isNonExistenOptionRegex = new RegExp(`^${userGeneratedOptionLabel}::`)
    const optionValueRegex = new RegExp(`^${userGeneratedOptionLabel}: (.*)`)

    const userGenerated = objKeys(selected)
      .map((id) => {
        const value = selected[id]
        const isNonExistenOptionRegex = new RegExp(
          `^${userGeneratedOptionLabel}::`
        )

        if (isNonExistenOptionRegex.test(String(id))) {
          const matchData = value.text.match(optionValueRegex)
          const match = matchData && matchData[1]
          return match
        }
      })
      .filter(Boolean)

    const selectedWithoutUserGenerated = _.pickBy(
      selected,
      (_, key: string) => !isNonExistenOptionRegex.test(key)
    )

    onChange({ selected: selectedWithoutUserGenerated, userGenerated })
  }, [selected])

  const addOrRemoveSelection = (newSelection: Item) => {
    if (newSelection.disabled) return

    const selectedClone = multiSelect ? { ...selected } : {}

    const alreadySelected = selected[newSelection.id]

    if (alreadySelected && !disableDeselect) {
      delete selectedClone[newSelection.id]
    } else {
      selectedClone[newSelection.id] = {
        ...newSelection,
      }
      !multiSelect && setOpenDropdown(false)
    }
    setSelected(selectedClone)
    setSearchItem("")
    setAllItems(items)
    inputRef?.current?.focus()
  }

  useEffect(() => {
    const closeDropdown = (event: any) => {
      if (
        dropdownRef?.current &&
        !dropdownRef?.current?.contains(event.target)
      ) {
        setOpenDropdown(false)
        setSearchItem("")
        setAllItems(items)
      }
    }

    document.addEventListener("mousedown", closeDropdown)
    return () => {
      document.removeEventListener("mousedown", closeDropdown)
    }
  })

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown)
  }

  const handleDeleteOfLastSelectionOrCloseOrSave: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (
      (event.which === Key.Delete || event.which === Key.Backspace) &&
      !searchItem
    ) {
      const lastItemKey = Object.keys(selected)[
        Object.keys(selected).length - 1
      ]
      const clone = { ...selected }
      delete clone[lastItemKey]
      setSelected(clone)
    }

    if (event.which === Key.Escape) {
      inputRef.current?.blur()
    }

    if (event.which === Key.Enter && allItems[0]) {
      addOrRemoveSelection(allItems[0])
    }
  }

  const filterItems = () => {
    const filteredItems = items.filter((item) =>
      item.text
        .toLocaleLowerCase()
        .includes(searchItem.toLocaleLowerCase().trim())
    )
    if (searchItem && allowUserGeneratedOptions) {
      const otherItem: Item = {
        text: `${userGeneratedOptionLabel}: ${searchItem}`,
        id: `${userGeneratedOptionLabel}::${Date.now()}`,
      }
      filteredItems.push(otherItem)
    }

    setAllItems(filteredItems)
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setSearchItem(event.target.value)
  }

  useEffect(filterItems, [searchItem, items])

  const selectedItems = Object.values(selected)

  const truncatedSelection = selectedItems.slice(0, maxSelectedItemsDisplayed)

  const numberOfTruncatedItems =
    selectedItems.length - truncatedSelection.length

  const classesForUnselectedElement =
    "relative py-2 pl-3 text-gray-900 mb-1 cursor-default select-none pr-9"

  const selectAllClasses =
    "text-primary-400 text-sm cursor-pointer flex-shrink-0"

  const selectAll = () => {
    const allSelected = {} as { [key: string]: Item }
    items.forEach((item) => (allSelected[item.id] = { ...item }))
    setSelected(() => ({ ...selected, ...allSelected }))
  }

  const clearAll = () => {
    setSelected({})
  }

  let selectAllComponent = <div />

  let clearSelectionComponent = <XIcon className="h-4 w-4" />

  if (selectAllText) {
    selectAllComponent =
      selectedItems.length === items.length ? (
        <div className={selectAllClasses} onClick={clearAll}>
          {"Clear Selection"}
        </div>
      ) : (
        <div className={selectAllClasses} onClick={selectAll}>
          {selectAllText} ({items.length})
        </div>
      )
  }

  const possiblyCloseDropdownOnBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setOpenDropdown(false)
      }
    }, 300)
  }

  const showRemoveItemUi = multiSelect || allowFiltering

  return (
    <div ref={dropdownRef}>
      <div className="flex justify-between flex-wrap">
        <label
          id="listbox-label"
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        {selectAllComponent}
      </div>
      <div
        className="relative w-full py-1 pr-10 mt-1 text-left bg-white border border-gray-100 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
      >
        <div className="flex flex-wrap items-center">
          {truncatedSelection.map((item) => (
            <span
              key={item.id}
              className={classNames(
                "flex",
                "items-center",
                "px-2",
                "py-1",
                "my-1",
                { "bg-gray-200 rounded-md ml-2": showRemoveItemUi }
              )}
            >
              {item.imageHref && (
                <img
                  src={item.imageHref}
                  alt=""
                  className="flex-shrink-0 w-6 h-6 rounded-full mr-2"
                />
              )}
              <span className="block mr-3 text-sm truncate">{item.text}</span>
              <span
                onClick={() => addOrRemoveSelection(item)}
                className="text-sm color-gray-300"
              >
                {showRemoveItemUi && clearSelectionComponent}
              </span>
            </span>
          ))}
          {!!numberOfTruncatedItems && (
            <span className="text-sm pr-1 ml-2">
              and {numberOfTruncatedItems} others
            </span>
          )}
          {allowFiltering && (multiSelect || selectedItems.length === 0) && (
            <input
              autoComplete="off"
              ref={inputRef}
              onClick={() => setOpenDropdown(true)}
              onChange={handleChange}
              onKeyDown={handleDeleteOfLastSelectionOrCloseOrSave}
              value={searchItem}
              type="text"
              name="search"
              id="search"
              className="flex-grow inline border-none rounded-md focus:ring-0 focus:border-none focus:outline-none sm:text-sm"
              onBlur={possiblyCloseDropdownOnBlur}
            />
          )}
        </div>
        <span
          className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
          onClick={toggleDropdown}
        >
          {openDropdown ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </span>
      </div>

      <div
        className={
          openDropdown
            ? "z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            : "hidden"
        }
      >
        <ul>
          {allItems.map((item) => (
            <li
              onClick={() => addOrRemoveSelection(item)}
              key={item.id}
              className={classNames(
                selectedItems.find((_) => _.id === item.id)
                  ? `bg-gray-200 ${classesForUnselectedElement}`
                  : classesForUnselectedElement,
                {
                  "cursor-pointer": !item.disabled,
                }
              )}
            >
              <div className="flex items-center">
                {item.imageHref ? (
                  <img
                    src={item.imageHref}
                    alt=""
                    className="flex-shrink-0 w-6 h-6 rounded-full"
                  />
                ) : (
                  imagePlaceholder && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full">
                      {imagePlaceholder}
                    </div>
                  )
                )}
                <span
                  className={classNames("block ml-3 font-normal truncate", {
                    "text-gray-400": item.disabled,
                  })}
                >
                  {item.text}
                </span>
              </div>
              {selectedItems.find((_) => _.id === item.id) && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="text-red-400 text-sm">{validationError}</div>
    </div>
  )
}
