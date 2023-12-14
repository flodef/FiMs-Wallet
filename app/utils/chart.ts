export function getBarData(name: string, amount: number) {
  return {
    name,
    amount,
    value: Math.abs(amount),
    color: amount < 0 ? 'red' : 'green'
  };
}
