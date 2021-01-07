import { expose } from 'comlink'
import type { Step } from './sort/utils'
import * as sorts from './sort/algorithms'

declare let self: DedicatedWorkerGlobalScope
export default null

const shuffle = (list: number[]): number[] => {
  const shuffled: number[] = []
  while (list.length)
    shuffled.push(list.splice((Math.random() * list.length) | 0, 1)[0])
  return shuffled
}

export const api = {
  init(
    length: number,
    opsPerSec: number,
    cb: (steps: Step[]) => void
  ): number[] {
    const list = shuffle(new Array(length).fill(1).map((v, i) => v + i))

    setTimeout(() => {
      sorts.insertion(list, opsPerSec, cb)
    }, 500)

    return list
  },
} as const

expose(api)
