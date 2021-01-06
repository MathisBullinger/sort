import * as render from './render'
import { wrap, proxy } from 'comlink'
import * as list from './list'
import type { api, Step } from './worker'
import * as Tone from 'tone'

const worker = wrap<typeof api>(new Worker('./worker.ts'))

const LOOK = 0
const SWAP = 1
const DONE = 2

window.onclick = async () => {
  await Tone.start()
  const s1 = new Tone.Synth().toDestination()
  const s2 = new Tone.Synth().toDestination()

  s1.volume.value = -8
  s2.volume.value = -8

  const fMin = 80
  const fMax = 500

  const step = (steps: Step[]) => {
    let l1: number | undefined = undefined
    let l2: number | undefined = undefined
    for (const step of steps) {
      switch (step[0]) {
        case LOOK:
          list.look.push([step[1], step[2]])
          l1 = list.list[step[1]]
          l2 = list.list[step[2]]
          break
        case SWAP:
          list.swap(step[1], step[2])
          break
        case DONE:
          render.stop()
          s1.triggerRelease()
          s2.triggerRelease()
          break
      }
    }
    if (l1 && l2) {
      const [f1, f2] = [l1, l2].map(
        (n) => (n / list.list.length) * (fMax - fMin) + fMin
      )
      if (s1.frequency.value !== f1) {
        s1.triggerRelease()
        s1.triggerAttack(f1)
      }
      if (s2.frequency.value !== f2) {
        s2.triggerRelease()
        s2.triggerAttack(f2)
      }
    }
  }

  list.clearLook()
  list.set(await worker.init(10, proxy(step)))
  render.start()
}
