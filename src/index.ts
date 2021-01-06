import * as render from './render'
import { wrap, proxy } from 'comlink'
import * as list from './list'
import type { api, Step } from './worker'

const worker = wrap<typeof api>(new Worker('./worker.ts'))

const LOOK = 0
const SWAP = 1
const DONE = 2

const step = (steps: Step[]) => {
  for (const step of steps) {
    switch (step[0]) {
      case LOOK:
        list.look.push([step[1], step[2]])
        break
      case SWAP:
        list.swap(step[1], step[2])
        break
      case DONE:
        render.stop()
        break
    }
  }
}

window.onclick = async () => {
  list.clearLook()
  list.set(await worker.init(100, proxy(step)))
  render.start()
}
