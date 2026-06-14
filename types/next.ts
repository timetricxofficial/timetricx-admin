// Socket related imports removed as they are no longer needed
import { NextApiResponse } from 'next'

export type NextApiResponseServerIO = NextApiResponse & {
  // socket property removed
}

