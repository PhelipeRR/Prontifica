import { computed, reactive, ref } from 'vue'
import { calculateFinancing, compareSystems } from '~/utils/finance'
import type { AmortizationSystem, BankId, FinancingInput, FinancingType, RateIndexer } from '~/types/financing'

export const financingTypes: Array<{ id: FinancingType; label: string; description: string }> = [
  { id: 'RESIDENTIAL', label: 'Imóvel residencial pronto', description: 'Compra de imóvel novo ou usado' },
  { id: 'LOT_CONSTRUCTION', label: 'Terreno + construção', description: 'Aquisição do lote e execução da obra' },
  { id: 'OWN_LAND_CONSTRUCTION', label: 'Construção em terreno próprio', description: 'Construção em terreno já registrado' },
  { id: 'COMMERCIAL', label: 'Imóvel comercial', description: 'Aquisição de unidade comercial' },
  { id: 'HOME_EQUITY', label: 'Empréstimo com garantia de imóvel', description: 'Crédito com imóvel quitado em garantia' }
]

type Product = { rate: number; indexer: RateIndexer; systems: AmortizationSystem[]; available: boolean }
type Catalog = Record<BankId, Record<FinancingType, Product>>

// Parâmetros de triagem do ProntiGuia+. São referências de simulação, não uma proposta bancária.
const residential: Record<BankId, Product> = {
  caixa: { rate: 11.19, indexer: 'TR', systems: ['SAC', 'PRICE'], available: true }, brb: { rate: 11.99, indexer: 'TR', systems: ['SAC'], available: true },
  bradesco: { rate: 11.70, indexer: 'TR', systems: ['SAC', 'PRICE'], available: true }, santander: { rate: 11.69, indexer: 'TR', systems: ['SAC', 'PRICE'], available: true },
  itau: { rate: 11.89, indexer: 'TR', systems: ['SAC', 'MIX'], available: true }, inter: { rate: 9.99, indexer: 'IPCA', systems: ['SAC', 'PRICE'], available: true }
}
const makeCatalog = (): Catalog => {
  const types: FinancingType[] = ['RESIDENTIAL', 'LOT_CONSTRUCTION', 'OWN_LAND_CONSTRUCTION', 'COMMERCIAL', 'HOME_EQUITY']
  const catalog = {} as Catalog
  for (const bank of Object.keys(residential) as BankId[]) {
    catalog[bank] = {} as Record<FinancingType, Product>
    for (const type of types) catalog[bank][type] = { ...residential[bank], available: type === 'RESIDENTIAL' }
  }
  for (const type of ['LOT_CONSTRUCTION', 'OWN_LAND_CONSTRUCTION'] as FinancingType[]) {
    catalog.caixa[type] = { rate: 10.00, indexer: 'TR', systems: ['SAC'], available: true }
    catalog.inter[type] = { rate: 13.99, indexer: 'TR', systems: ['SAC'], available: true }
  }
  for (const bank of ['caixa', 'bradesco', 'inter'] as BankId[]) catalog[bank].COMMERCIAL = { ...residential[bank], available: true }
  catalog.caixa.HOME_EQUITY = { rate: 18.36, indexer: 'TR', systems: ['SAC', 'PRICE'], available: true }
  catalog.inter.HOME_EQUITY = { rate: 12.00, indexer: 'IPCA', systems: ['SAC'], available: true }
  return catalog
}

export const useFinancingSimulation = () => {
  const catalog = makeCatalog()
  const form = reactive<FinancingInput>({ propertyValue: 0, downPayment: 0, termMonths: 240, annualRate: residential.caixa.rate, monthlyIncome: 0, system: 'SAC', bank: 'caixa', financingType: 'RESIDENTIAL', indexer: 'TR' })
  const simulationRevision = ref(0); const touch = () => { simulationRevision.value++ }
  const product = computed(() => catalog[form.bank][form.financingType || 'RESIDENTIAL'])
  // A leitura direta do formulário mantém o dashboard sincronizado com cada alteração do simulador.
  const result = computed(() => calculateFinancing({ ...form }))
  const comparison = computed(() => compareSystems({ ...form }))
  const selectedDownPaymentPercent = ref(20)
  const downPaymentPercent = computed({ get: () => selectedDownPaymentPercent.value, set: v => { selectedDownPaymentPercent.value = Math.max(20, Math.min(90, v)); form.downPayment = Math.min(form.propertyValue, Math.max(form.propertyValue * .2, form.propertyValue * selectedDownPaymentPercent.value / 100)); touch() } })
  const selectProduct = () => { const p = product.value; form.annualRate = p.rate; form.indexer = p.indexer; if (!p.systems.includes(form.system)) form.system = p.systems[0]; touch() }
  const selectBank = (bank: BankId) => { form.bank = bank; if (!catalog[bank][form.financingType || 'RESIDENTIAL'].available) form.financingType = 'RESIDENTIAL'; selectProduct() }
  const selectFinancingType = (type: FinancingType) => { form.financingType = type; if (!catalog[form.bank][type].available) form.bank = 'caixa'; selectProduct() }
  const availableSystems = computed(() => product.value.systems); const availableBanks = computed(() => (Object.keys(catalog) as BankId[]).filter(bank => catalog[bank][form.financingType || 'RESIDENTIAL'].available))
  const bankRates = computed(() => Object.fromEntries((Object.keys(catalog) as BankId[]).map(bank => [bank, catalog[bank][form.financingType || 'RESIDENTIAL'].rate])))
  return { form, result, comparison, downPaymentPercent, bankRates, availableSystems, availableBanks, financingTypes, product, catalog, selectBank, selectProduct, selectFinancingType, touch }
}
