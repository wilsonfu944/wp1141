import { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const ImageCarousel = styled('div')({
  width: '100%',
  height: '500px',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
});

const CarouselImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
  transition: 'opacity 1s ease-in-out'
});

const images = [
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&h=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&h=600&auto=format&fit=crop&q=80'
];

const HomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Container>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
          🇯🇵 日本旅遊行程規劃平台
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          規劃您的完美日本之旅
        </Typography>

        <ImageCarousel>
          {images.map((img, index) => (
            <CarouselImage
              key={index}
              src={img}
              alt={`日本風景 ${index + 1}`}
              sx={{
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 1 : 0
              }}
            />
          ))}
        </ImageCarousel>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 4 }}>
          <Paper sx={{ p: 3, minWidth: '200px', textAlign: 'center' }}>
            <Typography variant="h6" color="primary">🗺️ 探索景點</Typography>
            <Typography variant="body2" color="text.secondary">
              搜尋並收藏日本各地景點
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, minWidth: '200px', textAlign: 'center' }}>
            <Typography variant="h6" color="primary">✈️ 規劃行程</Typography>
            <Typography variant="body2" color="text.secondary">
              建立多天旅遊行程
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, minWidth: '200px', textAlign: 'center' }}>
            <Typography variant="h6" color="primary">📍 標記路線</Typography>
            <Typography variant="body2" color="text.secondary">
              在地圖上規劃路線
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
