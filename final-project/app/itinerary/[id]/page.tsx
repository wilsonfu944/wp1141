import ItineraryDetailPage from '@/components/ItineraryDetailPage';

export default function ItineraryDetail({ params }: { params: { id: string } }) {
  return <ItineraryDetailPage itineraryId={params.id} />;
}

