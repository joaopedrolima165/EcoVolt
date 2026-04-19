export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatKwh(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kWh`;
}

export function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}
