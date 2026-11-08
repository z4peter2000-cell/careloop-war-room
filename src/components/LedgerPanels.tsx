import { useState } from 'react'
import { Calculator, FileWarning, Landmark, ShieldCheck, Store, Trophy } from 'lucide-react'
import type { AppData } from '../types'
import { AMOEBA_STORES, PLAN_C } from '../demoData'
import { Stat } from './ui'

export function LedgerA({ data }: { data: AppData }) {
  const elders = data.elders.filter((e) => e.ledger === 'A')
  const unique = new Set(elders.map((e) => e.id)).size
  const visited = elders.filter((e) => e.visits.length > 0).length
  const courses = data.courses.filter((c) => c.kind === '課程')
  const promo = data.courses.filter((c) => c.kind === '宣導')
  const camp = data.courses.find((c) => c.kind === '共識營')
  const cN = courses.reduce((n, c) => n + c.attendees, 0)
  const pN = promo.reduce((n, c) => n + c.attendees, 0)
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 px-5 py-3 text-white dark:border-white/10">
        <h2 className="flex items-center gap-2 font-black"><Landmark className="h-5 w-5 text-teal-300" /> A帳：115年國健署實績基線 <span className="chip border-teal-400/50 bg-teal-500/20 text-teal-200">已執行實績 ‧ 去重統計</span></h2>
        <span className="text-xs text-slate-300">鎖定三據點：虎尾惠眾醫事C ‧ 斗南惠宏醫事C ‧ 北斗安泰醫事C</span>
      </div>
      <div className="grid grid-cols-2 divide-slate-200 md:grid-cols-6 md:divide-x dark:divide-white/10">
        <Stat label="不重複服務親愛的長輩" value={unique} sub="去識別化唯一 ID" />
        <Stat label="完成回訪" value={visited} sub={`回訪率 ${((visited / unique) * 100).toFixed(1)}%`} tone="green" />
        <Stat label="課程" value={`${courses.length} 場`} sub={`${cN} 人次`} />
        <Stat label="宣導" value={`${promo.length} 場`} sub={`${pN} 人次`} />
        <Stat label="合計人次" value={cN + pN} sub="課程＋宣導" tone="amber" />
        <Stat label="共識營參訓" value={camp?.attendees ?? 0} sub="L0–L3 教練培訓" tone="violet" />
      </div>
      <div className="grid gap-2 border-t border-slate-200 p-3 md:grid-cols-3 dark:border-white/10">
        {data.sites.filter((s) => s.ledger === 'A').map((s) => {
          const es = elders.filter((e) => e.siteId === s.id)
          return <div key={s.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10"><b>{s.name}</b><span className="ml-2 text-xs text-slate-500">{s.city}</span><div className="mt-1 text-xs text-slate-500">服務 <b className="text-teal-500">{es.length}</b> 位 ‧ 回訪 {es.filter((e) => e.visits.length).length} 位 ‧ 課程 {data.courses.filter((c) => c.siteId === s.id && c.kind === '課程').length} 場</div></div>
        })}
      </div>
    </section>
  )
}

export function LedgerC() {
  return (
    <section className="card overflow-hidden border-amber-500/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-gradient-to-r from-amber-900/80 via-slate-900 to-slate-900 px-5 py-3 text-white">
        <h2 className="flex items-center gap-2 font-black"><FileWarning className="h-5 w-5 text-amber-300" /> C帳：116年萬海案規劃草案 <span className="chip border-amber-400/60 bg-amber-500/25 text-amber-200 animate-pulseGlow">提案規劃非已執行</span></h2>
        <span className="text-xs text-amber-200/80">本帳所有數字為目標值，不得與 A 帳實績混計</span>
      </div>
      <div className="grid grid-cols-2 divide-slate-200 md:grid-cols-4 md:divide-x dark:divide-white/10">
        <Stat label="目標預算" value={`${(PLAN_C.budget / 10000).toFixed(0)} 萬`} sub="新台幣" tone="amber" />
        <Stat label="領取十食物群工具包" value={`${PLAN_C.tools} 人`} sub="目標" tone="amber" />
        <Stat label="進入 12 週陪跑" value={`${PLAN_C.enroll} 人`} sub="目標" tone="amber" />
        <Stat label="規劃據點" value={PLAN_C.sites.length} sub={PLAN_C.sites.join('、')} tone="slate" />
      </div>
      <ol className="grid gap-2 border-t border-slate-200 p-3 text-sm md:grid-cols-5 dark:border-white/10">
        {PLAN_C.milestones.map((m, i) => <li key={m} className="rounded-xl border border-dashed border-amber-500/40 px-3 py-2"><span className="text-[10px] font-bold text-amber-500">里程碑 {i + 1}</span><div>{m}</div></li>)}
      </ol>
    </section>
  )
}

