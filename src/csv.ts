import type { AppData } from './types'
import { LIGHT_META, RED_FLAG_META } from './types'
import { currentWeek, elderLight } from './engine'

const esc = (v: string | number | undefined) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }

/** 去重稽核報表：個案以去識別化 ID 唯一，不重複計算 */
export function exportAudit(d: AppData) {
  const site = (id: string) => d.sites.find((s) => s.id === id)?.name ?? id
  const coach = (id: string) => d.coaches.find((c) => c.id === id)?.name ?? id
  const seen = new Set<string>()
  const rows: string[][] = [['=== CareLoop 去重稽核報表（個案以去識別化 ID 唯一） ===']]
  rows.push(['個案ID', '帳別', '據點', '教練', '年齡層', '性別', '個資同意書', '陪跑週次', '燈號', '燈號理由', '臨床紅旗', '紅旗派單狀態', '回訪次數', '最近回訪', '採買卡落地'])
  for (const e of d.elders) {
    if (seen.has(e.id)) continue
    seen.add(e.id)
    const v = elderLight(e, d.referrals)
    const refs = d.referrals.filter((r) => r.elderId === e.id)
    rows.push([e.id, e.ledger, site(e.siteId), coach(e.coachId), e.ageBand, e.gender, e.consent ? '已簽署' : '未簽署', String(currentWeek(e)), LIGHT_META[v.light].label, v.reasons.join('；'), e.redFlags.map((f) => RED_FLAG_META[f].label).join('；'), refs.map((r) => (r.status === 'signed' ? `已簽章(${r.signedBy})` : '待覆核')).join('；'), String(e.visits.length), e.visits.map((x) => x.date).sort().at(-1) ?? '', e.shoppingCard ? '是' : '否'])
  }
  rows.push([], ['=== 不重複服務人數 ===', String(seen.size)], [])
  rows.push(['=== 三板斧任務明細 ==='], ['日期', '據點', '教練', '任務', '含金定級', '燈號', '實得分'])
  for (const t of [...d.tasks].sort((a, b) => a.date.localeCompare(b.date))) rows.push([t.date, site(t.siteId), coach(t.coachId), t.title, String(t.tier), LIGHT_META[t.light].label, String(t.tier * (t.light === 'green' ? 1 : t.light === 'yellow' ? 0.5 : 0))])
  const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a'); a.href = url; a.download = `CareLoop稽核報表_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url)
}
