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

export const quick = wrap(async (list, { swap, read }) => {
  await quick(0, list.length - 1)

  async function quick(lo: number, hi: number) {
    if (lo >= hi || lo < 0) return
    const p = await partition(lo, hi)
    await quick(lo, p - 1)
    await quick(p + 1, hi)
  }

  async function partition(lo: number, hi: number) {
    const pivot = await read(hi)
    let i = lo - 1
    for (let j = lo; j < hi; j++) if ((await read(j)) <= pivot) swap(++i, j)
    swap(++i, hi)
    return i
  }
})

export const bogo = wrap(async (list, { swap, comp }) => {
  const sorted = () => {
    for (let i = 1; i < list.length; i++)
      if (list[i - 1] > list[i]) return false
    return true
  }

  const randomIndex = (exclude?: number) => {
    while (true) {
      const index = Math.floor(Math.random() * list.length)
      if (index !== exclude) return index
    }
  }

  while (!sorted()) {
    const a = randomIndex()
    const b = randomIndex(a)
    if (await comp(a, b)) swap(a, b)
  }
})

export const slow = wrap(async (list, { comp, swap }) => {
  await slowSort(0, list.length - 1)

  async function slowSort(i: number, j: number) {
    if (i >= j) return
    const m = Math.floor((i + j) / 2)
    await slowSort(i, m)
    await slowSort(m + 1, j)
    if ((await comp(m, j)) && list[m] !== list[j]) swap(j, m)
    await slowSort(i, j - 1)
  }
})
