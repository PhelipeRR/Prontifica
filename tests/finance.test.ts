import { describe, expect, it } from 'vitest'
import { annualToMonthlyRate, calculateFinancing, earlyRepayment } from '../utils/finance'
const base = { propertyValue: 100000, downPayment: 20000, termMonths: 120, annualRate: 10, system: 'SAC' as const, bank: 'caixa' as const }
describe('motor financeiro', () => {
  it('converte taxa efetiva anual equivalentemente', () => expect(annualToMonthlyRate(12)).toBeCloseTo(0.00948879, 7))
  it('calcula SAC com saldo final zero e totais consistentes', () => { const r = calculateFinancing(base); expect(r.installments).toHaveLength(120); expect(r.installments.at(-1)?.balance).toBe(0); expect(r.totalPaid).toBeGreaterThan(r.financed) })
  it('calcula Price com parcelas praticamente constantes', () => { const r = calculateFinancing({ ...base, system: 'PRICE' }); expect(r.firstPayment).toBe(r.installments[1].payment); expect(r.installments.at(-1)?.balance).toBe(0) })
  it('trata juros zero', () => { const r = calculateFinancing({ ...base, annualRate: 0 }); expect(r.firstPayment).toBe(666.67); expect(r.totalInterest).toBe(0) })
  it('permite amortização extraordinária', () => { const r = calculateFinancing(base); const next = earlyRepayment(r, 5000, 12, 'TERM'); expect(next.totalInterest).toBeLessThan(r.totalInterest) })
})
