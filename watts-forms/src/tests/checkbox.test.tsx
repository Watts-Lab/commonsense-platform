import { render, RenderResult } from '@testing-library/react';
import * as React from 'react';
import '@testing-library/jest-dom'
import CheckboxGroup from '../inputs/checkbox';

const name = "test"
const title = "test1"
const description = "test2"
const choices = ["A", "B", "C"]

let result: RenderResult | undefined = undefined
let data: Record<string, any> = {}

const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  data = { ...data, [event.target.name]: event.target.value }
}

beforeEach(() => {result = 
  render(<CheckboxGroup name={name} title={title} description={description} choices={choices} onChange = {onChange} />)
})

test('check for correct title in heading', async () => {
  if (result === undefined) {
    fail("result is undefined")
  }

  expect(result.container.getElementsByClassName("base-title")).toHaveLength(1)
  expect(result.container.getElementsByClassName("base-title")[0].textContent).toBe(title)
})

test('check for correct description in heading', async () => {
  if (result === undefined) {
    fail("result is undefined")
  }

  expect(result.container.getElementsByClassName("base-description")).toHaveLength(1)
  expect(result.container.getElementsByClassName("base-description")[0].textContent).toBe(description)
})

test('check for correct name in input', async () => {
  if (result === undefined) {
    fail("result is undefined")
  }

  expect(result.container.getElementsByClassName("form-checkbox")).toHaveLength(choices.length)
  const inputs = result.container.getElementsByClassName("form-checkbox-label")
  for (let i = 0; i < choices.length; i++) {
    const input = inputs[i] as HTMLInputElement
    expect(input.textContent?.trim()).toBe(choices[i].trim())
  }
})

test('check clicking of checkbox', async () => {
  if (result === undefined) {
    fail("result is undefined")
  }

  expect(result.container.getElementsByClassName("form-checkbox")).toHaveLength(3)

  const checkboxes = result.container.getElementsByClassName("form-checkbox")

  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i] as HTMLInputElement
    checkbox.click()
    expect(checkbox.checked).toBe(true)
  }
  
  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i] as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  }
  
  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i] as HTMLInputElement
    checkbox.click()
    expect(checkbox.checked).toBe(false)
  }  
})