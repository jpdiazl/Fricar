export function normalizeRut(rut) {
  if (!rut) return '';
  return String(rut).trim().toUpperCase().replace(/\./g, '').replace(/\s+/g, '');
}
