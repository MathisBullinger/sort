import { wrap } from './utils'

export const bubble = wrap(async (list, { comp, swap }) => {
  let swapped = false
  let n = 1
  do {
    swapped = false
    for (let i = 0; i < list.length - n; i++) {
      if (await comp(i, i + 1)) {
        swap(i, i + 1)
        swapped = true
      }
    }
    n++
  } while (swapped)
})

export const insertion = wrap(async (list, { comp, swap }) => {
  for (let i = 1; i < list.length; i++) {
    let j = i - 1
    while (j >= 0 && (await comp(j, j + 1))) {
      swap(j + 1, j)
      j = j - 1
    }
  }
})

export const selection = wrap(async (list, { comp, swap }) => {
  for (let i = 0; i < list.length - 1; i++) {
    let min = i
    for (let j = i + 1; j < list.length; j++) if (await comp(min, j)) min = j
    swap(min, i)
  }
})

export const shell = wrap(async (list, { read, set }) => {
  let gaps = [701, 301, 132, 57, 23, 10, 4, 1]
  while (gaps[0] < list.length) gaps.unshift((gaps[0] * 2.25) | 0)

  for (const gap of gaps) {
    for (let i = gap; i < list.length; i++) {
      const tmp = await read(i)
      let j: number
      for (j = i; j >= gap && (await read(j - gap)) > tmp; j -= gap) {
        set(j, await read(j - gap))
      }
      set(j, tmp)
    }
  }
})
