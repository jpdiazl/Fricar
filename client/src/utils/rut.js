// Formatea un RUT chileno mientras el usuario escribe.
// Ej: 111111111 -> 11.111.111-1
export function formatRut(value) {
  if (!value) return '';
  const clean = String(value)
    .replace(/[^0-9kK]/g, '')
    .toUpperCase();

  if (clean.length <= 1) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  // Agrega puntos cada 3 desde el final
  let withDots = '';
  let i = body.length;
  while (i > 3) {
    withDots = '.' + body.slice(i - 3, i) + withDots;
    i -= 3;
  }
  withDots = body.slice(0, i) + withDots;

  return `${withDots}-${dv}`;
}
