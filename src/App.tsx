import React from 'react'
import ReactDOM from 'react-dom'

import Menu from './Menu'
import {
  useGitLabApiFetch,
  useGitLabApiData,
  GitLabProject,
  ApiContext,
} from './api'
import { useLocalStorage, storageKeys } from './localStorage'
import Projects from './Projects'

export const App = () => {
  const apiFetch = useGitLabApiFetch()
  const [showMenu, setShowMenu] = React.useState(false)
  const [maybeFilter, setFilter] = useLocalStorage(storageKeys.filter)
  const filter = maybeFilter || ''

  const menuButton = (
    <>
      <button
        style={{ position: 'absolute', top: 0, right: 0 }}
        onClick={() => {
          setShowMenu(true)
        }}
      >
        ⚙️
      </button>
      {showMenu &&
        ReactDOM.createPortal(
          <Menu
            options={{ filter, onFilterChange: setFilter }}
            onClickOutside={() => {
              setShowMenu(false)
            }}
          />,
          document.getElementById('menu-container') as Element,
        )}
    </>
  )

  return (
    <ApiContext.Provider value={apiFetch}>
      <div style={{ position: 'relative' }}>
        <Projects filter={filter} />
        {menuButton}
      </div>
    </ApiContext.Provider>
  )
}
export default App
