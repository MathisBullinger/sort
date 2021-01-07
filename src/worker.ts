import { expose } from 'comlink'

declare let self: DedicatedWorkerGlobalScope
export default null

const shuffle = (list: number[]): number[] => {
  const shuffled: number[] = []
  while (list.length)
    shuffled.push(list.splice((Math.random() * list.length) | 0, 1)[0])
  return shuffled
}

export enum StepType {
  LOOK,
  SWAP,
  DONE,
}

export type Step = [StepType, ...number[]]

const wait = async (ms: number) =>
  await new Promise((res) => setTimeout(res, ms))

async function bubbleSort(
  input: number[],
  stepTime: number,
  cb: (s: Step[]) => void
) {
  const minSendDelay = 1000 / 60
  let lastSend = -Infinity
  const list = [...input]
  let steps: Step[] = []

  const swap = (i1: number, i2: number) => {
    const tmp = list[i1]
    list[i1] = list[i2]
    list[i2] = tmp
  }

  let hasSwapped = false
  let step = 0
  do {
    hasSwapped = false
    for (let i = 0; i < list.length - 1 - step; i++) {
      steps.push([StepType.LOOK, i, i + 1])
      if (list[i] > list[i + 1]) {
        swap(i, i + 1)
        hasSwapped = true
        steps.push([StepType.SWAP, i, i + 1])
      }
      const now = performance.now()
      if (now - lastSend >= minSendDelay) {
        cb(steps)
        steps = []
        lastSend = now
      }
      await wait(stepTime)
    }
    step++
  } while (hasSwapped)

  steps.push([StepType.DONE])
  cb(steps)

  return list
}

export const api = {
  init(
    length: number,
    stepTime: number,
    cb: (steps: Step[]) => void
  ): number[] {
    const list = shuffle(new Array(length).fill(1).map((v, i) => v + i))

    setTimeout(() => {
      bubbleSort(list, stepTime, cb)
    }, 500)

    return list
  },
} as const

expose(api)
