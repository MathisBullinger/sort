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

const makeSwap = (list: number[]) => (i1: number, i2: number) => {
  const tmp = list[i1]
  list[i1] = list[i2]
  list[i2] = tmp
}

const minSendDelay = 1000 / 60

async function bubbleSort(
  input: number[],
  stepTime: number,
  cb: (s: Step[]) => void
) {
  let lastSend = -Infinity
  const list = [...input]
  let steps: Step[] = []
  const swap = makeSwap(list)

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

async function insertionSort(
  input: number[],
  opsPerSec: number,
  cb: (s: Step[]) => void
) {
  let steps: Step[] = []
  let lastSend = -Infinity
  let ops = 0

  const start = performance.now()

  const list = [...input]
  const swap = makeSwap(list)

  for (let i = 1; i < list.length; i++) {
    let j = i - 1
    while (j >= 0 && list[j] > list[j + 1]) {
      steps.push([StepType.LOOK, j, j + 1])
      steps.push([StepType.SWAP, j, j + 1])

      swap(j + 1, j)
      j = j - 1

      const now = performance.now()
      if (now - lastSend >= minSendDelay) {
        cb(steps)
        steps = []
        lastSend = now
      }
      ops++
      let diff = (1000 / opsPerSec) * ops - (performance.now() - start)
      if (ops <= 1) diff = Math.max(diff, 1000 / opsPerSec)
      if (diff > 0) await wait(diff)
    }
  }

  steps.push([StepType.DONE])
  cb(steps)

  return list
}

export const api = {
  init(
    length: number,
    opsPerSec: number,
    cb: (steps: Step[]) => void
  ): number[] {
    const list = shuffle(new Array(length).fill(1).map((v, i) => v + i))

    setTimeout(() => {
      insertionSort(list, opsPerSec, cb)
    }, 500)

    return list
  },
} as const

expose(api)
