import { HtmlRenderer, SECTION_ID, EventListenerTracker, type IRenderingEngine, type ElementInternals } from '@enhanced-dom/webcomponent'
import classNames from 'classnames'
import debounce from 'lodash.debounce'

import { selectors } from './checkbox.selectors'
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
    return ['value', 'class', 'style', 'type', 'tristate', 'disabled', 'delegated']
  }

  static tag = 'enhanced-dom-checkbox'
  static register = () => {
    if (!window.customElements.get(CheckboxWebComponent.tag)) {
      window.customElements.define(CheckboxWebComponent.tag, CheckboxWebComponent)
    }
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

  static sectionIdentifiers = selectors

  static template = ({ value, tristate, type, disabled, delegated = {}, ...rest }: Record<string, any> = {}) => {
    return {
      tag: 'div',
      attributes: {
        ...rest,
        ...delegated,
        class: classNames(styles.checkbox, rest.class, { [styles.standard]: type == CheckboxType.STANDARD }),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-checked': tristate && value === null ? 'mixed' : (!!value).toString(),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-disabled': disabled ? true : false,
        role: tristate ? 'checkboxtristate' : 'checkbox',
        tabindex: disabled ? undefined : 0,
        [SECTION_ID]: CheckboxWebComponent.sectionIdentifiers.CONTAINER,
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
    }
  }
  static renderer: IRenderingEngine = new HtmlRenderer('@enhanced-dom/CheckboxWebComponent', CheckboxWebComponent.template)
  private _attributes: Record<string, any> = {
    type: CheckboxType.STANDARD,
  }
  private _eventListenerTracker = new EventListenerTracker()

  //#region form api compatibility
  static formAssociated = true
  private _internals: ElementInternals
  get value() {
    if (!this._attributes.triState) {
      return this._attributes.value ?? false
    }
    return this._attributes.value
  }
  set value(v: string | boolean | null) {
    if (typeof v === 'string') {
      const parsedValue = JSON.parse(v)
      this._attributes.value = this.tristate ? parsedValue : !!parsedValue
    } else {
      this._attributes.value = v
    }
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
    this._addEventListeners()
    CheckboxWebComponent.renderer.render(this.shadowRoot, this._attributes)
  }

  private _addEventListeners = (activate?: boolean) => {
    this._eventListenerTracker.unregister({ nodeLocator: this._findCheckboxContainer })
    if (this._attributes.disabled) {
      this._eventListenerTracker.register({
        hook: (e: Element) => {
          const stopEvent = (event: MouseEvent | TouchEvent | KeyboardEvent) => {
            if (event.target === this._findCheckboxContainer()) {
              event.stopPropagation()
              event.preventDefault()
              event.preventDefault()
            }
          }
          const keyHandler = (event: KeyboardEvent) => {
            if (['Enter', ' '].includes(event.key)) {
              stopEvent(event)
            }
          }
          e.addEventListener('click', stopEvent)
          e.addEventListener('touchstart', stopEvent)
          e.addEventListener('keypress', keyHandler)

          return (e1: Element) => {
            e1.removeEventListener('click', stopEvent)
            e1.removeEventListener('touchstart', stopEvent)
            e1.removeEventListener('keypress', keyHandler)
          }
        },
        nodeLocator: this._findCheckboxContainer,
      })
    } else {
      this._eventListenerTracker.register({
        hook: (e: Element) => {
          const toggleValue = (event: MouseEvent | TouchEvent | KeyboardEvent) => {
            if (event.target === this._findCheckboxContainer()) {
              this.value = !this.value
              this.dispatchEvent(new Event('change'))
            }
          }
          const keyHandler = (event: KeyboardEvent) => {
            if (['Enter', ' '].includes(event.key)) {
              toggleValue(event)
            }
          }
          e.addEventListener('click', toggleValue)
          e.addEventListener('touchstart', toggleValue)
          e.addEventListener('keypress', keyHandler)

          return (e1: Element) => {
            e1.removeEventListener('click', toggleValue)
            e1.removeEventListener('touchstart', toggleValue)
            e1.removeEventListener('keypress', keyHandler)
          }
        },
        nodeLocator: this._findCheckboxContainer,
      })
    }
    if (activate) {
      this._eventListenerTracker.refreshSubscriptions()
    }
  }

  private _findCheckboxContainer = (): HTMLElement => {
    return this.shadowRoot.querySelector(`*[${SECTION_ID}="${CheckboxWebComponent.sectionIdentifiers.CONTAINER}"]`)
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
    this._internals.labels?.forEach((label) => {
      label.addEventListener('click', () => {
        this._findCheckboxContainer().focus()
      })
      label.addEventListener('touchstart', () => {
        this._findCheckboxContainer().focus()
      })
    })
  }

  get tristate() {
    return this._attributes.tristate
  }
  set tristate(t: string | boolean) {
    if (typeof t === 'string') {
      this._attributes.tristate = t === 'true' || t === ''
    } else {
      this._attributes.tristate = t
    }
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
    this._addEventListeners(true)
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

CheckboxWebComponent.renderer.addStyle(styles._stylesheetName)
