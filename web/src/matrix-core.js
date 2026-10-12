export function buildMatrix(numbers) {
  const padded = numbers.map(number => String(number).padStart(2, "0"));
  const digits = [...new Set(padded.join(""))].sort();
  return padded.map(number => Number(`${digits.indexOf(number[0]) + 1}${digits.indexOf(number[1]) + 1}`));
}
