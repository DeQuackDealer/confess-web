import { useState } from 'react';
import { copyToClipboard } from '../../lib/clipboard';
import { useToast } from './Toast';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { show } = useToast();

  async function handleClick() {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } else {
      show('Could not copy to clipboard.', 'error');
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-ghost !px-2 !py-1 text-xs ${className}`}
    >
      {copied ? 'Copied ✓' : label}
    </button>
  );
}
