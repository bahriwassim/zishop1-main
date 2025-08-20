import { Star, ChevronRight } from "lucide-react";
import type { Merchant } from "@shared/schema";

interface MerchantCardProps {
  merchant: Merchant;
  distance?: number;
  onClick: () => void;
}

export default function MerchantCard({ merchant, distance, onClick }: MerchantCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 fill-yellow-500/50 text-yellow-500" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center p-3 bg-yellow-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-yellow-100 hover:border-yellow-300 transition-all"
    >
      {merchant.imageUrl && (
        <img
          src={merchant.imageUrl}
          alt={merchant.name}
          className="w-12 h-12 rounded-lg object-cover border border-blue-200"
        />
      )}
      <div className="ml-3 flex-1">
        <h5 className="font-medium text-blue-800">{merchant.name}</h5>
        <p className="text-xs text-blue-600">
          {distance ? `${distance.toFixed(1)} km` : ""} • 
          <span className={`ml-1 ${merchant.isOpen ? "text-yellow-600" : "text-red-500"}`}>
            {merchant.isOpen ? "Ouvert" : "Fermé"}
          </span>
        </p>
        <div className="flex items-center mt-1">
          <div className="flex">
            {renderStars(parseFloat(merchant.rating))}
          </div>
          <span className="text-xs text-blue-500 ml-1">({merchant.rating})</span>
        </div>
      </div>
      <ChevronRight className="text-blue-400" size={16} />
    </div>
  );
}
