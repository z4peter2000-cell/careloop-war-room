import { useStore } from './store'
import { TopNav } from './components/TopNav'
import { LedgerA, LedgerB, LedgerC } from './components/LedgerPanels'
import { ElderBoard } from './components/ElderBoard'
import { Workbench } from './components/Workbench'
import { RaceBoard } from './components/RaceBoard'
import { ROLE_META } from './types'

export default function App() {
  const store = useStore()
  const { data, ui } = store
  const ledgerSites = data.sites.filter((s) => s.ledger === ui.ledger)
  const me = data.coaches.find((c) => c.id === ui.coachId)
  const visibleSites = ui.role === 'coach' && me ? ledgerSites.filter((s) => s.id === me.siteId) : ledgerSites
  const elders = data.elders.filter((e) => e.ledger === ui.ledger && visibleSites.some((s) => s.id === e.siteId))
  return (
    <div className="min-h-screen">
      <TopNav store={store} />
      <main className="mx-auto max-w-[1500px] space-y-4 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="chip border-teal-500/40 text-teal-500">{ROLE_META[ui.role].label}</span>
          <span>{ROLE_META[ui.role].desc}</span>
          {ui.role === 'coach' && me && <span className="chip border-slate-400/40">僅顯示所屬據點：{data.sites.find((s) => s.id === me.siteId)?.name}</span>}
          <span className="ml-auto">所有個案採去識別化唯一 ID（HC-2026-xxx）保護隱私</span>
        </div>
        {ui.ledger === 'A' && <LedgerA data={data} />}
        {ui.ledger === 'C' && <LedgerC />}
        {ui.ledger === 'B' && ui.role !== 'coach' && <LedgerB data={data} showCalc={ui.role === 'owner'} />}
        {ui.ledger === 'C' ? (
          <div className="card p-6 text-center text-sm text-slate-500">C 帳為規劃草案，尚無個案與任務資料；導入後個案將以 HC-2027-xxx 編碼獨立計算，不與 115 年 A 帳實績混計。</div>
        ) : (
          <>
            <RaceBoard store={store} sites={visibleSites} />
            <ElderBoard store={store} elders={elders} />
            {ui.role !== 'coach' && <Workbench store={store} />}
          </>
        )}
        <footer className="pb-6 text-center text-[11px] text-slate-400">CareLoop ‧ 資料儲存於瀏覽器 localStorage ‧ 十食物群為本專案居家紀錄操作工具（對應國健署六大類均衡飲食架構）‧ HEALTH Coach 不做醫療診斷，紅旗一律轉介惠生藥局藥師／營養師</footer>
      </main>
    </div>
  )
}
