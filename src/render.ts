import { list } from './list'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const ctx = canvas.getContext('2d')!

canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio

let running = false

function render() {
  if (!running) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const w = canvas.width / list.length
  const rw = Math.ceil(w)

  ctx.fillStyle = '#fff'

  for (let i = 0; i < list.length; i++) {
    const h = (list[i] / list.length) * canvas.height
    ctx.fillRect((i * w) | 0, canvas.height - h, rw, h)
  }

  requestAnimationFrame(render)
}

export const start = () => {
  running = true
  render()
}

export const stop = () => {
  running = false
}
