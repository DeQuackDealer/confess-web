import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { IntegerInputPanel } from '../components/home/IntegerInputPanel';
import { ExplanationSection } from '../components/home/ExplanationSection';
import { BitmapViewer } from '../components/bitmap/BitmapViewer';
import { NumberFormatsPanel } from '../components/bitmap/NumberFormatsPanel';
import { HiddenMessage } from '../components/bitmap/HiddenMessage';
import { Spinner } from '../components/common/Spinner';
import { useRender } from '../hooks/useRender';
import { getIntegerFromUrl, setIntegerInUrl, buildShareUrl } from '../lib/share';
import { getHistory, pushHistory, type HistoryEntry } from '../lib/history';
import { CopyButton } from '../components/common/CopyButton';

export function HomePage() {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { result, loading, error, render } = useRender();

  useEffect(() => {
    setHistory(getHistory());
    const fromUrl = getIntegerFromUrl();
    if (fromUrl) {
      setValue(fromUrl);
      void generate(fromUrl);
    }
  }, []);

  async function generate(raw?: string) {
    const integer = (raw ?? value).trim();
    if (!integer) return;
    const data = await render(integer);
    if (data) {
      setIntegerInUrl(integer);
      setHistory(pushHistory(integer));
    }
  }

  return (
    <PageContainer>
      <div className="mb-8 animate-fade-in text-center">
        <h1 className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl [html.light_&]:from-slate-900 [html.light_&]:to-slate-500">
          RileysCrush
        </h1>
        <p className="mt-2 text-sm text-slate-400">«Turning impossibly large integers into art.»</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <IntegerInputPanel
            value={value}
            onChange={setValue}
            onGenerate={() => generate()}
            loading={loading}
          />

          {history.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs text-slate-500">Recent:</span>
              {history.slice(0, 8).map((h) => (
                <button
                  key={h.integer}
                  onClick={() => {
                    setValue(h.integer);
                    void generate(h.integer);
                  }}
                  className="chip max-w-[10rem] truncate font-mono hover:bg-white/10"
                  title={h.integer}
                >
                  {h.integer.length > 18 ? `${h.integer.slice(0, 18)}…` : h.integer}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="animate-fade-in rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Spinner className="h-4 w-4" /> Rendering bitmap…
            </div>
          )}

          {result && (
            <>
              <BitmapViewer grid={result.grid} />
              {result.hidden.found && result.hidden.message && (
                <HiddenMessage message={result.hidden.message} />
              )}
            </>
          )}

          <ExplanationSection />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {result && (
            <>
              <NumberFormatsPanel
                decimal={result.decimal}
                hex={result.hex}
                binary={result.binary}
                bitLength={result.bitLength}
                digitCount={result.digitCount}
              />
              <div className="glass-panel flex items-center justify-between p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Shareable link
                  </p>
                  <p className="mt-1 max-w-[16rem] truncate font-mono text-xs text-slate-400">
                    {buildShareUrl(result.decimal)}
                  </p>
                </div>
                <CopyButton value={buildShareUrl(result.decimal)} label="Copy link" />
              </div>
            </>
          )}
          {!result && !loading && (
            <div className="glass-panel p-4 text-sm text-slate-400">
              Generate a bitmap to see its decimal, hexadecimal, and binary forms here, plus a
              shareable link.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
