export enum StepType {
  LOOK,
  SWAP,
  DONE,
}

export type Step = [StepType, ...number[]]

const minSendDelay = 1000 / 60

type SortFunc = (
  list: number[],
  comp: (i1: number, i2: number) => Promise<boolean>,
  swap: (i1: number, i2: number) => void
) => Promise<void>

const wait = async (ms: number) =>
  await new Promise((res) => setTimeout(res, ms))

export const wrap = (func: SortFunc) => async (
  input: number[],
  compsPerSec: number,
  cb: (s: Step[]) => void
): Promise<number[]> => {
  const list = [...input]

  let steps: Step[] = []
  let lastSend = -Infinity
  let comps = 0
  const start = performance.now()

  const comp = async (i1: number, i2: number) => {
    comps++
    await sync()
    steps.push([StepType.LOOK, i1, i2])
    return list[i1] > list[i2]
  }

  const swap = (i1: number, i2: number) => {
    const tmp = list[i1]
    list[i1] = list[i2]
    list[i2] = tmp
    steps.push([StepType.SWAP, i1, i2])
  }

  const sync = async () => {
    const now = performance.now()
    if (now - lastSend >= minSendDelay) {
      cb(steps)
      steps = []
      lastSend = now
    }
    let diff = (1000 / compsPerSec) * comps - (now - start)
    if (comps <= 1) diff = Math.max(diff, 1000 / compsPerSec)
    if (diff > 0) await wait(diff)
  }

  await func(list, comp, swap)

  steps.push([StepType.DONE])
  cb(steps)

  return list
}
