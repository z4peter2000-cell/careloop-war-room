export type Light = 'green' | 'yellow' | 'red'
export type Role = 'owner' | 'l3' | 'coach'
export type Ledger = 'A' | 'C' | 'B'
export type Tier = 100 | 50 | 10
export type CoachLevel = 'L0' | 'L1' | 'L2' | 'L3'
export type RedFlag = 'ckd' | 'dysphagia' | 'weightloss' | 'polypharmacy'

export const ROLE_META: Record<Role, { label: string; short: string; desc: string }> = {
  owner: { label: '👑 三代接班人（總部全權限）', short: '三代接班人', desc: '三代接班人總控戰情室 ‧ 三本帳、授權試算、全據點排行' },
  l3: { label: '🩺 L3 藥師／營養師督導', short: 'L3 督導', desc: '惠生藥局紅旗審核與處方分流工作台' },
  coach: { label: '🏃 L1/L2 HEALTH Coach', short: 'HEALTH Coach', desc: '據點陪伴、回訪填報、十食物群冰箱紀錄' },
}

export const LEDGER_META: Record<Ledger, { label: string; short: string; badge: string; tone: string }> = {
  A: { label: 'A帳：115年國健署實績基線', short: 'A帳 115年實績', badge: '已執行實績', tone: 'teal' },
  C: { label: 'C帳：116年萬海案規劃草案', short: 'C帳 116年草案', badge: '提案規劃非已執行', tone: 'amber' },
  B: { label: 'B帳：B端商業授權與門市阿米巴賽馬', short: 'B帳 商業授權', badge: '商業分帳', tone: 'violet' },
}

export const RED_FLAG_META: Record<RedFlag, { label: string; lock: string }> = {
  ckd: { label: '① 腎臟病／洗腎（限蛋白／鉀／磷／水）', lock: '禁止給出通用高蛋白或固定飲水量建議' },
  dysphagia: { label: '② 吞嚥困難／嗆咳', lock: '禁止建議一般質地飲食，需語言治療／營養師評估質地' },
  weightloss: { label: '③ 不明原因快速體重下降／跌倒', lock: '禁止自行調整熱量或運動強度，需醫療評估' },
  polypharmacy: { label: '④ 多重用藥與保健品交互作用疑慮', lock: '禁止推銷或建議任何商業保健品，需藥師覆核' },
}

export const FOOD_GROUPS = ['全穀雜糧', '豆製品', '魚海鮮', '蛋', '肉', '乳品', '深綠蔬菜', '其他有色蔬菜及蕈菇', '水果', '堅果種子'] as const
export const NEEDS = ['吃得下', '吃得夠', '吃得對', '吃得巧'] as const

export const LIGHT_META: Record<Light, { label: string; desc: string }> = {
  green: { label: '綠燈', desc: '目標已追蹤且證據完整' },
  yellow: { label: '黃燈', desc: '本週待追蹤／紀錄缺漏' },
  red: { label: '紅燈', desc: '風險未處理／資料未授權／未回訪' },
}
export const LIGHT_RATE: Record<Light, number> = { green: 1, yellow: 0.5, red: 0 }
export const TIER_META: Record<Tier, { short: string; label: string; cls: string }> = {
  100: { short: '🔥100', label: '高含金 ‧ 主動破局', cls: 'bg-orange-500/15 text-orange-600 border-orange-500/40 dark:text-orange-300' },
  50: { short: '🌱50', label: '中含金 ‧ 日常維運', cls: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40 dark:text-emerald-300' },
  10: { short: '💧10', label: '低含金 ‧ 湊數瑣事', cls: 'bg-sky-500/15 text-sky-600 border-sky-500/40 dark:text-sky-300' },
}

export interface Site { id: string; name: string; short: string; ledger: Ledger; city: string }
export interface Coach { id: string; name: string; level: CoachLevel; siteId: string; color: string }

export interface Visit { week: number; date: string; note: string; behaviorChange: boolean }

export interface Elder {
  id: string // HC-2026-001（去識別化）
  siteId: string
  coachId: string
  ledger: Ledger
  ageBand: string
  gender: '男' | '女'
  consent: boolean
  needs: Record<(typeof NEEDS)[number], boolean>
  goal: string
  /** 12 週 × 10 食物群 */
  foodLog: boolean[][]
  /** 12 週 vovoball 出席 */
  vovoAttend: boolean[]
  /** 12 週 vovoball 精準度 0-100（未出席為 0） */
  vovoAccuracy: number[]
  visits: Visit[]
  redFlags: RedFlag[]
  enrolledAt: string
  /** 家庭補貨採買卡已落地 */
  shoppingCard: boolean
}

export interface Referral {
  id: string
  elderId: string
  flag: RedFlag
  coachId: string
  createdAt: string
  status: 'pending' | 'signed'
  signedBy?: string
  signedAt?: string
  decision?: string
}

/** 教練／據點三板斧任務（拿結果） */
export interface CoachTask {
  id: string
  coachId: string
  siteId: string
  date: string
  title: string
  tier: Tier
  light: Light
  kind: 'breakthrough' | 'course' | 'misc'
}

export interface Course { id: string; siteId: string; date: string; title: string; kind: '課程' | '宣導' | '共識營'; attendees: number }

export interface AppData {
  sites: Site[]
  coaches: Coach[]
  elders: Elder[]
  referrals: Referral[]
  tasks: CoachTask[]
  courses: Course[]
}
