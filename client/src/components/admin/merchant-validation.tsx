import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MapPin, Store, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Merchant {
  id: number;
  name: string;
  address: string;
  category: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  products: any[];
}

export function MerchantValidation() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadMerchants = async () => {
    try {
      const response = await fetch('/api/merchants');
      if (response.ok) {
        const data = await response.json();
        setMerchants(data);
      }
    } catch (error) {
      console.error('Erreur chargement commerçants:', error);
      toast.error('Erreur lors du chargement des commerçants');
    } finally {
      setLoading(false);
    }
  };

  const validateMerchant = async (merchantId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/merchants/${merchantId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          note: rejectionReason
        }),
      });

      if (response.ok) {
        toast.success(`Commerçant ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`);
        setRejectionReason('');
        setSelectedMerchant(null);
        loadMerchants();
      } else {
        throw new Error('Erreur lors de la validation');
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingMerchants = merchants.filter(m => m.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Commerçants en attente de validation</h3>
        <Badge variant="outline">{pendingMerchants.length} en attente</Badge>
      </div>

      {pendingMerchants.length === 0 ? (
        <div className="text-center py-8">
          <Store className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Aucun commerçant en attente de validation</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingMerchants.map((merchant) => (
            <Card key={merchant.id} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Store className="mr-2 h-5 w-5" />
                    {merchant.name}
                  </CardTitle>
                  <Badge variant="outline">En attente</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Détails du commerçant</h4>
                    <p><span className="font-medium">Catégorie:</span> {merchant.category}</p>
                    <p><span className="font-medium">Description:</span> {merchant.description || 'Aucune description'}</p>
                    <div className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      <p className="text-gray-600">{merchant.address}</p>
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
                        onClick={() => validateMerchant(merchant.id, 'reject')}
                        className="text-red-600 hover:text-red-700"
                        disabled={!rejectionReason}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeter
                      </Button>
                      <Button
                        onClick={() => validateMerchant(merchant.id, 'approve')}
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