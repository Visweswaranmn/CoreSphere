import { model, Schema, type Model } from 'mongoose';

interface CounterDoc {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<CounterDoc>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter: Model<CounterDoc> = model<CounterDoc>('Counter', counterSchema);

/** Atomically increments and returns the next value in a named sequence. */
export async function nextSequence(name: string): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).exec();
  return doc.seq;
}

/** Formats a sequence value as a zero-padded code, e.g. `EMP-00042`. */
export function formatCode(prefix: string, seq: number, width = 5): string {
  return `${prefix}-${String(seq).padStart(width, '0')}`;
}
