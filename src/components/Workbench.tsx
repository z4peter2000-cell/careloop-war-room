import { useState } from 'react'
import { ClipboardCheck, Stethoscope } from 'lucide-react'
import type { Store } from '../store'
import { RED_FLAG_META } from '../types'
import { L3_SUPERVISORS } from '../demoData'

export function Workbench({ store }: { store: Store }) {
  const { data, signReferral } = store
  const [who, setWho] = useState(L3_SUPERVISORS[0])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const pending = data.referrals.filter((r) => r.status === 'pending')
  const signed = data.referrals.filter((r) => r.status === 'signed').slice(0, 6)
  const elder = (id: string) => data.elders.find((e) => e.id === id)
  const coach = (id: string) => data.coaches.find((c) => c.id === id)?.name ?? id
  const site = (id?: string) => data.sites.find((s) => s.id === id)?.short ?? ''
  return (
    <section className="card overflow-hidden border-pink-500/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-500/30 bg-gradient-to-r from-pink-900/70 via-slate-900 to-slate-900 px-5 py-3 text-white">
        <h2 className="flex items-center gap-2 font-black"><Stethoscope className="h-5 w-5 text-pink-300" /> 惠生藥局 L3 藥師／營養師督導工作台 <span className="chip border-pink-400/60 bg-pink-500/25 text-pink-200">{pending.length} 件待覆核</span></h2>
        <select className="input !w-auto !py-1 text-xs" value={who} onChange={(e) => setWho(e.target.value)} aria-label="簽章人">{L3_SUPERVISORS.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-bold text-red-500">🔴 待覆核派單（CareLoop 自動派單）</h3>
          <div className="space-y-2">
            {pending.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-emerald-500 dark:border-white/10">目前無待覆核紅旗，全數已分流。</p>}
            {pending.map((r) => { const e = elder(r.elderId); return (
              <div key={r.id} className="rounded-xl border border-red-500/50 bg-red-500/5 p-3 text-sm shadow-[0_0_14px_rgba(239,68,68,0.25)]">
                <div className="flex flex-wrap items-center gap-2"><b className="font-mono">{r.id}</b><span className="chip border-red-500/40 text-red-500">{RED_FLAG_META[r.flag].label}</span><span className="ml-auto text-[11px] text-slate-500">{r.createdAt.slice(0, 16).replace('T', ' ')}</span></div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">個案 <b className="font-mono">{r.elderId}</b> ‧ {site(e?.siteId)} ‧ 教練 {coach(r.coachId)} ‧ {e?.ageBand} {e?.gender} ‧ 目標：{e?.goal}</div>
                <div className="mt-1 rounded-lg bg-red-500/10 px-2 py-1 text-[11px] text-red-500">🔒 教練端已鎖定：{RED_FLAG_META[r.flag].lock}</div>
                <textarea className="input mt-2 min-h-[56px] text-xs" placeholder="專業覆核意見／處方分流決定（必填）" value={notes[r.id] ?? ''} onChange={(ev) => setNotes({ ...notes, [r.id]: ev.target.value })} />
                <div className="mt-2 flex justify-end"><button className="btn-primary !py-1.5 text-xs" disabled={!(notes[r.id] ?? '').trim()} onClick={() => signReferral(r.id, who, notes[r.id].trim())}><ClipboardCheck className="h-4 w-4" /> 覆核簽章並解除警戒</button></div>
              </div>
            ) })}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold text-emerald-500">✅ 已簽章分流紀錄（最近 6 筆）</h3>
          <div className="space-y-2">
            {signed.map((r) => (
              <div key={r.id} className="rounded-xl border border-emerald-500/30 p-3 text-xs">
                <div className="flex flex-wrap items-center gap-2"><b className="font-mono">{r.id}</b><span className="chip border-slate-400/40 text-slate-500">{RED_FLAG_META[r.flag].label.slice(0, 1)}</span><span className="font-mono">{r.elderId}</span><span className="ml-auto text-slate-500">{r.signedBy} ‧ {r.signedAt?.slice(0, 10)}</span></div>
                <div className="mt-1 text-slate-600 dark:text-slate-300">{r.decision}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
