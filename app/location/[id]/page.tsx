import LocationDetailPage from '@/components/LocationDetailPage';

export default function LocationDetail({ params }: { params: { id: string } }) {
  return <LocationDetailPage locationId={params.id} />;
}

