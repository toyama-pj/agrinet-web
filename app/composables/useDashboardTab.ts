export type DashboardTab = "dashboard" | "settings"
export type SettingTab = "account" | "namespace" | "handset" | "member"

export function useCurrentTab() {
  return useState<DashboardTab>(
    "dashboard-tab",
    () => "dashboard"
  )
}

export function useSelectedNamespace() {
  return useState<string | null>(
    "selected-namespace",
    () => null
  )
}

export function useSelectedSetting() {
  return useState<SettingTab | null>(
    "selected-setting",
    () => "account"
  )
}