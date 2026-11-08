import type { AppData, Coach, CoachTask, Course, Elder, Light, RedFlag, Referral, Site } from './types'
import { FOOD_GROUPS, NEEDS } from './types'
import { addDays, mulberry32, today } from './utils'

export const SITES: Site[] = [
  { id: 's1', name: '虎尾惠眾醫事C', short: '虎尾惠眾', ledger: 'A', city: '雲林虎尾' },
  { id: 's2', name: '斗南惠宏醫事C', short: '斗南惠宏', ledger: 'A', city: '雲林斗南' },
  { id: 's3', name: '北斗安泰醫事C', short: '北斗安泰', ledger: 'A', city: '彰化北斗' },
  { id: 's4', name: '台中西屯示範館', short: '台中西屯', ledger: 'B', city: '台中西屯' },
]

export const COACHES: Coach[] = [
  { id: 'c1', name: '林雅芳', level: 'L3', siteId: 's1', color: '#f472b6' },
  { id: 'c2', name: '陳建宏', level: 'L3', siteId: 's2', color: '#a78bfa' },
  { id: 'c3', name: '黃淑玲', level: 'L2', siteId: 's1', color: '#38bdf8' },
  { id: 'c4', name: '張志豪', level: 'L2', siteId: 's2', color: '#fb923c' },
  { id: 'c5', name: '李佩珊', level: 'L2', siteId: 's3', color: '#34d399' },
  { id: 'c6', name: '王怡君', level: 'L1', siteId: 's1', color: '#facc15' },
  { id: 'c7', name: '吳承翰', level: 'L1', siteId: 's2', color: '#60a5fa' },
  { id: 'c8', name: '劉欣怡', level: 'L1', siteId: 's3', color: '#2dd4bf' },
  { id: 'c9', name: '蔡宜庭', level: 'L1', siteId: 's4', color: '#c084fc' },
  { id: 'c10', name: '鄭柏宇', level: 'L0', siteId: 's3', color: '#f87171' },
  { id: 'c11', name: '許家瑜', level: 'L2', siteId: 's4', color: '#4ade80' },
]

export const L3_SUPERVISORS = ['林雅芳 藥師（惠生藥局）', '陳建宏 營養師（惠生藥局）']

const GOALS = ['每天吃到 2 份蛋白質（蛋＋豆腐）', '每週 3 天喝 1 杯牛奶或優格', '每餐先吃半碗深綠蔬菜', '每天吃 1 份水果、少喝含糖飲料', '每週 vovoball 出席 2 次並記錄', '晚餐加 1 份魚或肉、避免只吃稀飯']
const NOTES = ['電話回訪：本週有照冰箱表買菜，蛋每天都有吃。', '到宅回訪：家人協助補貨牛奶，長輩表示胃口變好。', '據點回訪：vovoball 投擲穩定，分享早餐有加蛋。', '電話回訪：本週身體不適少吃，提醒先以吃得下為主。', '健康聯絡簿：女兒回報已改用無糖豆漿。', '回訪：仍以稀飯為主，鼓勵加入豆腐或魚。']
const VISIT_WEEKS = [1, 4, 8, 12]

type Profile = { attend: number; food: number; protein: number }
const PROFILES: Profile[] = [
  { attend: 0.92, food: 0.85, protein: 0.9 },
  { attend: 0.8, food: 0.7, protein: 0.75 },
  { attend: 0.6, food: 0.5, protein: 0.5 },
]

function makeElder(rng: () => number, idx: number, site: Site, coachId: string, weeksIn: number, profile: Profile, opts: Partial<Elder> = {}): Elder {
  const enrolledAt = addDays(today(), -(weeksIn * 7 + Math.floor(rng() * 5)))
  const foodLog = Array.from({ length: 12 }, (_, w) =>
    FOOD_GROUPS.map((_, g) => {
      if (w > weeksIn) return false
      const p = [1, 2, 3, 4].includes(g) ? profile.protein : g === 5 ? profile.food - 0.15 : profile.food
      return rng() < p
    }),
  )
  const vovoAttend = Array.from({ length: 12 }, (_, w) => w <= weeksIn && rng() < profile.attend)
  const vovoAccuracy = vovoAttend.map((a) => (a ? 55 + Math.floor(rng() * 40) : 0))
  const visits = VISIT_WEEKS.filter((w) => w <= weeksIn).map((w) => ({ week: w, date: addDays(enrolledAt, (w - 1) * 7 + 2), note: NOTES[Math.floor(rng() * NOTES.length)], behaviorChange: rng() < profile.food }))
  // 確保最近 7 天內有一次回訪（除非刻意製造逾期）
  if (!opts.visits) visits.push({ week: weeksIn, date: addDays(today(), -Math.floor(rng() * 6)), note: NOTES[Math.floor(rng() * NOTES.length)], behaviorChange: rng() < profile.food })
  const needs = Object.fromEntries(NEEDS.map((n) => [n, rng() < 0.5])) as Elder['needs']
  needs[NEEDS[1]] = true
  return {
    id: `HC-2026-${String(idx).padStart(3, '0')}`,
    siteId: site.id,
    coachId,
    ledger: site.ledger,
    ageBand: ['65-69', '70-74', '75-79', '80-84', '85+'][Math.floor(rng() * 5)],
    gender: rng() < 0.62 ? '女' : '男',
    consent: true,
    needs,
    goal: GOALS[Math.floor(rng() * GOALS.length)],
    foodLog,
    vovoAttend,
    vovoAccuracy,
    visits,
    redFlags: [],
    enrolledAt,
    shoppingCard: rng() < 0.7,
    ...opts,
  }
}

