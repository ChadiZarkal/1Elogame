import { Loading } from '@/components/ui/Loading';

export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
      <Loading size="lg" text="Chargement..." />
    </div>
  );
}
