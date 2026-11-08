export const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const today = () => toDateStr(new Date())
export const addDays = (base: string, n: number) => { const d = new Date(base + 'T00:00:00'); d.setDate(d.getDate() + n); return toDateStr(d) }
export const daysBetween = (a: string, b: string) => Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)
export const monthOf = (d: string) => d.slice(0, 7)
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
