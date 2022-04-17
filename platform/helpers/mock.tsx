import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended"
import { useRouter } from "next/router"
import prisma from "./db"


jest.mock("./client", () => (
  {
    __esModule: true,
    default: mockDeep<PrismaClient>()
  }
))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const routerMock = useRouter as DeepMockProxy<typeof useRouter>
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>