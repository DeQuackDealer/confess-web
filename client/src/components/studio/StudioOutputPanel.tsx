import type { BitGrid } from '@shared/tupper';
import { formatInteger } from '@shared/tupper';
import { CopyButton } from '../common/CopyButton';
import { downloadTextFile, gridToPngBlob, downloadBlob } from '../../lib/exportBitmap';

interface StudioOutputPanelProps {
  integer: bigint;
  grid: BitGrid;
}

export function StudioOutputPanel({ integer, grid }: StudioOutputPanelProps) {
  const formats = formatInteger(integer);

  async function handleExportPng() {
    const blob = await gridToPngBlob(grid, 10);
    downloadBlob(blob, 'rileyscrush-studio.png');
  }

  function handleDownloadTxt() {
    downloadTextFile(formats.decimal, 'rileyscrush-integer.txt');
  }

  return (
    <div className="glass-panel flex flex-col gap-3 p-4">
      <div className="flex flex-wrap gap-2">
        <span className="chip">{formats.digitCount.toLocaleString()} digits</span>
        <span className="chip">{formats.bitLength.toLocaleString()} bits</span>
      </div>

      {(
        [
          ['Decimal', formats.decimal],
          ['Hexadecimal', `0x${formats.hex}`],
          ['Binary', `0b${formats.binary}`],
        ] as const
      ).map(([label, val]) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </span>
            <CopyButton value={val} />
          </div>
          <p className="max-h-24 overflow-y-auto break-all rounded-lg bg-black/30 p-2 font-mono text-xs text-slate-300">
            {val}
          </p>
        </div>
      ))}

      <div className="mt-1 flex flex-wrap gap-2">
        <button className="btn-secondary text-xs" onClick={handleDownloadTxt}>
          Download .txt
        </button>
        <button className="btn-secondary text-xs" onClick={handleExportPng}>
          Export PNG
        </button>
      </div>
    </div>
  );
}
