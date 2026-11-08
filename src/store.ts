import { useCallback, useEffect, useState } from 'react'
import type { AppData, Elder, Ledger, Referral, Role } from './types'
import { buildDemo } from './demoData'

const KEY = 'careloop.v1'
const UI = 'careloop.ui'

function load(): AppData | null { try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as AppData) : null } catch { return null } }

export function useStore() {
  const [data, setData] = useState<AppData>(() => load() ?? buildDemo())
  const [ui, setUi] = useState<{ role: Role; ledger: Ledger; coachId: string; theme: 'dark' | 'light' }>(() => {
    try { return { role: 'owner', ledger: 'A', coachId: 'c3', theme: 'dark', ...JSON.parse(localStorage.getItem(UI) || '{}') } } catch { return { role: 'owner', ledger: 'A', coachId: 'c3', theme: 'dark' } }
  })
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(data)), [data])
  useEffect(() => { localStorage.setItem(UI, JSON.stringify(ui)); document.documentElement.classList.toggle('dark', ui.theme === 'dark') }, [ui])

  const updateElder = useCallback((id: string, fn: (e: Elder) => Elder) => setData((d) => ({ ...d, elders: d.elders.map((e) => (e.id === id ? fn(e) : e)) })), [])
  const addReferral = useCallback((r: Referral) => setData((d) => ({ ...d, referrals: [r, ...d.referrals] })), [])
  const signReferral = useCallback((id: string, signedBy: string, decision: string) => setData((d) => ({ ...d, referrals: d.referrals.map((r) => (r.id === id ? { ...r, status: 'signed', signedBy, decision, signedAt: new Date().toISOString() } : r)) })), [])
  const addTask = useCallback((t: AppData['tasks'][number]) => setData((d) => ({ ...d, tasks: [t, ...d.tasks] })), [])
  const resetDemo = useCallback(() => setData(buildDemo()), [])

  return { data, ui, setUi, updateElder, addReferral, signReferral, addTask, resetDemo }
}
export type Store = ReturnType<typeof useStore>
