import * as render from './render'
import { wrap, proxy } from 'comlink'
import * as list from './list'
import type { api, ListType } from './worker'
import type { Step } from './sort/utils'
import * as Tone from 'tone'
import * as _sorts from './sort/algorithms'

const worker = wrap<typeof api>(new Worker('./worker.ts'))
type Algorithm = keyof typeof _sorts

const menu = document.getElementById('menu')!
const quote = document.querySelector('figure')!
const algSelect = document.querySelector<HTMLSelectElement>('#algorithm')!

const algorithms = Object.keys(_sorts) as Algorithm[]
for (const name of algorithms) {
  const opt = document.createElement('option')
  opt.textContent = name
  algSelect.appendChild(opt)
}

menu.onsubmit = (e) => {
  e.preventDefault()
  menu.toggleAttribute('hidden', true)
  quote.toggleAttribute('hidden', true)
  history.pushState(null, '', encodeParams())
  start(
    algSelect.value as Algorithm,
    parseInt(document.querySelector<HTMLInputElement>('#size')!.value),
    parseInt(document.querySelector<HTMLInputElement>('#reads')!.value),
    document.querySelector<HTMLSelectElement>('#list')!.value as ListType
  )
}

menu.onchange = () => {
  history.replaceState(null, '', encodeParams())
}

algSelect.addEventListener('change', () => {
  document.documentElement.dataset.algo = algSelect.value
})

window.addEventListener('popstate', (e) => {
  location.reload()
})

function encodeParams() {
  return `?${Object.entries({
    algorithm: algSelect.value,
    length: parseInt(document.querySelector<HTMLInputElement>('#size')!.value),
    rps: parseInt(document.querySelector<HTMLInputElement>('#reads')!.value),
    type: document.querySelector<HTMLSelectElement>('#list')!.value as ListType,
  })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')}`
}

const params = Object.fromEntries(
  location.search
    .replace(/^\?/, '')
    .split('&')
    .map((v) => v.split('=').map((s) => decodeURIComponent(s)))
)
if ('algorithm' in params) {
  algSelect.value = params.algorithm
  document.documentElement.dataset.algo = params.algorithm
}
if ('length' in params)
  document.querySelector<HTMLInputElement>('#size')!.value = params.length
if ('rps' in params)
  document.querySelector<HTMLInputElement>('#reads')!.value = params.rps
if ('type' in params)
  document.querySelector<HTMLInputElement>('#list')!.value = params.type

const READ = 0
const SWAP = 1
const SET = 2
const DONE = 3

const sound = true

const start = async (
  algorithm: Algorithm,
  size: number,
  rps: number,
  listType: ListType
) => {
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
        case READ:
          list.look.push(step[1], step[2])
          if (sound) {
            freqs.push(
              ...step
                .slice(1)
                .map(
                  (n) =>
                    (list.list[n] / list.list.length) * (fMax - fMin) + fMin
                )
            )
          }
          break
        case SWAP:
          list.swap(step[1], step[2])
          break
        case SET:
          list.list[step[1]] = step[2]
          break
        case DONE:
          render.stop()
          setTimeout(() => {
            synths.forEach((s) => s.triggerRelease())
          }, 100)
          break
      }
    }

    if (!sound) return
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
  list.set(await worker.init(algorithm, size, rps, listType, proxy(step)))
  render.start()
}
