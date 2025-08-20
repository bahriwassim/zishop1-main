import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, Users } from 'lucide-react';

export function SimpleUserForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Création utilisateur:', formData);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('Réponse serveur:', result);

      if (response.ok) {
        toast.success('Utilisateur créé avec succès');
        setFormData({ username: '', password: '', role: 'admin' });
      } else {
        throw new Error(result.message || 'Erreur de création');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary" />
          Test Création Utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="admin_test"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="secure123"
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Rôle</Label>
            <Select 
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="hotel">Gestionnaire Hôtel</SelectItem>
                <SelectItem value="merchant">Gestionnaire Commerçant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <UserPlus className="mr-2" size={16} />
            {isSubmitting ? 'Création...' : 'Créer Utilisateur'}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <strong>Note :</strong> Cette fonctionnalité teste l'endpoint API. 
          Les utilisateurs créés seront visibles dans les logs du serveur.
        </div>
      </CardContent>
    </Card>
  );
} 