interface R<T = any> {
  code: number
  msg: string
  data: T
}

interface List<T = any> {
  list: T[]
  total: number
}
