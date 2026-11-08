import type { Coach, CoachTask, Elder, Light, Referral, Site, Tier } from './types'
import { FOOD_GROUPS, LIGHT_RATE, RED_FLAG_META } from './types'
import { addDays, daysBetween, today } from './utils'

/** 目前陪跑週次（1-12） */
export const currentWeek = (e: Elder) => Math.max(1, Math.min(12, Math.floor(daysBetween(e.enrolledAt, today()) / 7) + 1))

export const PROTEIN_IDX = [1, 2, 3, 4] // 豆製品、魚海鮮、蛋、肉
export const CALCIUM_IDX = [5] // 乳品

export interface LightVerdict { light: Light; reasons: string[]; locked: boolean; locks: string[] }

/** AI 自動紅黃綠燈判讀（親愛的長輩） */
export function elderLight(e: Elder, referrals: Referral[]): LightVerdict {
  const reasons: string[] = []
  const locks: string[] = []
  const mine = referrals.filter((r) => r.elderId === e.id)
  // 紅燈條件
  if (!e.consent) reasons.push('未簽署個資同意書（資料未授權）')
  for (const f of e.redFlags) {
    const ref = mine.find((r) => r.flag === f)
    locks.push(RED_FLAG_META[f].lock)
    if (!ref) reasons.push(`臨床紅旗「${RED_FLAG_META[f].label.slice(2)}」尚未轉介惠生藥局藥師／營養師`)
    else if (ref.status === 'pending') reasons.push(`紅旗派單待 L3 督導覆核簽章（${RED_FLAG_META[f].label.slice(0, 1)}）`)
  }
  const lastVisit = e.visits.length ? e.visits.map((v) => v.date).sort().at(-1)! : null
  const sinceVisit = lastVisit ? daysBetween(lastVisit, today()) : daysBetween(e.enrolledAt, today())
  if (sinceVisit > 7) reasons.push(`超過 7 天未回訪（已 ${sinceVisit} 天）`)
  if (reasons.length) return { light: 'red', reasons, locked: e.redFlags.length > 0, locks }

  // 黃燈條件
  const wk = currentWeek(e)
  const row = e.foodLog[wk - 1] ?? []
  const checked = row.filter(Boolean).length
  if (checked === 0) reasons.push(`第 ${wk} 週十食物群冰箱紀錄尚未回填`)
  else if (checked < 5) reasons.push(`第 ${wk} 週僅勾選 ${checked}/10 食物群，紀錄缺漏`)
  const protein = PROTEIN_IDX.filter((i) => row[i]).length
  if (checked > 0 && protein <= 1) reasons.push('蛋白質來源多樣性不足（豆魚蛋肉僅 ' + protein + ' 類）')
  if (checked > 0 && !CALCIUM_IDX.some((i) => row[i])) reasons.push('本週缺乳品（鈣質）攝取紀錄')
  const recent = e.vovoAttend.slice(Math.max(0, wk - 4), wk)
  const missed = recent.filter((a) => !a).length
  if (recent.length >= 3 && missed >= 2) reasons.push(`vovoball 近 ${recent.length} 週缺席 ${missed} 次，出席波動`)
  if (reasons.length) return { light: 'yellow', reasons, locked: e.redFlags.length > 0, locks }

  return {
    light: 'green',
    reasons: ['vovoball 穩定出席', '冰箱紀錄表與健康聯絡簿按週回填', e.redFlags.length ? '紅旗已完成藥師／營養師覆核' : '無未處理紅旗'],
    locked: e.redFlags.length > 0,
    locks,
  }
}

/** 飲食缺口分析：12 週內各食物群勾選率 */
export function foodGap(e: Elder) {
  const wk = currentWeek(e)
  return FOOD_GROUPS.map((g, i) => {
    const n = e.foodLog.slice(0, wk).filter((r) => r[i]).length
    return { group: g, rate: Math.round((n / wk) * 100) }
  })
}

export const earned = (t: CoachTask) => t.tier * LIGHT_RATE[t.light]

