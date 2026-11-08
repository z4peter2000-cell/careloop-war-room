import type { Light, Tier } from '../types'
import { TIER_META } from '../types'

const sizeMap = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-6 w-6', xl: 'h-10 w-10' }
export function Lamp({ light, size = 'md', pulse = false }: { light?: Light | null; size?: keyof typeof sizeMap; pulse?: boolean }) {
  return <span className={`lamp ${sizeMap[size]} ${light ? `lamp-${light}` : 'lamp-off'} ${pulse ? 'animate-pulseGlow' : ''}`} />
}
export const lightText: Record<Light, string> = {
  green: 'text-emerald-500 dark:text-emerald-400 text-glow-green',
  yellow: 'text-yellow-500 dark:text-yellow-300 text-glow-yellow',
  red: 'text-red-500 dark:text-red-400 text-glow-red',
}
export const lightBg: Record<Light, string> = {
  green: 'bg-emerald-500/10 border-emerald-500/40',
  yellow: 'bg-yellow-400/10 border-yellow-400/40',
  red: 'bg-red-500/10 border-red-500/50',
}
export function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`chip ${TIER_META[tier].cls}`} title={TIER_META[tier].label}>{TIER_META[tier].short}</span>
}
export function StackBar({ green, yellow, red, height = 'h-2' }: { green: number; yellow: number; red: number; height?: string }) {
  const t = Math.max(1, green + yellow + red)
  return (
    <div className={`flex ${height} w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10`}>
      <div className="bg-light-green" style={{ width: `${(green / t) * 100}%` }} />
      <div className="bg-light-yellow" style={{ width: `${(yellow / t) * 100}%` }} />
      <div className="bg-light-red" style={{ width: `${(red / t) * 100}%` }} />
    </div>
  )
}
export function Avatar({ name, color, size = 'md' }: { name: string; color: string; size?: 'sm' | 'md' }) {
  return <span className={`inline-flex ${size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'} shrink-0 items-center justify-center rounded-full font-bold text-slate-900 ring-2 ring-white/30`} style={{ background: color }}>{name.slice(0, 1)}</span>
}
export function Stat({ label, value, sub, tone = 'teal' }: { label: string; value: string | number; sub?: string; tone?: 'teal' | 'green' | 'yellow' | 'red' | 'amber' | 'violet' | 'slate' }) {
  const c = { teal: 'text-teal-500 dark:text-teal-300', green: lightText.green, yellow: lightText.yellow, red: lightText.red, amber: 'text-amber-500 dark:text-amber-300', violet: 'text-violet-500 dark:text-violet-300', slate: 'text-slate-500' }[tone]
  return (
    <div className="flex flex-col items-center gap-0.5 py-3">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-3xl font-black tabular-nums ${c}`}>{value}</span>
      {sub && <span className="text-[11px] text-slate-500">{sub}</span>}
    </div>
  )
}
export function LevelChip({ level }: { level: string }) {
  const m: Record<string, string> = { L0: 'border-slate-400/40 text-slate-500', L1: 'border-sky-500/40 text-sky-500', L2: 'border-teal-500/40 text-teal-500', L3: 'border-pink-500/40 text-pink-500' }
  const t: Record<string, string> = { L0: '觀摩', L1: '基礎陪伴', L2: '據點帶領', L3: '督導' }
  return <span className={`chip ${m[level]}`}>{level} {t[level]}</span>
}
