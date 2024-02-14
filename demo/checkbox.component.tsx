import { type InputHTMLAttributes } from 'react'
import { withReactAdapter } from '@enhanced-dom/react'

import { CheckboxWebComponent, CheckboxWebComponentAttributes } from '../src'

declare type CheckboxComponentProps = Omit<CheckboxWebComponentAttributes, 'value'> &
  Omit<InputHTMLAttributes<CheckboxWebComponentAttributes>, 'type' | 'value' | 'role' | 'aria-disabled' | 'aria-checked'> & {
    value?: string | null
  }

export const Checkbox = withReactAdapter<CheckboxWebComponent, never[], typeof CheckboxWebComponent, CheckboxComponentProps>({
  type: CheckboxWebComponent,
})
