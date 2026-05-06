import { Counter } from '../models/Counter.js';

export async function nextSequence(name, { prefix = '', pad = 6 } = {}) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.seq).padStart(pad, '0');
  return `${prefix}${number}`;
}
