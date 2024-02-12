import { type DetailedHTMLProps, type HTMLAttributes } from 'react'
import { withReactAdapter } from '@enhanced-dom/react'
import { FontawesomeIconRenderer } from '@enhanced-dom/fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { IconWebComponent, type IconWebComponentAttributes } from '@enhanced-dom/icon'

IconWebComponent.addIconInterpreter('fa5', new FontawesomeIconRenderer())

declare type IconComponentProps = IconWebComponentAttributes<IconDefinition> &
  DetailedHTMLProps<HTMLAttributes<IconWebComponent>, IconWebComponent>

export const Icon = withReactAdapter<IconWebComponent, never[], typeof IconWebComponent, IconComponentProps>({
  type: IconWebComponent,
})
