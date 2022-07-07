import React, { useState } from 'react'
import { render } from 'react-dom'
import { withReactAdapter } from '@enhanced-dom/react'

import {CheckboxWebComponent, CheckboxWebComponentAttributes} from '../src'

declare type CheckboxAttributes = Omit<CheckboxWebComponentAttributes, 'value'> & Omit<React.InputHTMLAttributes<CheckboxWebComponentAttributes>, 'class' | 'style' | 'type' | 'value'> & {
  className?: string
  style?: React.CSSProperties
  value?: string | null
}

const Checkbox = withReactAdapter<CheckboxWebComponent, never[], typeof CheckboxWebComponent, CheckboxAttributes>({type: CheckboxWebComponent})


export const App = () => {
  const [value, setValue] = useState<string | null>(null)
  return <div style={{ width: 500, height: 500, display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <Checkbox tristate value={value} onChange={e => setValue(e.target.value as string)} />Some text
  </div>
}

const element = document.getElementById('root')
render(<App />, element)
