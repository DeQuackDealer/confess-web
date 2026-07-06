import { CopyButton } from '../common/CopyButton';

interface NumberFormatsPanelProps {
  decimal: string;
  hex: string;
  binary: string;
  bitLength: number;
  digitCount: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <CopyButton value={value} />
      </div>
      <p className="break-all font-mono text-xs leading-relaxed text-slate-300">{value}</p>
    </div>
  );
}

export function NumberFormatsPanel({
  decimal,
  hex,
  binary,
  bitLength,
  digitCount,
}: NumberFormatsPanelProps) {
  return (
    <div className="glass-panel p-4">
      <div className="mb-2 flex flex-wrap gap-2">
        <span className="chip">{digitCount.toLocaleString()} decimal digits</span>
        <span className="chip">{bitLength.toLocaleString()} bits</span>
      </div>
      <div className="max-h-72 divide-y divide-white/5 overflow-y-auto pr-1">
        <Row label="Decimal" value={decimal} />
        <Row label="Hexadecimal" value={`0x${hex}`} />
        <Row label="Binary" value={`0b${binary}`} />
      </div>
    </div>
  );
}
