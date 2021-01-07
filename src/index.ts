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

  const fMin = 80
  const fMax = 500

  const synths: Tone.Synth[] = []
  const getSynth = (i: number) => {
    while (synths.length <= i) {
      const synth = new Tone.Synth().toDestination()
      synth.volume.value = -12
      synths.push(synth)
    }
    return synths[i]
  }

  const step = (steps: Step[]) => {
    let freqs: number[] = []

    for (const step of steps) {
      switch (step[0]) {
        case LOOK:
          list.look.push([step[1], step[2]])
          freqs.push(
            ...step
              .slice(1)
              .map((n) => (n / list.list.length) * (fMax - fMin) + fMin)
          )
          break
        case SWAP:
          list.swap(step[1], step[2])
          break
        case DONE:
          render.stop()
          synths.forEach((s) => s.triggerRelease())
          break
      }
    }
    freqs.sort().reverse()

    for (let i = 0; i < freqs.length; i++) {
      const synth = getSynth(i)
      if (synth.frequency.value === freqs[i]) continue
      synth.triggerAttack(freqs[i])
    }
    for (let i = freqs.length; i < synths.length; i++)
      synths[i].triggerRelease()
  }

  list.clearLook()
  list.set(await worker.init(100, 5, proxy(step)))
  render.start()
}
