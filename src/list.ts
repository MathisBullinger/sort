export let list: number[] = []
export let look: number[] = []

export const set = (v: number[]) => {
  list = v
}

export const swap = (i1: number, i2: number) => {
  const tmp = list[i1]
  list[i1] = list[i2]
  list[i2] = tmp
}

export const clearLook = () => {
  look = []
}
