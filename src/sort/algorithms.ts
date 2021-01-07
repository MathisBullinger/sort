import { wrap } from './utils'

export const bubble = wrap(async (list, comp, swap) => {
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

export const insertion = wrap(async (list, comp, swap) => {
  for (let i = 1; i < list.length; i++) {
    let j = i - 1
    while (j >= 0 && (await comp(j, j + 1))) {
      swap(j + 1, j)
      j = j - 1
    }
  }
})
