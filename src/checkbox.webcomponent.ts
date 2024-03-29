/* global ElementInternals */
import { EventListenerTracker } from '@enhanced-dom/dom'
import { STYLESHEET_ATTRIBUTE_NAME } from '@enhanced-dom/css'
import { WebcomponentRenderer, type IRenderingEngine } from '@enhanced-dom/webcomponent'
import classNames from 'classnames'
import debounce from 'lodash.debounce'

import * as styles from './checkbox.webcomponent.pcss'

export enum CheckboxType {
  STANDARD = 'standard',
  CUSTOM = 'custom',
}

export type CheckboxWebComponentAttributes = { type?: CheckboxType; delegated?: Record<string, string | number | boolean> } & (
  | { tristate?: false; value?: boolean }
  | { value?: string; tristate: true }
)

export class CheckboxWebComponent extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'type', 'tristate', 'disabled', 'delegated']
  }

  static tag = 'enhanced-dom-checkbox'
  static identifier = 'urn:enhanced-dom:checkbox'
  static parts = {
    wrapper: 'wrapper',
  }
  static cssVariables = {
    backgroundColorDisabled: styles.variablesCheckboxBackgroundColorDisabled,
    backgroundColorSelected: styles.variablesCheckboxBackgroundColorSelected,
    backgroundColorSelectedTint: styles.variablesCheckboxBackgroundColorSelectedTint,
    backgroundColorUnselected: styles.variablesCheckboxBackgroundColorUnselected,
    backgroundColorUnselectedTint: styles.variablesCheckboxBackgroundColorUnselectedTint,
    borderColorDisabled: styles.variablesCheckboxBorderColorDisabled,
    borderColorSelected: styles.variablesCheckboxBorderColorSelected,
    borderColorUnselected: styles.variablesCheckboxBorderColorUnselected,
    borderRadius: styles.variablesCheckboxBorderRadius,
    borderSize: styles.variablesCheckboxBorderSize,
    focusColor: styles.variablesCheckboxFocusColor,
    focusSize: styles.variablesCheckboxFocusSize,
    size: styles.variablesCheckboxSize,
    textColorDisabled: styles.variablesCheckboxTextColorDisabled,
    textColorSelected: styles.variablesCheckboxTextColorSelected,
  } as const

  static register = () => {
    if (!window.customElements.get(CheckboxWebComponent.tag)) {
      window.customElements.define(CheckboxWebComponent.tag, CheckboxWebComponent)
    }
  }

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  static template = ({ value, tristate, type, disabled, delegated = {}, ...rest }: Record<string, any> = {}) => {
    return [
      {
        tag: 'style',
        attributes: {
          [STYLESHEET_ATTRIBUTE_NAME]: 'enhanced-dom-checkbox',
        },
        children: [{ content: styles.css }],
      },
      {
        tag: 'div',
        attributes: {
          ...rest,
          ...delegated,
          part: CheckboxWebComponent.parts.wrapper,
          class: classNames(styles.checkbox, delegated.class, { [styles.standard]: type == CheckboxType.STANDARD }),
        },
        children:
          type === CheckboxType.CUSTOM
            ? [
                {
                  tag: 'slot',
                  attributes: {
                    name: JSON.stringify(value),
                  },
                },
              ]
            : undefined,
      },
    ]
  }
  static renderer: IRenderingEngine = new WebcomponentRenderer('@enhanced-dom/CheckboxWebComponent', CheckboxWebComponent.template)
  private _attributes: Record<string, any> = {
    type: CheckboxType.STANDARD,
    value: false,
  }
  private _eventListenerTracker = new EventListenerTracker()

  //#region html form api compatibility
  static formAssociated = true
  private _internals: ElementInternals
  get value() {
    return this._attributes.value
  }
  set value(v: string | boolean | null) {
    if (typeof v === 'string') {
      const parsedValue = JSON.parse(v)
      this._attributes.value = this.tristate ? parsedValue : !!parsedValue
    } else {
      this._attributes.value = v
    }
    this._updateReadonlyAttributes()
    this._updateForm()
  }
  get form() {
    return this._internals?.form
  }
  get name() {
    return this.getAttribute('name')
  }
  get type() {
    return this.localName
  }
  get validity() {
    return this._internals?.validity
  }
  get validationMessage() {
    return this._internals?.validationMessage
  }
  get willValidate() {
    return this._internals?.willValidate
  }

  checkValidity() {
    return this._internals?.checkValidity?.()
  }
  reportValidity() {
    return this._internals?.reportValidity?.()
  }
  //#endregion

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._internals = this.attachInternals?.() as ElementInternals
  }

  private _addEventListeners = () => {
    this.addEventListener('click', () => {
      this.value = !this.value
      this.dispatchEvent(new Event('change'))
    })
    this.addEventListener('touchstart', () => {
      this.value = !this.value
      this.dispatchEvent(new Event('change'))
    })
    const keyHandler = (event: KeyboardEvent) => {
      if (['Enter', ' '].includes(event.key)) {
        this.value = !this.value
        this.dispatchEvent(new Event('change'))
      }
    }
    this.addEventListener('keypress', keyHandler)
  }

  render = debounce(
    () => {
      CheckboxWebComponent.renderer.render(this.shadowRoot, this._attributes)
      this._eventListenerTracker.refreshSubscriptions()
    },
    10,
    { leading: false, trailing: true },
  )

  connectedCallback() {
    this.render()
    this._addEventListeners()
    this._updateReadonlyAttributes()
    this._updateForm()
  }

  private _updateReadonlyAttributes() {
    if (this._attributes.tristate && this._attributes.value === null) {
      this.setAttribute('aria-checked', 'mixed')
    } else {
      this.setAttribute('aria-checked', (!!this._attributes.value).toString())
    }

    if (this._attributes.disabled) {
      this.setAttribute('aria-disabled', '')
    } else {
      this.removeAttribute('aria-disabled')
    }
    if (this._attributes.disabled) {
      this.removeAttribute('tabindex')
    } else {
      this.setAttribute('tabindex', '0')
    }
    this.setAttribute('role', this._attributes.tristate ? 'checkboxtristate' : 'checkbox')
    this.setAttribute('exportparts', Object.values(CheckboxWebComponent.parts).join(', '))
  }

  private _updateForm() {
    // all values in form data need to be... strings. Even if we were to send a boolean value, it still becomes a string.
    this._internals.setFormValue(JSON.stringify(this._attributes.value))
  }

  get tristate() {
    return this._attributes.tristate
  }
  set tristate(t: string | boolean | null) {
    if (typeof t === 'string') {
      this._attributes.tristate = t === 'true' || t === ''
    } else {
      this._attributes.tristate = !!t
    }
    if (!this._attributes.tristate && this.value == null) {
      this.value = false
      this.dispatchEvent(new Event('change'))
    }
    this._updateReadonlyAttributes()
  }

  get disabled() {
    return this._attributes.disabled
  }
  set disabled(d: string | boolean) {
    if (typeof d === 'string') {
      this._attributes.disabled = d === 'true' || d === ''
    } else {
      this._attributes.disabled = d
    }
    this._updateReadonlyAttributes()
  }

  get delegated() {
    return this._attributes.delegated
  }
  set delegated(d: string | Record<string, string | number | boolean>) {
    if (typeof d === 'string') {
      this._attributes.delegated = JSON.parse(d)
    } else {
      this._attributes.delegated = d
    }
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal !== newVal) {
      switch (name) {
        case 'value':
          this.value = newVal == 'null' ? null : newVal === 'true' || newVal === ''
          break
        case 'tristate':
          this.tristate = newVal
          break
        case 'disabled':
          this.disabled = newVal
          break
        case 'delegated':
          this.delegated = newVal
          break
        default:
          this._attributes[name] = newVal
          break
      }
      this.render()
    }
  }
}