const PACKAGES = [
  { key: 'train', name: '教練培訓考核（L0→L1→L2）', unit: '人', price: 18000, cost: 9500 },
  { key: 'site', name: '據點導入（SOP、工具包、系統帳號）', unit: '據點', price: 120000, cost: 55000 },
  { key: 'loop', name: '12 週營養陪跑（HEALTH Coach 四階段八動作）', unit: '位長輩', price: 6000, cost: 3200 },
  { key: 'vovo', name: 'vovoball 肌力結合方案（器材＋團練）', unit: '據點', price: 45000, cost: 26000 },
  { key: 'l3', name: '惠生藥局藥師／營養師督導（紅旗覆核）', unit: '月', price: 25000, cost: 15000 },
] as const

export function LedgerB({ data, showCalc }: { data: AppData; showCalc: boolean }) {
  const [qty, setQty] = useState<Record<string, number>>({ train: 6, site: 1, loop: 60, vovo: 1, l3: 3 })
  const total = PACKAGES.reduce((n, p) => n + p.price * (qty[p.key] ?? 0), 0)
  const cost = PACKAGES.reduce((n, p) => n + p.cost * (qty[p.key] ?? 0), 0)
  const margin = total ? Math.round(((total - cost) / total) * 100) : 0
  const bElders = data.elders.filter((e) => e.ledger === 'B').length
  return (
    <section className="space-y-4">
      <div className="card overflow-hidden border-violet-500/40">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-500/30 bg-gradient-to-r from-violet-900/80 via-slate-900 to-slate-900 px-5 py-3 text-white">
          <h2 className="flex items-center gap-2 font-black"><Store className="h-5 w-5 text-violet-300" /> B帳：B端商業授權與門市阿米巴賽馬 <span className="chip border-violet-400/60 bg-violet-500/25 text-violet-200">商業分帳 ‧ 與 A/C 帳嚴格分離</span></h2>
          <span className="flex items-center gap-1 text-xs text-violet-200/80"><ShieldCheck className="h-3.5 w-3.5" /> 臨床分流（惠生藥局）與商業導購（宇勝代理 AFC）嚴格分帳分流</span>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><Trophy className="h-4 w-4 text-yellow-400" /> 門市阿米巴賽馬（本月）</h3>
            <div className="space-y-1.5">
              {[...AMOEBA_STORES].sort((a, b) => b.loops - a.loops).map((s, i) => (
                <div key={s.name} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10">
                  <span className={`font-black ${i === 0 ? 'text-yellow-400' : 'text-slate-400'}`}>{i + 1}</span>
                  <div><b>{s.name}</b><div className="text-[11px] text-slate-500">會員 {s.members} ‧ CareLoop 陪跑 {s.loops} 位 ‧ 藥師轉介 {s.referrals} 件</div></div>
                  <span className="text-right font-black tabular-nums text-violet-500 dark:text-violet-300">{(s.revenue / 10000).toFixed(1)} 萬</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">示範館目前 B 帳陪跑長輩 {bElders} 位（獨立計算，不計入 A 帳 101 人）。</p>
          </div>
          {showCalc ? (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><Calculator className="h-4 w-4 text-teal-400" /> 十要素標準化服務包 ‧ 授權報價試算器（三代接班人）</h3>
              <div className="space-y-1.5">
                {PACKAGES.map((p) => (
                  <div key={p.key} className="grid grid-cols-[1fr_5rem_6rem] items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs dark:border-white/10">
                    <div><b>{p.name}</b><div className="text-[10px] text-slate-500">NT$ {p.price.toLocaleString()} / {p.unit} ‧ 成本 {p.cost.toLocaleString()}</div></div>
                    <input type="number" min={0} className="input !py-1 text-right" value={qty[p.key] ?? 0} onChange={(e) => setQty({ ...qty, [p.key]: Math.max(0, Number(e.target.value)) })} aria-label={p.name} />
                    <span className="text-right font-bold tabular-nums">{(p.price * (qty[p.key] ?? 0)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-violet-500/40 bg-violet-500/5 dark:divide-white/10">
                <Stat label="授權報價" value={`${(total / 10000).toFixed(1)} 萬`} tone="violet" />
                <Stat label="單位經濟毛利" value={`${margin}%`} sub={`毛利 ${((total - cost) / 10000).toFixed(1)} 萬`} tone={margin >= 45 ? 'green' : 'yellow'} />
                <Stat label="每位長輩成本" value={qty.loop ? `${Math.round(cost / qty.loop).toLocaleString()}` : '—'} sub="NT$ / 12 週" tone="slate" />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">報價不含任何保健品銷售；宇勝代理之日本 AFC 產品導購另立商業帳，不得由紅旗分流路徑推銷。</p>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-white/10">授權報價試算器僅限「👑 三代接班人」視角</div>
          )}
        </div>
      </div>
    </section>
  )
}
