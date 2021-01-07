import { list, look, clearLook } from './list'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const ctx = canvas.getContext('2d')!

canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio

let running = false
let lookedAt = new Set<number>()

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const w = canvas.width / list.length
  const rw = Math.ceil(w)

  if (look.length) {
    lookedAt = new Set()
    for (const i of look) {
      lookedAt.add(i)
    }
    clearLook()
  }
  if (!running) lookedAt = new Set()

  for (let i = 0; i < list.length; i++) {
    ctx.fillStyle = lookedAt.has(i) ? '#ff3d00' : '#f5f5f5'
    const h = (list[i] / list.length) * canvas.height
    ctx.fillRect((i * w) | 0, canvas.height - h, rw, h)
  }

  if (running) requestAnimationFrame(render)
}

export const start = () => {
  lookedAt = new Set()
  running = true
  render()
}

export const stop = () => {
  running = false
}
