import * as render from './render'
import { wrap } from 'comlink'
import type { api } from './worker'
import { setList } from './list'

const worker = wrap<typeof api>(new Worker('./worker.ts'))

window.onclick = async () => {
  setList(await worker.init(100))
  render.start()
  render.stop()
}
