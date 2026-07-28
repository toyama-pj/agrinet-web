export interface TimeValue {
  time: number
  value: string
}

export interface TimeValueWithKey {
  key: string
  values: TimeValue[]
}

export interface KeyValueResponsePayload {
  data: TimeValueWithKey[]
  next_cursor?: string
}
