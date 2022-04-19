import Encode from "../pages/encode";
import { encodeElements } from "../pages/questions";
import { fireEvent, render, screen } from "@testing-library/react";
import { SessionProvider } from "next-auth/react"

let data: Record<string, any> = {}

test("test encoding form renders with all expected elements", async () => {
  const result = render(
  <SessionProvider session={{expires: "10", "user": {"email": "sumant.r.shringari@gmail.com"}}}>
    <Encode />
  </SessionProvider>
  )
  const container = result.container

  // check that all elements are rendered
  for (let element of encodeElements) {
    expect(screen.getByTestId(`${element.name}-title`)).toBeInTheDocument()
    expect(screen.getByTestId(`${element.name}-title`).textContent).toBe(element.title)

    if (element.choices) {
      for (let choice of element.choices) {
        expect(screen.queryByTestId(`${element.name}-${choice}-input`)).toBeInTheDocument()
        expect(screen.getByTestId(`${element.name}-${choice}-label`)).toBeInTheDocument()
        expect(screen.getByTestId(`${element.name}-${choice}-label`).textContent?.trim()).toBe(choice.trim())
      }
    }
  }
  
  const submitButton = screen.getByTestId("rapid-forms-submit")
  expect(submitButton).toBeInTheDocument()
})

test("test form submission occurs" , async () => {
  const onSubmitMock = jest.fn((event) => {})
  const onChangeMock = jest.fn((event) => {data = {...data, [event.target.name]: event.target.value}})
  
  const result = render(
  <SessionProvider session={{expires: "10", "user": {"email": "sumant.r.shringari@gmail.com"}}}>
    <Encode onSubmit={onSubmitMock} onChange={onChangeMock} />
  </SessionProvider>
  )

  for (let element of encodeElements) {
    if (element.type === "radio" && element.choices) {
      const match = screen.getByTestId(`${element.name}-${element.choices[0]}-label`)
      expect(fireEvent.click(match)).toBe(true)
      expect(onChangeMock).toBeCalled()
    } else if (element.type === "checkbox" && element.choices) {
      const match1 = screen.getByTestId(`${element.name}-${element.choices[0]}-label`)
      expect(fireEvent.click(match1)).toBe(true)
      expect(onChangeMock).toBeCalled()   
      
      const match2 = screen.getByTestId(`${element.name}-${element.choices[0]}-label`)
      expect(fireEvent.click(match2)).toBe(true)
      expect(onChangeMock).toBeCalled()   
      expect(fireEvent.click(match2)).toBe(true)
      expect(onChangeMock).toBeCalled()   
    }
  }

  const form = result.getByTestId("rapid-form")

  if (form) {
    expect(fireEvent.submit(form)).toBe(true)
    expect(onSubmitMock).toHaveBeenCalledTimes(1)
  }

  console.log(data)
  for (let element of encodeElements) {
    if (element.type === "radio" && element.choices) {
      expect(data[element.name]).toBe(element.choices[0])
    } else if (element.type === "checkbox" && element.choices) {
      expect(data[element.name + "-0"]).toBe(element.choices[0])
      expect(data[element.name + "-1"]).not.toBe(element.choices[1])
    }
  }
})