export const brl = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
export const pct = (value: number) => `${value.toFixed(1).replace('.', ',')}%`
export const csv = (rows: Record<string, string | number>[]) => rows.length ? `${Object.keys(rows[0]).join(';')}\n${rows.map(r => Object.values(r).join(';')).join('\n')}` : ''
