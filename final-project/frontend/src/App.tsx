import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ItineraryCartProvider } from './context/ItineraryCartContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import PlanPage from './pages/PlanPage';
import ItineraryDetailPage from './pages/ItineraryDetailPage';
import MyItinerariesPage from './pages/MyItinerariesPage';
import ExploreItinerariesPage from './pages/ExploreItinerariesPage';
import AnimeListPage from './pages/AnimeListPage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import LocationDetailPage from './pages/LocationDetailPage';
import ForumPage from './pages/ForumPage';
import ForumPostPage from './pages/ForumPostPage';
import NewForumPostPage from './pages/NewForumPostPage';
import MessagesPage from './pages/MessagesPage';
import FriendsPage from './pages/FriendsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ItineraryCartProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/animes" element={<AnimeListPage />} />
            <Route path="/animes/:id" element={<AnimeDetailPage />} />
            <Route path="/locations/:id" element={<LocationDetailPage />} />
            <Route path="/itineraries/:id" element={<ItineraryDetailPage />} />
            <Route path="/profile/itineraries" element={<MyItinerariesPage />} />
            <Route path="/explore/itineraries" element={<ExploreItinerariesPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/new" element={<NewForumPostPage />} />
            <Route path="/forum/:id" element={<ForumPostPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
        </ItineraryCartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
