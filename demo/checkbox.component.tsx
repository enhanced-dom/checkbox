import React from 'react'
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

export const Checkbox = withReactAdapter<CheckboxWebComponent, never[], typeof CheckboxWebComponent, CheckboxAttributes>({
  type: CheckboxWebComponent,
})
