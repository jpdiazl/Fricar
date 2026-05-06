export function makeSequentialId(prefix) {
  const ts = new Date();
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, '0');
  const d = String(ts.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${prefix}-${y}${m}${d}-${rand}`;
}
