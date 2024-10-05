export function getDiscountedPrice(price: number, cycle: 'MONTHLY' | 'YEARLY') {
  return cycle === 'MONTHLY' ? price : price * 12 * 0.7;
}

// 공급가액
export function getPriceWithoutVat(price: number) {
  return Math.ceil(price / 11);
}

// 부가가치세
export function getVat(price: number) {
  return price - getPriceWithoutVat(price);
}
