import { Download, Moon, RotateCcw, Sun } from 'lucide-react'
import type { Store } from '../store'
import type { Ledger, Role } from '../types'
import { LEDGER_META, ROLE_META } from '../types'
import { exportAudit } from '../csv'
import { Avatar } from './ui'

export function TopNav({ store }: { store: Store }) {
  const { ui, setUi, data } = store
  const coaches = data.coaches.filter((c) => c.level !== 'L3')
  const ledgerCls: Record<Ledger, string> = { A: 'bg-teal-600 text-white shadow-glow-teal', C: 'bg-amber-500 text-slate-900', B: 'bg-violet-600 text-white' }
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-[#06111a]/85">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-lg font-black text-white shadow-glow-teal">C</div>
          <div>
            <h1 className="text-base font-black leading-tight md:text-lg">CareLoop 三板斧 AI 雙引擎戰情室</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">惠生藥局 × 宇勝生技 × 作惠協會 ‧ vovoball 肌力 × HEALTH Coach 營養陪跑 ‧ {ui.role === 'owner' ? '三代接班人總控戰情室' : ROLE_META[ui.role].desc}</p>
          </div>
        </div>

        {/* 三本帳切換器 */}
        <div className="flex overflow-hidden rounded-xl border border-slate-300 text-xs font-bold dark:border-white/15">
          {(['A', 'C', 'B'] as Ledger[]).map((l) => (
            <button key={l} onClick={() => setUi({ ...ui, ledger: l })} className={`px-3 py-2 transition ${ui.ledger === l ? ledgerCls[l] : 'hover:bg-slate-100 dark:hover:bg-white/10'}`} title={LEDGER_META[l].label}>
              {LEDGER_META[l].short}
            </button>
          ))}
        </div>

        {/* RBAC 角色切換 */}
        <div className="flex items-center gap-2">
          <select className="input !w-auto !py-1.5 text-xs font-semibold" value={ui.role} onChange={(e) => setUi({ ...ui, role: e.target.value as Role })} aria-label="角色視角切換">
            {(Object.keys(ROLE_META) as Role[]).map((r) => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
          </select>
          {ui.role === 'coach' && (
            <select className="input !w-auto !py-1.5 text-xs" value={ui.coachId} onChange={(e) => setUi({ ...ui, coachId: e.target.value })} aria-label="教練身分">
              {coaches.map((c) => <option key={c.id} value={c.id}>{c.level} {c.name}（{data.sites.find((s) => s.id === c.siteId)?.short}）</option>)}
            </select>
          )}
          {ui.role === 'coach' && (() => { const c = coaches.find((x) => x.id === ui.coachId); return c ? <Avatar name={c.name} color={c.color} size="sm" /> : null })()}
          {ui.role !== 'coach' && <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => exportAudit(data)} title="匯出去重稽核 CSV"><Download className="h-4 w-4" /> 稽核 CSV</button>}
          <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => confirm('重設為示範資料？') && store.resetDemo()} title="重設示範資料"><RotateCcw className="h-4 w-4" /></button>
          <button className="btn-ghost !px-2.5 !py-1.5" onClick={() => setUi({ ...ui, theme: ui.theme === 'dark' ? 'light' : 'dark' })} aria-label="切換主題">{ui.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
        </div>
      </div>
    </header>
  )
}
