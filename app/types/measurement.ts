export interface Measurement {
  id: string
  device_id: string
  namespace_id: string
  gateway_eui: string
  received_at: string
  gateway_time?: string | null
  frame_counter: number
  channel: number
  type: number
  name: string
  value: unknown
}

export interface MeasurementResponse {
  data: Measurement[]
}