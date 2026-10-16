import type { AmortizationSystem, FinancingInput, FinancingResult, Installment } from '~/types/financing'

export const annualToMonthlyRate = (annualPercent: number) => Math.pow(1 + annualPercent / 100, 1 / 12) - 1
const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

function schedule(input: FinancingInput, system: AmortizationSystem): FinancingResult {
  const minimumDownPayment = input.propertyValue * .2; const financed = money(Math.max(0, input.propertyValue - Math.max(minimumDownPayment, input.downPayment))); const rate = annualToMonthlyRate(input.annualRate); const rows: Installment[] = []
  if (!financed) return { input, financed, installments: [], firstPayment: 0, lastPayment: 0, totalInterest: 0, totalPaid: 0 }
  const fixed = rate === 0 ? financed / input.termMonths : financed * rate * Math.pow(1 + rate, input.termMonths) / (Math.pow(1 + rate, input.termMonths) - 1)
  let balance = financed
  for (let i = 1; i <= input.termMonths; i++) {
    const interest = money(balance * rate)
    const sacPrincipal = financed / input.termMonths
    const pricePrincipal = fixed - interest
    const principal = i === input.termMonths ? balance : money(system === 'SAC' ? sacPrincipal : system === 'PRICE' ? pricePrincipal : (sacPrincipal + pricePrincipal) / 2)
    const payment = money(principal + interest)
    balance = money(Math.max(0, balance - principal)); rows.push({ number: i, payment, interest, principal, balance })
  }
  const totalInterest = money(rows.reduce((s, r) => s + r.interest, 0)); const totalPaid = money(rows.reduce((s, r) => s + r.payment, 0))
  const lastCharged = [...rows].reverse().find(row => row.payment > 0)
  return { input, financed, installments: rows, firstPayment: rows[0]?.payment ?? 0, lastPayment: lastCharged?.payment ?? 0, totalInterest, totalPaid }
}
export const calculateFinancing = (input: FinancingInput) => schedule(input, input.system)
export const compareSystems = (input: FinancingInput) => ({ sac: schedule({ ...input, system: 'SAC' }, 'SAC'), price: schedule({ ...input, system: 'PRICE' }, 'PRICE') })
export function earlyRepayment(result: FinancingResult, extra: number, month: number, strategy: 'TERM' | 'PAYMENT') {
  const target = result.installments[month - 1]; if (!target || extra <= 0) return result
  const balance = Math.max(0, target.balance - extra); const remaining = result.installments.length - month; const nextInput = { ...result.input, propertyValue: balance, downPayment: 0, termMonths: Math.max(1, remaining) }
  if (strategy === 'TERM') return calculateFinancing({ ...nextInput, annualRate: result.input.annualRate, system: result.input.system })
  return calculateFinancing({ ...nextInput, termMonths: Math.max(1, remaining), system: result.input.system })
}
