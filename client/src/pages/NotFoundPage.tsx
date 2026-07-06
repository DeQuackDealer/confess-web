import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer>
      <div className="glass-panel flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-5xl">404</p>
        <p className="text-slate-400">This page doesn&apos;t compute.</p>
        <Link to="/" className="btn-primary mt-2">
          Back home
        </Link>
      </div>
    </PageContainer>
  );
}
