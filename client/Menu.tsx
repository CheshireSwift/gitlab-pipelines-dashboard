import React from 'react'
import { ApiFetch, ApiContext } from './api'

const leftSpace = { marginLeft: '0.5rem' }

type MenuOptions = {
  filter: string
  onFilterChange: (value: string) => void
}

const MenuBody = ({ filter, onFilterChange }: MenuOptions) => {
  const apiFetch = React.useContext(ApiContext)
  const [url, setUrl] = React.useState(apiFetch.url)
  const [token, setToken] = React.useState(apiFetch.token)

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Project filter"
          value={filter}
          onChange={e => {
            onFilterChange(e.target.value)
          }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <input
          value={url}
          onChange={e => {
            setUrl(e.target.value)
          }}
          placeholder="API URL"
        />
        <input
          type="password"
          value={token}
          onChange={e => {
            setToken(e.target.value)
          }}
          placeholder="API token"
        />
        <button
          style={leftSpace}
          onClick={() => {
            if (!confirm('Update credentials?')) {
              return
            }

            apiFetch.setCredentials({
              url,
              token,
            })
          }}
        >
          Apply credentials
        </button>
        <button
          style={leftSpace}
          onClick={() => {
            if (!confirm('Delete credentials?')) {
              return
            }

            apiFetch.clearCredentials()
          }}
        >
          Clear credentials
        </button>
      </div>
    </>
  )
}

export const Menu = ({
  options,
  onClickOutside,
}: {
  options: MenuOptions
  onClickOutside: () => void
}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      background: 'var(--transparent-grey)',
    }}
    onClick={onClickOutside}
  >
    <div
      style={{
        width: '60%',
        margin: '4rem auto',
        color: 'var(--blue)',
        border: '0.25rem solid var(--blue)',
        boxShadow: '0 0 2rem',
        background: 'var(--black)',
        padding: '1rem',
        borderRadius: '1rem',
      }}
      onClick={e => {
        e.stopPropagation()
      }}
    >
      <MenuBody {...options} />
    </div>
  </div>
)

export default Menu
