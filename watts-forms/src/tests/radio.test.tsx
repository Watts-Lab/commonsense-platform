import { render, RenderResult } from '@testing-library/react';
import * as React from 'react';
import '@testing-library/jest-dom'
import Radio from '../inputs/radio';

const name = "test"
const title = "test1"
const description = "test2"
const choices = ["A", "B", "C"]

let result: RenderResult | undefined = undefined
let data: Record<any, any> = {}

const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  data = { ...data, [event.target.name]: event.target.value }
}

beforeEach(() => {result = 
  render(<Radio name={name} onChange = {onChange} title={title} description={description} choices={choices} />)
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

  expect(result.container.getElementsByClassName("form-radio")).toHaveLength(choices.length)
  const inputs = result.container.getElementsByClassName("form-radio-label")
  for (let i = 0; i < choices.length; i++) {
    const input = inputs[i] as HTMLInputElement
    expect(input.textContent?.trim()).toBe(choices[i].trim())
  }
})

test('check clicking of radio', async () => {
  if (result === undefined) {
    fail("result is undefined")
  }

  expect(result.container.getElementsByClassName("form-radio")).toHaveLength(3)

  const radioes = result.container.getElementsByClassName("form-radio")

  for (let i = 0; i < radioes.length; i++) {
    const radio = radioes[i] as HTMLInputElement
    radio.click()
    expect(radio.checked).toBe(true)
    expect(data[name]).toBe(radio.value)
    for (let j = 0; j < radioes.length; j++) {
      if (i == j) {
        continue
      }
      const radio2 = radioes[j] as HTMLInputElement
      expect(radio2.checked).toBe(false)
    }
  }
    
})