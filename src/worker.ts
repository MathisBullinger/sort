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

const genList = (length: number, arr = new Array(length).fill(0)) => ({
  linear: () => shuffle(arr.map((_, i) => i)),
  random: () => shuffle(arr.map(() => Math.random() * length)),
  reversed: () => arr.map((_, i) => i).reverse(),
})

export type ListType = keyof ReturnType<typeof genList>

export const api = {
  init(
    algorithm: keyof typeof sorts,
    length: number,
    rps: number,
    listType: ListType,
    cb: (steps: Step[]) => void
  ): number[] {
    const list = genList(length)[listType]()

    setTimeout(() => {
      sorts[algorithm](list, rps, cb)
    }, 500)

    return list
  },
} as const

expose(api)
