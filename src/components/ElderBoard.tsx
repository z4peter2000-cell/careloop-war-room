import { useMemo, useState } from 'react'
import { AlertOctagon, HeartPulse, Lock, PhoneCall, Search, Send } from 'lucide-react'
import type { Store } from '../store'
import type { Elder, Light, RedFlag } from '../types'
import { FOOD_GROUPS, LIGHT_META, NEEDS, RED_FLAG_META } from '../types'
import { currentWeek, elderLight, foodGap } from '../engine'
import { today, uid } from '../utils'
import { Lamp, lightBg, lightText } from './ui'

export function ElderBoard({ store, elders }: { store: Store; elders: Elder[] }) {
  const { data, ui, updateElder, addReferral } = store
  const [q, setQ] = useState('')
  const [lightF, setLightF] = useState<Light | ''>('')
  const [selId, setSelId] = useState<string>('')
  const [toast, setToast] = useState('')
  const [visitNote, setVisitNote] = useState('')

  const verdicts = useMemo(() => new Map(elders.map((e) => [e.id, elderLight(e, data.referrals)])), [elders, data.referrals])
  const list = elders.filter((e) => (!q || e.id.includes(q.toUpperCase())) && (!lightF || verdicts.get(e.id)!.light === lightF)).sort((a, b) => ({ red: 0, yellow: 1, green: 2 }[verdicts.get(a.id)!.light] - { red: 0, yellow: 1, green: 2 }[verdicts.get(b.id)!.light]) || a.id.localeCompare(b.id))
  const sel = elders.find((e) => e.id === selId) ?? list[0]
  const counts = { green: 0, yellow: 0, red: 0 }
  for (const e of elders) counts[verdicts.get(e.id)!.light]++

  const toggleFlag = (e: Elder, f: RedFlag) => {
    const has = e.redFlags.includes(f)
    if (has) return // 紅旗一旦勾選即鎖定，僅能由 L3 工作台處理
    updateElder(e.id, (x) => ({ ...x, redFlags: [...x.redFlags, f] }))
    const coachId = ui.role === 'coach' ? ui.coachId : e.coachId
    addReferral({ id: `RF-${uid().slice(0, 6).toUpperCase()}`, elderId: e.id, flag: f, coachId, createdAt: new Date().toISOString(), status: 'pending' })
    setToast(`🚨 ${e.id} 已標記紅燈（紅旗警戒）並鎖定通用建議，派單已推送至惠生藥局 L3 藥師／營養師督導工作台`)
    setTimeout(() => setToast(''), 6000)
  }
  const addVisit = (e: Elder) => {
    if (!visitNote.trim()) return
    updateElder(e.id, (x) => ({ ...x, visits: [...x.visits, { week: currentWeek(x), date: today(), note: visitNote.trim(), behaviorChange: /改|加|開始|已/.test(visitNote) }] }))
    setVisitNote('')
  }
  const toggleFood = (e: Elder, w: number, g: number) => updateElder(e.id, (x) => ({ ...x, foodLog: x.foodLog.map((row, wi) => (wi === w ? row.map((v, gi) => (gi === g ? !v : v)) : row)) }))
  const toggleVovo = (e: Elder, w: number) => updateElder(e.id, (x) => ({ ...x, vovoAttend: x.vovoAttend.map((v, i) => (i === w ? !v : v)), vovoAccuracy: x.vovoAccuracy.map((v, i) => (i === w ? (x.vovoAttend[w] ? 0 : 75) : v)) }))

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-3 text-white dark:border-white/10">
        <h2 className="flex items-center gap-2 font-black"><HeartPulse className="h-5 w-5 text-emerald-300" /> 【追過程】親愛的長輩 vovoball 肌力 × 十食物群營養 雙紅綠燈看板</h2>
        <div className="flex items-center gap-3 text-sm font-bold tabular-nums">
          {(['green', 'yellow', 'red'] as Light[]).map((l) => <button key={l} onClick={() => setLightF(lightF === l ? '' : l)} className={`flex items-center gap-1 rounded-lg px-2 py-1 ${lightF === l ? 'bg-white/20' : 'hover:bg-white/10'}`}><Lamp light={l} size="sm" pulse={l === 'red' && counts.red > 0} /><span className={lightText[l]}>{counts[l]}</span></button>)}
          <span className="text-xs font-normal text-slate-300">共 {elders.length} 位</span>
        </div>
      </div>
      {toast && <div className="border-b border-red-500/40 bg-red-500/15 px-5 py-2 text-sm font-semibold text-red-500 dark:text-red-300">{toast}</div>}
      <div className="grid lg:grid-cols-[320px_1fr]">
        {/* 名單 */}
        <div className="border-r border-slate-200 dark:border-white/10">
          <label className="relative block border-b border-slate-200 p-2 dark:border-white/10"><Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input className="input !py-1.5 !pl-8 text-xs" placeholder="搜尋去識別化 ID（HC-2026-…）" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <div className="max-h-[560px] overflow-y-auto">
            {list.map((e) => { const v = verdicts.get(e.id)!; return (
              <button key={e.id} onClick={() => setSelId(e.id)} className={`flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2 text-left text-sm transition dark:border-white/5 ${sel?.id === e.id ? 'bg-teal-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                <Lamp light={v.light} size="md" pulse={v.light === 'red'} />
                <span className="font-mono font-bold">{e.id}</span>
                <span className="text-[11px] text-slate-500">{e.ageBand} {e.gender} ‧ W{currentWeek(e)}</span>
                {e.redFlags.length > 0 && <Lock className="ml-auto h-3.5 w-3.5 text-red-500" />}
              </button>
            ) })}
            {list.length === 0 && <p className="p-4 text-center text-sm text-slate-500">無符合條件的個案</p>}
          </div>
        </div>
        {/* 陪跑卡 */}
        {sel ? <ElderCard e={sel} verdict={verdicts.get(sel.id)!} store={store} onFlag={(f) => toggleFlag(sel, f)} onFood={(w, g) => toggleFood(sel, w, g)} onVovo={(w) => toggleVovo(sel, w)} visitNote={visitNote} setVisitNote={setVisitNote} onVisit={() => addVisit(sel)} /> : <div className="p-8 text-center text-slate-500">無個案</div>}
      </div>
    </section>
  )
}

function ElderCard({ e, verdict, store, onFlag, onFood, onVovo, visitNote, setVisitNote, onVisit }: { e: Elder; verdict: ReturnType<typeof elderLight>; store: Store; onFlag: (f: RedFlag) => void; onFood: (w: number, g: number) => void; onVovo: (w: number) => void; visitNote: string; setVisitNote: (s: string) => void; onVisit: () => void }) {
  const { data, ui } = store
  const wk = currentWeek(e)
  const site = data.sites.find((s) => s.id === e.siteId)
  const coach = data.coaches.find((c) => c.id === e.coachId)
  const gaps = foodGap(e)
  const refs = data.referrals.filter((r) => r.elderId === e.id)
  const canEdit = ui.role !== 'l3' || true
  return (
    <div className="space-y-3 p-4">
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${lightBg[verdict.light]}`}>
        <Lamp light={verdict.light} size="xl" pulse={verdict.light === 'red'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className={`text-xl font-black ${lightText[verdict.light]}`}>{LIGHT_META[verdict.light].label}</span><span className="text-xs text-slate-500">{LIGHT_META[verdict.light].desc}</span><span className="font-mono text-sm font-bold">{e.id}</span><span className="text-xs text-slate-500">{site?.name} ‧ 教練 {coach?.level} {coach?.name} ‧ 第 {wk}/12 週 ‧ {e.ageBand} {e.gender}</span>{!e.consent && <span className="chip border-red-500/40 text-red-500">未簽署個資同意書</span>}</div>
          <ul className="mt-1 text-xs text-slate-600 dark:text-slate-300">{verdict.reasons.map((r) => <li key={r}>‧ {r}</li>)}</ul>
        </div>
      </div>

      {verdict.locked && (
        <div className="rounded-xl border border-red-500/60 bg-red-500/10 p-3 text-sm shadow-[0_0_18px_rgba(239,68,68,0.3)]">
          <div className="flex items-center gap-2 font-black text-red-500"><Lock className="h-4 w-4" /> AI 臨床紅旗防呆鎖已啟動 ‧ 紅旗警戒</div>
          <ul className="mt-1 text-xs text-red-500/90">{verdict.locks.map((l) => <li key={l}>🔒 {l}</li>)}<li>🔒 禁止直接推銷任何商業保健品；僅能由惠生藥局藥師／營養師覆核後給出個別化建議</li></ul>
          <div className="mt-2 space-y-1 text-xs">{refs.map((r) => <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/60 px-2 py-1 dark:bg-black/30"><Send className="h-3 w-3 text-pink-400" /><b className="font-mono">{r.id}</b> {RED_FLAG_META[r.flag].label.slice(0, 1)} → 惠生藥局 L3 工作台 ‧ {r.status === 'pending' ? <span className="text-red-500">待覆核簽章</span> : <span className="text-emerald-500">已簽章：{r.signedBy}（{r.decision}）</span>}</div>)}</div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
          <h4 className="mb-1 text-xs font-bold text-slate-500">M01 需求引導卡 ＋ 單一健康目標</h4>
          <div className="flex flex-wrap gap-1.5">{NEEDS.map((n) => <span key={n} className={`chip ${e.needs[n] ? 'border-teal-500/50 bg-teal-500/10 text-teal-600 dark:text-teal-300' : 'border-slate-300/50 text-slate-400 dark:border-white/10'}`}>{e.needs[n] ? '✓' : '○'} {n}</span>)}</div>
          <div className="mt-2 text-sm">🎯 {e.goal}</div>
          <div className="mt-1 text-[11px] text-slate-500">家庭補貨採買卡：{e.shoppingCard ? '✅ 已落地' : '⬜ 尚未落地'} ‧ 風險分流：{e.redFlags.length ? '🔴 紅旗' : '🟢 無紅旗'}</div>
        </div>
        <div className="rounded-xl border border-red-500/40 p-3">
          <h4 className="mb-1 flex items-center gap-1 text-xs font-bold text-red-500"><AlertOctagon className="h-3.5 w-3.5" /> 四大臨床紅旗（勾選即鎖定並自動派單）</h4>
          <div className="space-y-1">{(Object.keys(RED_FLAG_META) as RedFlag[]).map((f) => { const on = e.redFlags.includes(f); return (
            <label key={f} className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs ${on ? 'bg-red-500/15 text-red-500' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}>
              <input type="checkbox" className="accent-red-500" checked={on} disabled={on || !canEdit} onChange={() => onFlag(f)} /> {RED_FLAG_META[f].label}{on && <Lock className="ml-auto h-3 w-3" />}
            </label>
          ) })}</div>
        </div>
      </div>

      {/* 十食物群 12 週紀錄 */}
      <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-xs font-bold text-slate-500">M03/M04 台灣版十食物群冰箱紀錄表 ‧ 12 週打勾趨勢</h4><span className="text-[10px] text-slate-400">本專案居家紀錄操作工具（對應國健署六大類均衡飲食架構）</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead><tr><th className="sticky left-0 bg-white px-1 text-left dark:bg-[#0b1620]">食物群</th>{Array.from({ length: 12 }, (_, w) => <th key={w} className={`px-0.5 ${w + 1 === wk ? 'text-teal-500' : w + 1 > wk ? 'text-slate-300 dark:text-slate-600' : ''}`}>W{w + 1}</th>)}<th className="px-1 text-right">達成</th></tr></thead>
            <tbody>{FOOD_GROUPS.map((g, gi) => (
              <tr key={g} className="border-t border-slate-100 dark:border-white/5">
                <td className="sticky left-0 whitespace-nowrap bg-white px-1 py-0.5 font-semibold dark:bg-[#0b1620]">{g}</td>
                {Array.from({ length: 12 }, (_, w) => <td key={w} className="px-0.5 text-center"><button disabled={w + 1 > wk} onClick={() => onFood(w, gi)} className={`h-5 w-5 rounded ${w + 1 > wk ? 'bg-slate-100 dark:bg-white/5' : e.foodLog[w]?.[gi] ? 'bg-emerald-500 text-white shadow-glow-green' : 'bg-slate-200 hover:bg-slate-300 dark:bg-white/10'}`} aria-label={`${g} 第${w + 1}週`}>{w + 1 <= wk && e.foodLog[w]?.[gi] ? '✓' : ''}</button></td>)}
                <td className={`px-1 text-right font-bold tabular-nums ${gaps[gi].rate >= 70 ? lightText.green : gaps[gi].rate >= 40 ? lightText.yellow : lightText.red}`}>{gaps[gi].rate}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">飲食缺口：{gaps.filter((x) => x.rate < 40).map((x) => x.group).join('、') || '無明顯缺口'}</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
          <h4 className="mb-1 text-xs font-bold text-slate-500">vovoball 地板滾球 ‧ 出勤與精準度</h4>
          <div className="flex flex-wrap gap-1">{Array.from({ length: 12 }, (_, w) => <button key={w} disabled={w + 1 > wk} onClick={() => onVovo(w)} className={`flex h-9 w-9 flex-col items-center justify-center rounded-lg text-[10px] font-bold ${w + 1 > wk ? 'bg-slate-100 text-slate-300 dark:bg-white/5 dark:text-slate-600' : e.vovoAttend[w] ? 'bg-teal-500/20 text-teal-600 ring-1 ring-teal-500/60 dark:text-teal-300' : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30'}`} title={`第 ${w + 1} 週`}>W{w + 1}<span>{w + 1 > wk ? '' : e.vovoAttend[w] ? `${e.vovoAccuracy[w]}%` : '缺'}</span></button>)}</div>
          <div className="mt-1 text-[11px] text-slate-500">出席 {e.vovoAttend.slice(0, wk).filter(Boolean).length}/{wk} 週 ‧ 平均精準度 {Math.round(e.vovoAccuracy.slice(0, wk).filter(Boolean).reduce((a, b) => a + b, 0) / Math.max(1, e.vovoAttend.slice(0, wk).filter(Boolean).length))}%</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
          <h4 className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-500"><PhoneCall className="h-3.5 w-3.5" /> 健康聯絡簿回訪（4／8／12 週）</h4>
          <div className="max-h-28 space-y-1 overflow-y-auto text-xs">{[...e.visits].sort((a, b) => b.date.localeCompare(a.date)).map((v, i) => <div key={i} className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-white/5"><b>W{v.week}</b> {v.date} {v.behaviorChange && <span className="chip border-orange-500/40 text-orange-500">實質行為改變</span>}<div className="text-slate-600 dark:text-slate-300">{v.note}</div></div>)}{e.visits.length === 0 && <div className="text-red-500">尚未回訪</div>}</div>
          <div className="mt-2 flex gap-2"><input className="input !py-1.5 text-xs" placeholder="新增回訪紀錄（例：已改用無糖豆漿、每天加 1 顆蛋）" value={visitNote} onChange={(ev) => setVisitNote(ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && onVisit()} /><button className="btn-primary !px-3 !py-1.5 text-xs" onClick={onVisit} disabled={!visitNote.trim()}>回訪</button></div>
        </div>
      </div>
    </div>
  )
}
