import { list, look, clearLook } from './list'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const ctx = canvas.getContext('2d')!

canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio

let running = false

let looked = new Set<number>()

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const w = canvas.width / list.length
  const rw = Math.ceil(w)

  if (look.length) {
    looked = new Set()
    for (const [i1, i2] of look) {
      looked.add(i1)
      looked.add(i2)
    }
    clearLook()
  }
  if (!running) looked = new Set()

  for (let i = 0; i < list.length; i++) {
    ctx.fillStyle = looked.has(i) ? '#faa' : '#ddd'
    const h = (list[i] / list.length) * canvas.height
    ctx.fillRect((i * w) | 0, canvas.height - h, rw, h)
  }

  if (running) requestAnimationFrame(render)
}

export const start = () => {
  looked = new Set()
  running = true
  render()
}

export const stop = () => {
  running = false
}
