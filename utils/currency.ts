export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-JO', {
    style: 'currency',
    currency: 'JOD',
  }).format(amount);
} 