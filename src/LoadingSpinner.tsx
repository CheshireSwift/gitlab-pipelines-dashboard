import React from 'react'

export const LoadingSpinner = () => (
  <span
    style={{
      display: 'inline-block',
      animation: 'rotation 2s infinite ease-in-out',
    }}
  >
    ⏳
  </span>
)

export default LoadingSpinner
