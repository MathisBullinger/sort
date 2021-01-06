import { expose } from 'comlink'

declare let self: DedicatedWorkerGlobalScope
export default null

const shuffle = (list: number[]): number[] => {
  const shuffled: number[] = []
  while (list.length)
    shuffled.push(list.splice((Math.random() * list.length) | 0, 1)[0])
  return shuffled
}

export const api = {
  init(length: number): number[] {
    const list = shuffle(new Array(length).fill(1).map((v, i) => v + i))
    return list
  },
} as const

expose(api)
