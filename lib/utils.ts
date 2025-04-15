export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-JO', {
    style: 'currency',
    currency: 'JOD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
} 