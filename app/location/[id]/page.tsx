import LocationDetailPage from '@/components/LocationDetailPage';

export default async function LocationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocationDetailPage locationId={id} />;
}

