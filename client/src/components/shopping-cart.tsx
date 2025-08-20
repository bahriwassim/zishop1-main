import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, X } from "lucide-react";
import type { Product } from "@shared/schema";

interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export default function ShoppingCartComponent({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: ShoppingCartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Persistance du panier dans le localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-yellow-50 border-t border-blue-200">
      <div
        className="flex items-center justify-between cursor-pointer transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <ShoppingCart className="text-blue-600" size={20} />
          <span className="font-medium text-blue-800">Panier</span>
          <Badge className="bg-yellow-500 text-blue-900 text-xs">
            {totalItems}
          </Badge>
        </div>
        <div className="text-right">
          <p className="font-semibold text-yellow-600">{totalPrice.toFixed(2)}€</p>
          <p className="text-xs text-blue-600">Livraison incluse</p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex-1">
                <h6 className="font-medium text-sm text-blue-800">{item.name}</h6>
                <p className="text-xs text-blue-600">{item.price}€ chacun</p>
                {typeof item.stock === 'number' && (
                  <div style={{ fontSize: '0.9em', color: item.stock === 0 ? 'red' : '#555' }}>
                    Stock restant : {item.stock}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus size={12} />
                </Button>
                <span className="text-sm font-medium w-8 text-center text-blue-800">
                  {item.quantity}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
                >
                  <X size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={onCheckout}
        className="w-full mt-3 bg-yellow-500 hover:bg-yellow-400 text-blue-900 py-3 rounded-lg font-medium shadow-lg"
      >
        Commander
      </Button>
    </div>
  );
}