export interface RaceRow {
  id: string
  name: string
  sub: string
  level?: string
  green: number
  yellow: number
  red: number
  total: number
  rate: number
  gold: number
  goldRate: number
  elders: number
  redElders: number
}

const agg = (tasks: CoachTask[]) => {
  const green = tasks.filter((t) => t.light === 'green').length
  const yellow = tasks.filter((t) => t.light === 'yellow').length
  const red = tasks.filter((t) => t.light === 'red').length
  const total = green + yellow + red
  const gold = tasks.reduce((n, t) => n + earned(t), 0)
  return { green, yellow, red, total, rate: total ? Math.round((green / total) * 100) : 0, gold, goldRate: total ? Math.round((gold / (total * 100)) * 100) : 0 }
}

export function siteRows(sites: Site[], coaches: Coach[], tasks: CoachTask[], elders: Elder[], referrals: Referral[], month: string): RaceRow[] {
  return sites.map((s) => {
    const mine = tasks.filter((t) => t.siteId === s.id && (month === 'last30' ? t.date >= addDays(today(), -29) : t.date.startsWith(month)))
    const es = elders.filter((e) => e.siteId === s.id)
    return { id: s.id, name: s.name, sub: `${s.city} ‧ ${coaches.filter((c) => c.siteId === s.id).length} 位教練`, ...agg(mine), elders: es.length, redElders: es.filter((e) => elderLight(e, referrals).light === 'red').length }
  }).sort((a, b) => b.goldRate - a.goldRate || b.green - a.green)
}

export function coachRows(coaches: Coach[], sites: Site[], tasks: CoachTask[], elders: Elder[], referrals: Referral[], month: string): RaceRow[] {
  return coaches.map((c) => {
    const mine = tasks.filter((t) => t.coachId === c.id && (month === 'last30' ? t.date >= addDays(today(), -29) : t.date.startsWith(month)))
    const es = elders.filter((e) => e.coachId === c.id)
    return { id: c.id, name: c.name, sub: sites.find((s) => s.id === c.siteId)?.short ?? '', level: c.level, ...agg(mine), elders: es.length, redElders: es.filter((e) => elderLight(e, referrals).light === 'red').length }
  }).sort((a, b) => b.goldRate - a.goldRate || b.green - a.green)
}

/** AI 給三代接班人的據點經營與授權評估建議（規則生成） */
export function siteAdvice(r: RaceRow): string {
  if (r.total === 0) return '本月尚無任務紀錄，建議先導入三板斧日清填報，再評估授權。'
  if (r.goldRate >= 60 && r.rate >= 70 && r.redElders === 0) return `含金量 ${r.goldRate}%、綠燈率 ${r.rate}%，長輩零紅燈：已達「可對外授權示範據點」標準，建議列為 B 端授權樣板並安排 L2→L3 培訓。`
  if (r.goldRate >= 60) return `含金量 ${r.goldRate}% 高但仍有 ${r.redElders} 位長輩紅燈：破局力強、回訪紀律待補，建議督導每週檢視 7 天未回訪名單後再談授權。`
  if (r.rate >= 70 && r.goldRate < 40) return `綠燈率 ${r.rate}% 但含金量僅 ${r.goldRate}%：多為發傳單／純人次活動，建議把資源轉向需求卡＋採買卡落地與 12 週聯絡簿，暫不擴點。`
  if (r.redElders >= 3) return `紅燈長輩 ${r.redElders} 位、含金量 ${r.goldRate}%：風險處理與回訪皆落後，建議 L3 督導進駐一個月並暫停新收案。`
  return `含金量 ${r.goldRate}%、綠燈率 ${r.rate}%：屬日常維運型據點，建議增加紅旗精準轉介與家庭採買卡落地任務以拉高含金量。`
}

export const tierOfKind = (kind: CoachTask['kind']): Tier => (kind === 'breakthrough' ? 100 : kind === 'course' ? 50 : 10)
