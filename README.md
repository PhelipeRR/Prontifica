# Simula Imóvel — Prontifica

Simulador imobiliário em Nuxt 3, Vue 3 e TypeScript, com cálculo independente para SAC e Price, comparação entre sistemas, comprometimento estimado da renda, cronograma exportável em CSV e compartilhamento.

## Executar

```bash
npm install
npm run dev
```

Verificações: `npm run test`, `npm run typecheck`, `npm run build`.

## Premissas

A taxa efetiva anual é convertida por `(1 + taxa anual)^(1/12) - 1`; os valores são arredondados para centavos a cada parcela e a última amortização absorve o resíduo. Não são modelados seguros, tarifas, indexadores, TR ou custos cartorários. A antecipação é uma estimativa e instituições podem aplicar regras próprias.

## Taxas e privacidade

O endpoint `/api/bank-rates` retorna apenas nomes de instituições e um marcador de cenário demonstrativo; não há taxas fictícias apresentadas como ofertas. O projeto não usa banco, login, analytics ou persistência. Uma futura integração deve implementar um provider com fonte, data de referência, timeout e validação.
