import { useState } from 'react'
import { Flame, HelpCircle, Plus, Trophy } from 'lucide-react'
import type { Store } from '../store'
import type { CoachTask, Light, Site } from '../types'
import { TIER_META } from '../types'
import { coachRows, siteAdvice, siteRows, tierOfKind, type RaceRow } from '../engine'
import { today, uid } from '../utils'
import { Avatar, Lamp, LevelChip, StackBar, TierBadge, lightText } from './ui'

function Row({ r, rank, color, advice }: { r: RaceRow; rank: number; color?: string; advice?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`w-5 text-lg font-black ${rank <= 3 ? 'text-yellow-400' : 'text-slate-400'}`}>{rank}</span>
        {color && <Avatar name={r.name} color={color} size="sm" />}
        <div className="min-w-0"><div className="flex items-center gap-2 font-bold">{r.name}{r.level && <LevelChip level={r.level} />}</div><div className="text-[11px] text-slate-500">{r.sub} ‧ 陪跑 {r.elders} 位{r.redElders ? <span className="text-red-500">（🔴 {r.redElders} 位紅燈）</span> : ''}</div></div>
        <div className="ml-auto flex items-center gap-3 text-sm font-black tabular-nums">
          <span className="flex items-center gap-1"><Lamp light="green" size="sm" /><span className={lightText.green}>{r.green}</span></span>
          <span className="flex items-center gap-1"><Lamp light="yellow" size="sm" /><span className={lightText.yellow}>{r.yellow}</span></span>
          <span className="flex items-center gap-1"><Lamp light="red" size="sm" /><span className={lightText.red}>{r.red}</span></span>
          <span className="w-16 text-right text-xl text-orange-500 dark:text-orange-300">🔥{r.goldRate}%</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3"><div className="flex-1"><StackBar green={r.green} yellow={r.yellow} red={r.red} /></div><span className="text-[11px] text-slate-500">綠燈率 {r.rate}% ‧ {Math.round(r.gold)}/{r.total * 100} 分</span></div>
      {advice && <div className="mt-2 rounded-lg bg-orange-500/10 px-2 py-1 text-xs text-orange-700 dark:text-orange-200">🤖 給三代接班人：{advice}</div>}
    </div>
  )
}

export function RaceBoard({ store, sites }: { store: Store; sites: Site[] }) {
  const { data, ui, addTask } = store
  const month = 'last30'
  const coaches = data.coaches.filter((c) => sites.some((s) => s.id === c.siteId))
  const sRows = siteRows(sites, data.coaches, data.tasks, data.elders, data.referrals, month)
  const cRows = coachRows(coaches, data.sites, data.tasks, data.elders, data.referrals, month)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<CoachTask['kind']>('breakthrough')
  const [ev, setEv] = useState({ done: false, list: false, feedback: false })
  const me = data.coaches.find((c) => c.id === ui.coachId)
  const myTasks = data.tasks.filter((t) => t.coachId === ui.coachId).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  const judge = (): Light => (ev.done && (ev.list || ev.feedback) ? 'green' : ev.done || ev.list ? 'yellow' : 'red')
  const submit = () => {
    if (!title.trim() || !me) return
    addTask({ id: `T-${uid().slice(0, 6)}`, coachId: me.id, siteId: me.siteId, date: today(), title: title.trim(), tier: tierOfKind(kind), light: judge(), kind })
    setTitle(''); setEv({ done: false, list: false, feedback: false })
  }
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-3 text-white dark:border-white/10">
        <h2 className="flex items-center gap-2 font-black"><Trophy className="h-5 w-5 text-yellow-400" /> 【拿結果】據點 × HEALTH Coach 三板斧賽馬排行榜 × 破局含金量
          <span className="group relative inline-flex"><HelpCircle className="h-4 w-4 cursor-help text-slate-300" />
            <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-96 -translate-x-1/2 rounded-xl border border-white/15 bg-slate-900/95 p-3 text-left text-xs font-normal leading-relaxed opacity-0 shadow-2xl transition group-hover:opacity-100">
              <b className="text-orange-300">🔥 破局含金量（%）</b>
              <div className="mt-1"><TierBadge tier={100} /> 完成需求卡＋家庭補貨採買卡落地＋4/8/12 週健康聯絡簿實質行為改變＋精準紅旗轉介藥師</div>
              <div className="mt-1"><TierBadge tier={50} /> 辦理 100 元餐盤夾夾樂、營養自助餐、大安早餐之旅桌遊等團體課並完成簽到</div>
              <div className="mt-1"><TierBadge tier={10} /> 僅發放傳單、只有人次沒有留存名單、或只打勾無實質回訪回饋</div>
              <div className="mt-1.5">單月含金量 ＝ Σ（定級分 × 兌現率 🟢100%／🟡50%／🔴0%）÷（任務總數 × 100）</div>
            </div>
          </span>
        </h2>
        <span className="text-xs text-slate-300">近 30 天 ‧ 公開展示</span>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div><h3 className="mb-2 flex items-center gap-1 text-sm font-bold"><Flame className="h-4 w-4 text-orange-400" /> 據點賽馬</h3><div className="space-y-2">{sRows.map((r, i) => <Row key={r.id} r={r} rank={i + 1} advice={ui.role === 'owner' ? siteAdvice(r) : undefined} />)}</div></div>
        <div><h3 className="mb-2 text-sm font-bold">HEALTH Coach 賽馬（L0 觀摩 / L1 基礎陪伴 / L2 據點帶領 / L3 督導）</h3><div className="space-y-2">{cRows.map((r, i) => <Row key={r.id} r={r} rank={i + 1} color={data.coaches.find((c) => c.id === r.id)?.color} />)}</div></div>
      </div>
      {ui.role === 'coach' && me && (
        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <h3 className="mb-2 text-sm font-bold">📝 {me.name} 今日三板斧任務填報（AI 自動定級與亮燈）</h3>
          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
            <input className="input" placeholder="任務內容（例：完成 3 戶需求卡＋採買卡落地）" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="input !w-auto" value={kind} onChange={(e) => setKind(e.target.value as CoachTask['kind'])} aria-label="任務類型">
              <option value="breakthrough">{TIER_META[100].short} 需求卡／採買卡／聯絡簿行為改變／紅旗轉介</option>
              <option value="course">{TIER_META[50].short} 團體課（餐盤夾夾樂／自助餐／桌遊）</option>
              <option value="misc">{TIER_META[10].short} 傳單／人次／打勾</option>
            </select>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1"><input type="checkbox" checked={ev.done} onChange={(e) => setEv({ ...ev, done: e.target.checked })} /> 已完成</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={ev.list} onChange={(e) => setEv({ ...ev, list: e.target.checked })} /> 留存名單／簽到</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={ev.feedback} onChange={(e) => setEv({ ...ev, feedback: e.target.checked })} /> 回訪回饋</label>
            </div>
            <button className="btn-primary" onClick={submit} disabled={!title.trim()}><Plus className="h-4 w-4" /> 送交 AI 判讀 <Lamp light={judge()} size="sm" /></button>
          </div>
          <div className="mt-2 grid gap-1 text-xs md:grid-cols-2">{myTasks.map((t) => <div key={t.id} className="flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 dark:bg-white/5"><Lamp light={t.light} size="sm" /><span className="text-slate-500">{t.date}</span><span className="truncate">{t.title}</span><span className="ml-auto"><TierBadge tier={t.tier} /></span></div>)}</div>
        </div>
      )}
    </section>
  )
}
