export interface Device {
  id: string
  namespace_id: string
  name: string
  dev_eui: string
  dev_addr: string
  uplink_frame_counter: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface DeviceListResponse {
  data: Device[]
}

export interface AddDeviceForm {
  name: string
  dev_eui: string
  dev_addr: string
  app_s_key: string
  nwk_s_key: string
}