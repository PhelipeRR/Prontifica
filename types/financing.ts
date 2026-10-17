export type AmortizationSystem = 'SAC' | 'PRICE' | 'MIX'
export type BankId = 'caixa' | 'brb' | 'bradesco' | 'santander' | 'itau' | 'inter'
export type FinancingType = 'RESIDENTIAL' | 'LOT_CONSTRUCTION' | 'OWN_LAND_CONSTRUCTION' | 'COMMERCIAL' | 'HOME_EQUITY'
export type RateIndexer = 'TR' | 'IPCA'
export type FinancingProgram = 'STANDARD' | 'MCMV'
export interface FinancingInput { propertyValue: number; downPayment: number; termMonths: number; annualRate: number; monthlyIncome?: number; system: AmortizationSystem; bank: BankId; financingType?: FinancingType; indexer?: RateIndexer; program?: FinancingProgram }
export interface Installment { number: number; payment: number; interest: number; principal: number; balance: number }
export interface FinancingResult { input: FinancingInput; financed: number; installments: Installment[]; firstPayment: number; lastPayment: number; totalInterest: number; totalPaid: number }
