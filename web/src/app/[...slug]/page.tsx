import ResQGraphApp from '../ResQGraphApp';
import { pathToNavViewId } from '@/lib/routes';

export const dynamic = 'force-dynamic';

export default async function CatchAllSlugPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const slugArray = resolvedParams?.slug ?? [];
  const rawPath = slugArray.join('/');
  const targetView = pathToNavViewId(rawPath);

  return <ResQGraphApp initialView={targetView} initialPath={rawPath} />;
}
