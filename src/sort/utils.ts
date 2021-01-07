export enum StepType {
  READ,
  SWAP,
  SET,
  DONE,
}

export type Step = [StepType, ...number[]]

const minSendDelay = 1000 / 60

const wait = async (ms: number) =>
  await new Promise((res) => setTimeout(res, ms))

const isSorted = (list: number[]): boolean => {
  for (let i = 0; i < list.length - 1; i++)
    if (list[i] > list[i + 1] || typeof list[i] !== 'number') return false
  return true
}

type Methods = {
  read: (i: number) => Promise<number>
  comp: (i1: number, i2: number) => Promise<boolean>
  swap: (i1: number, i2: number) => void
  set: (i: number, n: number) => void
}

type SortFunc = (list: number[], methods: Methods) => Promise<void>

export const wrap = (func: SortFunc) => async (
  input: number[],
  readsPerSec: number,
  cb: (s: Step[]) => void
): Promise<number[]> => {
  const list = [...input]

  let steps: Step[] = []
  let lastSend = -Infinity
  let reads = 0
  const start = performance.now()

  const sync = async () => {
    const now = performance.now()
    if (now - lastSend >= minSendDelay) {
      cb(steps)
      steps = []
      lastSend = now
    }
    let diff = (1000 / readsPerSec) * reads - (now - start)
    if (reads <= 1) diff = Math.max(diff, 1000 / readsPerSec)
    if (diff > 0) await wait(diff)
  }

  const methods: Methods = {
    async read(i) {
      i |= 0
      reads++
      if (reads % 2) await sync()
      let readStep = steps.find(([t]) => t === StepType.READ)
      if (!readStep) {
        readStep = [StepType.READ]
        steps.push(readStep)
      }
      readStep.push(i)
      return list[i]
    },

    comp: async (i1, i2) => (await methods.read(i1)) > (await methods.read(i2)),

    swap(i1, i2) {
      const tmp = list[i1]
      list[i1] = list[i2]
      list[i2] = tmp
      steps.push([StepType.SWAP, i1, i2])
    },

    set(i, n) {
      list[i | 0] = n
      steps.push([StepType.SET, i | 0, n])
    },
  }

  await func(list, methods)

  steps.push([StepType.DONE])
  cb(steps)

  if (!isSorted(list)) throw Error('incorrectly sortd')
  return list
}
