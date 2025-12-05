import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useItineraryCart } from '../../context/ItineraryCartContext';

export default function CartButton() {
  const { totalItems } = useItineraryCart();

  if (totalItems === 0) return null;

  return (
    <Link
      to="/plan"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-6 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-white text-pink-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      </div>
      <span className="font-medium hidden sm:inline group-hover:inline">
        巡禮清單
      </span>
    </Link>
  );
}


