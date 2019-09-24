import React from 'react'

export const storageKeys = {
  apiUrl: 'gitlab-pipelines-api-url',
  apiToken: 'gitlab-pipelines-api-token',
  filter: 'gitlab-pipelines-filter'
}

export function useLocalStorage(
  storageKey: string,
): [string | null, (value: string | null) => void, () => void] {
  const [storedValue, setStoredValue] = React.useState(
    localStorage.getItem(storageKey),
  )

  const removeItem = () => {
    localStorage.removeItem(storageKey)
    setStoredValue(null)
  }

  const setItem = (value: string | null) => {
    if (!value) {
      removeItem()
      return
    }

    localStorage.setItem(storageKey, value)
    setStoredValue(value)
  }

  return [storedValue, setItem, removeItem]
}

export function useLocalStorageOrPrompt(
  storageKey: string,
  text: string,
): [string, (value: string | null) => void, () => void] {
  const [value, setValue, clearValue] = useLocalStorage(storageKey)
  if (!value) {
    setValue(prompt(text))
  }

  return [value as string, setValue, clearValue]
}
