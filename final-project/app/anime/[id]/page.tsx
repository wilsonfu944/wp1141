import AnimeDetailPage from '@/components/AnimeDetailPage';

export default function AnimeDetail({ params }: { params: { id: string } }) {
  return <AnimeDetailPage animeId={params.id} />;
}

