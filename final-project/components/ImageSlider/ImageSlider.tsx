import ReactCompareImage from 'react-compare-image';

interface ImageSliderProps {
  leftImage: string;
  rightImage: string;
  leftImageLabel?: string;
  rightImageLabel?: string;
}

export default function ImageSlider({
  leftImage,
  rightImage,
  leftImageLabel = '動畫截圖',
  rightImageLabel = '真實照片',
}: ImageSliderProps) {
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg">
      <ReactCompareImage
        leftImage={leftImage}
        rightImage={rightImage}
        leftImageLabel={leftImageLabel}
        rightImageLabel={rightImageLabel}
        sliderLineWidth={3}
        sliderLineColor="#f472b6"
        handleSize={40}
        hover={true}
      />
    </div>
  );
}


