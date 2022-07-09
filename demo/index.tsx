import React, { useState } from 'react'
import { render } from 'react-dom'
import { withReactAdapter } from '@enhanced-dom/react'

import { CheckboxWebComponent, CheckboxWebComponentAttributes } from '../src'

declare type CheckboxAttributes = Omit<CheckboxWebComponentAttributes, 'value' | 'delegated'> &
  Omit<
    React.InputHTMLAttributes<CheckboxWebComponentAttributes>,
    'class' | 'style' | 'type' | 'value' | 'role' | 'aria-disabled' | 'aria-checked'
  > & {
    className?: string
    style?: React.CSSProperties
    value?: string | null
  }

const Checkbox = withReactAdapter<CheckboxWebComponent, never[], typeof CheckboxWebComponent, CheckboxAttributes>({
  type: CheckboxWebComponent,
})

export const App = () => {
  const [value, setValue] = useState<string | null>(null)
  return (
    <div style={{ width: 500, height: 500, display: 'flex', alignItems: 'center', gap: '10rem' }}>
      <Checkbox aria-describedby="description" tristate value={value} id="lala" onChange={(e) => setValue(e.target.value as string)} />
      <label htmlFor="lala">Some text</label>
      <p id="description">Some description</p>
    </div>
  )
}

const element = document.getElementById('root')
render(<App />, element)
