export const parseNumber = (v: unknown) => {
  if (typeof v === 'number') {
    return v;
  }
  if (typeof v === 'string') {
    const s = v.replaceAll(/[^0-9.]/g, '');
    const n = Number.parseFloat(s);
    if (Number.isNaN(n)) {
      throw new TypeError(`Invalid number: ${v}`);
    }
    return n;
  }

  throw new TypeError(`Invalid number: ${String(v)}`);
};
