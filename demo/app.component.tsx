import { type FormEventHandler, useState } from 'react'
import { faCheckCircle, faCircle, faDotCircle } from '@fortawesome/free-regular-svg-icons'

import { Icon } from './icon.component'
import { Checkbox } from './checkbox.component'
import { CheckboxType } from '../src/checkbox.webcomponent'

export const App = () => {
  const [value, setValue] = useState<string | null>(null)
  const [displayIcon, setDisplayIcon] = useState<boolean>(false)
  const [isTristate, setIsTristate] = useState<boolean>(true)
  const [isDisabled, setIsDisabled] = useState<boolean>(false)

  const logFormData: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const formData = new FormData(e.target as HTMLFormElement)
    console.log(Array.from(formData.entries()))
  }

  return (
    <div style={{ width: 500, height: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
      <form name="myForm" onSubmit={logFormData} style={{ minWidth: 350, display: 'flex', gap: 10 }}>
        <Checkbox
          name="myCheckbox"
          aria-describedby="description"
          tristate={isTristate}
          value={value}
          id="lala"
          type={displayIcon ? CheckboxType.CUSTOM : CheckboxType.STANDARD}
          onChange={(e) => setValue(e.target.value as string)}
          style={{ margin: 'auto' }}
          disabled={isDisabled}
        >
          <Icon config={{ ...faCheckCircle, namespace: 'fa5' }} slot="true" />
          <Icon config={{ ...faCircle, namespace: 'fa5' }} slot="false" />
          <Icon config={{ ...faDotCircle, namespace: 'fa5' }} slot="null" />
        </Checkbox>
        <label htmlFor="lala" style={{ margin: 'auto' }}>
          Some text
        </label>
        <p id="description">Some description</p>
        <button type="submit">Log form state</button>
      </form>
      <Checkbox id="displayType" value={displayIcon.toString()} onChange={(e) => setDisplayIcon(e.target.value as boolean)} />
      <label htmlFor="displayType">Show icon</label>
      <Checkbox id="tristate" value={isTristate.toString()} onChange={(e) => setIsTristate(e.target.value as boolean)} />
      <label htmlFor="tristate">Is tristate</label>
      <Checkbox id="disabled" value={isDisabled.toString()} onChange={(e) => setIsDisabled(e.target.value as boolean)} />
      <label htmlFor="disabled">Is disabled</label>
    </div>
  )
}
