import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Shield, Building, Store, Eye, EyeOff } from 'lucide-react';

interface AdminUserFormProps {
  hotels: any[];
  merchants: any[];
}

export function AdminUserForm({ hotels, merchants }: AdminUserFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    entityId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userData = {
        ...formData,
        entityId: formData.entityId ? parseInt(formData.entityId) : null,
      };

      console.log('Création d\'utilisateur:', userData);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();
      console.log('Réponse du serveur:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Erreur ${response.status}`);
      }

      toast.success('Utilisateur créé avec succès');
      setFormData({ username: '', password: '', role: '', entityId: '' });
      loadUsers();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(`Erreur: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="text-primary" />
            Créer un accès utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Nom d'utilisateur *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="admin_paris"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Rôle *</Label>
                <Select 
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value, entityId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield size={16} />
                        Administrateur Global
                      </div>
                    </SelectItem>
                    <SelectItem value="hotel">
                      <div className="flex items-center gap-2">
                        <Building size={16} />
                        Gestionnaire Hôtel
                      </div>
                    </SelectItem>
                    <SelectItem value="merchant">
                      <div className="flex items-center gap-2">
                        <Store size={16} />
                        Gestionnaire Commerçant
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.role === 'hotel' || formData.role === 'merchant') && (
              <div>
                <Label>
                  {formData.role === 'hotel' ? 'Hôtel assigné *' : 'Commerçant assigné *'}
                </Label>
                <Select 
                  value={formData.entityId}
                  onValueChange={(value) => setFormData({ ...formData, entityId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Sélectionner ${formData.role === 'hotel' ? 'un hôtel' : 'un commerçant'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.role === 'hotel' ? hotels : merchants).map((entity) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                  Générer
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mot de passe sécurisé"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <UserPlus className="mr-2" size={16} />
              {isSubmitting ? 'Création...' : 'Créer l\'accès'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs existants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun utilisateur</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{user.username}</h4>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 