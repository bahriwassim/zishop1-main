import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Hotel, MapPin } from "lucide-react";

interface RoomNumberModalProps {
  isOpen: boolean;
  hotelName: string;
  clientName: string;
  onConfirm: (roomNumber: string) => void;
  onCancel: () => void;
}

export default function RoomNumberModal({ 
  isOpen, 
  hotelName, 
  clientName, 
  onConfirm, 
  onCancel 
}: RoomNumberModalProps) {
  const [roomNumber, setRoomNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!roomNumber.trim()) {
      toast({
        title: "Numéro de chambre requis",
        description: "Veuillez renseigner votre numéro de chambre",
        variant: "destructive",
      });
      return;
    }

    if (roomNumber.trim().length < 1) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez saisir un numéro de chambre valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate validation
    setTimeout(() => {
      setIsLoading(false);
      onConfirm(roomNumber.trim());
      setRoomNumber(""); // Reset for next time
    }, 500);
  };

  const handleCancel = () => {
    setRoomNumber("");
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Hotel className="text-blue-600" size={24} />
          </div>
          <DialogTitle className="text-center text-xl">
            Numéro de chambre
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Pour finaliser votre commande au <strong>{hotelName}</strong>, 
            veuillez renseigner votre numéro de chambre.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-800">
              <MapPin size={16} />
              <span className="text-sm">
                Livraison pour <strong>{clientName}</strong>
              </span>
            </div>
          </div>

          {/* Room Number Input */}
          <div className="space-y-2">
            <Label htmlFor="roomNumber" className="text-sm font-medium text-gray-700">
              Numéro de chambre
            </Label>
            <div className="relative">
              <Hotel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="roomNumber"
                type="text"
                placeholder="Ex: 205, 312A..."
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-500 text-center"
                autoFocus
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Votre commande sera livrée à la réception de l'hôtel
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Validation..." : "Confirmer"}
            </Button>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-xs text-yellow-800">
            <strong>Info :</strong> Les livraisons se font uniquement à la réception de l'hôtel. 
            Vous serez notifié par SMS/email quand votre commande arrivera.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 