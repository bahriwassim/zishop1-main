import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MapPin, Building, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface Hotel {
  id: number;
  name: string;
  address: string;
  code: string;
  qr_code: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function HotelValidation() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadHotels = async () => {
    try {
      const response = await fetch('/api/hotels');
      if (response.ok) {
        const data = await response.json();
        setHotels(data);
      }
    } catch (error) {
      console.error('Erreur chargement hôtels:', error);
      toast.error('Erreur lors du chargement des hôtels');
    } finally {
      setLoading(false);
    }
  };

  const validateHotel = async (hotelId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          note: rejectionReason
        }),
      });

      if (response.ok) {
        toast.success(`Hôtel ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`);
        setRejectionReason('');
        loadHotels();
      } else {
        throw new Error('Erreur lors de la validation');
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingHotels = hotels.filter(h => h.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hôtels en attente de validation</h3>
        <Badge variant="outline">{pendingHotels.length} en attente</Badge>
      </div>

      {pendingHotels.length === 0 ? (
        <div className="text-center py-8">
          <Building className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Aucun hôtel en attente de validation</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingHotels.map((hotel) => (
            <Card key={hotel.id} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    {hotel.name}
                  </CardTitle>
                  <Badge variant="outline">En attente</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Détails de l'hôtel</h4>
                    <p><span className="font-medium">Code:</span> {hotel.code}</p>
                    <div className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      <p className="text-gray-600">{hotel.address}</p>
                    </div>
                    <div className="flex items-center mt-2">
                      <QrCode className="h-4 w-4 mr-1 text-gray-500" />
                      <p className="text-gray-600 text-sm">{hotel.qr_code}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      placeholder="Raison du rejet (obligatoire si rejet)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => validateHotel(hotel.id, 'reject')}
                        className="text-red-600 hover:text-red-700"
                        disabled={!rejectionReason}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeter
                      </Button>
                      <Button
                        onClick={() => validateHotel(hotel.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approuver
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 