const BREAKTHROUGH = ['完成 M01 需求卡＋家庭補貨採買卡落地（3 戶）', '第 8 週健康聯絡簿確認實質行為改變（加蛋＋牛奶）', '精準辨識腎臟病紅旗並轉介惠生藥局藥師', '第 12 週結案回訪：長輩蛋白質來源由 1 類提升至 3 類', '完成需求卡並建立單一健康目標（5 位長輩）', '第 4 週聯絡簿回訪：家屬完成冰箱補貨與十食物群勾選']
const COURSE = ['辦理 100 元餐盤夾夾樂團體課並完成簽到', '辦理營養自助餐體驗課（簽到 42 人）', '大安早餐之旅桌遊團體課並完成簽到', 'vovoball 地板滾球團練（出席登錄）', '十食物群冰箱紀錄表教學課（簽到）']
const MISC = ['發放營養宣導傳單 200 份', '活動人次登錄（無留存名單）', '冰箱紀錄表僅打勾、未回訪回饋', '據點海報張貼與場地整理', '轉傳 LINE 群組健康貼文']

export function buildDemo(): AppData {
  const rng = mulberry32(20261108)
  const elders: Elder[] = []
  const referrals: Referral[] = []
  const aSites = SITES.filter((s) => s.ledger === 'A')
  const quota = [36, 33, 32] // 101 位不重複親愛的長輩
  let idx = 1
  aSites.forEach((site, si) => {
    const coaches = COACHES.filter((c) => c.siteId === site.id && c.level !== 'L3')
    for (let i = 0; i < quota[si]; i++) {
      const coach = coaches[i % coaches.length]
      const weeksIn = 6 + Math.floor(rng() * 7) // 6-12 週
      const profile = PROFILES[rng() < 0.45 ? 0 : rng() < 0.7 ? 1 : 2]
      elders.push(makeElder(rng, idx++, site, coach.id, weeksIn, profile))
    }
  })
  // 3 位尚未回訪（101 人中 98 位完成回訪 → 97.0%）
  for (const k of [7, 44, 83]) elders[k].visits = []
  // 2 位未簽署個資同意書
  elders[12].consent = false
  elders[61].consent = false
  // 紅旗案例：5 已簽章、2 待覆核、1 未轉介
  const flagged: [number, RedFlag, 'signed' | 'pending' | 'none'][] = [
    [2, 'ckd', 'signed'], [19, 'polypharmacy', 'signed'], [37, 'dysphagia', 'signed'], [55, 'weightloss', 'signed'], [70, 'ckd', 'signed'],
    [25, 'polypharmacy', 'pending'], [66, 'dysphagia', 'pending'], [90, 'ckd', 'none'],
  ]
  flagged.forEach(([k, flag, st], n) => {
    const e = elders[k]
    e.redFlags = [flag]
    if (st === 'none') return
    referrals.push({
      id: `RF-${String(n + 1).padStart(3, '0')}`,
      elderId: e.id,
      flag,
      coachId: e.coachId,
      createdAt: addDays(today(), -(3 + n * 2)) + 'T10:20:00',
      status: st,
      ...(st === 'signed' ? { signedBy: n % 2 ? L3_SUPERVISORS[1] : L3_SUPERVISORS[0], signedAt: addDays(today(), -(2 + n * 2)) + 'T15:00:00', decision: flag === 'ckd' ? '限蛋白 0.8g/kg、限鉀磷；停用高蛋白補充品，改由營養師設計餐單。' : flag === 'polypharmacy' ? '確認 3 項保健品與抗凝血劑交互作用，建議停用魚油；轉回診。' : flag === 'dysphagia' ? '建議質地調整（IDDSI 5 級）並轉語言治療評估。' : '轉診家醫科排除惡性與營養不良，暫停減重相關建議。' } : {}),
    })
  })
  // B 帳：台中西屯示範館 12 位
  const bSite = SITES[3]
  const bCoaches = COACHES.filter((c) => c.siteId === 's4')
  for (let i = 0; i < 12; i++) elders.push(makeElder(rng, 200 + i, bSite, bCoaches[i % bCoaches.length].id, 2 + Math.floor(rng() * 5), PROFILES[Math.floor(rng() * 3)]))

  // 三板斧任務（近 30 天）
  const tasks: CoachTask[] = []
  const lightBy = (p: number): Light => { const x = rng(); return x < p ? 'green' : x < p + (1 - p) * 0.6 ? 'yellow' : 'red' }
  const coachQuality: Record<string, { bt: number; green: number }> = { c1: { bt: 0.55, green: 0.85 }, c2: { bt: 0.5, green: 0.8 }, c3: { bt: 0.45, green: 0.75 }, c4: { bt: 0.35, green: 0.65 }, c5: { bt: 0.4, green: 0.7 }, c6: { bt: 0.3, green: 0.6 }, c7: { bt: 0.2, green: 0.55 }, c8: { bt: 0.25, green: 0.6 }, c9: { bt: 0.3, green: 0.6 }, c10: { bt: 0.1, green: 0.4 }, c11: { bt: 0.45, green: 0.7 } }
  let tid = 1
  for (const c of COACHES) {
    const q = coachQuality[c.id]
    const n = c.level === 'L0' ? 8 : 14
    for (let i = 0; i < n; i++) {
      const r = rng()
      const kind: CoachTask['kind'] = r < q.bt ? 'breakthrough' : r < q.bt + 0.35 ? 'course' : 'misc'
      const pool = kind === 'breakthrough' ? BREAKTHROUGH : kind === 'course' ? COURSE : MISC
      tasks.push({ id: `T-${tid++}`, coachId: c.id, siteId: c.siteId, date: addDays(today(), -Math.floor(rng() * 28)), title: pool[Math.floor(rng() * pool.length)], tier: kind === 'breakthrough' ? 100 : kind === 'course' ? 50 : 10, light: lightBy(q.green), kind })
    }
  }

  // A 帳課程：12 場 575 人次 ＋ 宣導 2 場 250 人次 ＋ 共識營 47 人
  const courseN = [52, 48, 45, 50, 47, 49, 46, 51, 44, 48, 47, 48]
  const courseT = ['100 元餐盤夾夾樂', '營養自助餐體驗', '大安早餐之旅桌遊', 'vovoball 地板滾球團練', '十食物群冰箱紀錄表教學', '吃得下吃得夠：長輩蛋白質課']
  const courses: Course[] = courseN.map((n, i) => ({ id: `K-${i + 1}`, siteId: aSites[i % 3].id, date: addDays(today(), -(100 - i * 7)), title: courseT[i % courseT.length], kind: '課程', attendees: n }))
  courses.push({ id: 'K-13', siteId: 's1', date: addDays(today(), -95), title: '社區營養宣導（虎尾）', kind: '宣導', attendees: 130 })
  courses.push({ id: 'K-14', siteId: 's3', date: addDays(today(), -60), title: '社區營養宣導（北斗）', kind: '宣導', attendees: 120 })
  courses.push({ id: 'K-15', siteId: 's2', date: addDays(today(), -110), title: 'HEALTH Coach 共識營（L0-L3 培訓）', kind: '共識營', attendees: 47 })

  return { sites: SITES, coaches: COACHES, elders, referrals, tasks, courses }
}

/** C 帳：116 年萬海案規劃草案（提案規劃非已執行） */
export const PLAN_C = { budget: 800000, tools: 80, enroll: 60, weeks: 12, sites: ['虎尾惠眾醫事C', '斗南惠宏醫事C', '北斗安泰醫事C'], milestones: ['M1 共識營與教練培訓（L0→L1）', 'M2 80 位長輩領取十食物群工具包', 'M3 60 位進入 12 週陪跑（需求卡→採買卡）', 'M4 4/8/12 週健康聯絡簿回訪', 'M5 紅旗轉介與結案報告'] }

/** B 帳：門市阿米巴賽馬 */
export const AMOEBA_STORES = [
  { name: '惠生藥局 虎尾店', members: 128, loops: 46, revenue: 186000, referrals: 9 },
  { name: '惠生藥局 斗南店', members: 102, loops: 38, revenue: 152000, referrals: 7 },
  { name: '惠生藥局 北斗店', members: 96, loops: 31, revenue: 121000, referrals: 5 },
  { name: '台中西屯示範館', members: 41, loops: 12, revenue: 68000, referrals: 2 },
]
