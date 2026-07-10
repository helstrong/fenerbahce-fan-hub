/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_FOOTBALL_KEY?: string
  readonly VITE_API_FOOTBALL_BASE?: string
  readonly VITE_LEAGUE_ID?: string
  readonly VITE_SEASON?: string
  readonly VITE_TEAM_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
