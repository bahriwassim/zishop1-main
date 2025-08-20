import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Key, Shield, Building, Store, Eye, EyeOff, Trash2, Edit } from 'lucide-react';

const userSchema = z.object({
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['admin', 'hotel', 'merchant'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un rôle' })
  }),
  entityId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: number;
  username: string;
  role: string;
  entityId?: number;
  createdAt: string;
}

interface UserManagementProps {
  hotels: any[];
  merchants: any[];
}

export function UserManagement({ hotels, merchants }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      password: '',
      role: undefined,
      entityId: '',
    },
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('password', password);
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      const userData = {
        username: data.username,
        password: data.password,
        role: data.role,
        entityId: data.entityId ? parseInt(data.entityId) : null,
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

      toast.success('Utilisateur créé avec succès', {
        description: `Accès ${data.role} créé pour ${data.username}`,
      });

      form.reset();
      setShowForm(false);
      setSelectedRole('');
      // Rafraîchir la liste des utilisateurs
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
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
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Utilisateur supprimé');
        loadUsers();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="text-purple-600" size={16} />;
      case 'hotel': return <Building className="text-blue-600" size={16} />;
      case 'merchant': return <Store className="text-green-600" size={16} />;
      default: return <Key className="text-gray-600" size={16} />;
    }
  };

  const getEntityName = (role: string, entityId?: number) => {
    if (role === 'admin') return 'Admin global';
    if (role === 'hotel' && entityId) {
      const hotel = hotels.find(h => h.id === entityId);
      return hotel ? hotel.name : `Hôtel ID: ${entityId}`;
    }
    if (role === 'merchant' && entityId) {
      const merchant = merchants.find(m => m.id === entityId);
      return merchant ? merchant.name : `Commerçant ID: ${entityId}`;
    }
    return 'Non assigné';
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  if (showForm) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="text-primary" />
            Créer un nouvel accès utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur *</Label>
                <Input
                  id="username"
                  {...form.register('username')}
                  placeholder="admin_hotel_paris"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select 
                  onValueChange={(value) => {
                    form.setValue('role', value as any);
                    setSelectedRole(value);
                  }}
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
                {form.formState.errors.role && (
                  <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
                )}
              </div>
            </div>

            {(selectedRole === 'hotel' || selectedRole === 'merchant') && (
              <div className="space-y-2">
                <Label htmlFor="entityId">
                  {selectedRole === 'hotel' ? 'Hôtel assigné *' : 'Commerçant assigné *'}
                </Label>
                <Select onValueChange={(value) => form.setValue('entityId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Sélectionner ${selectedRole === 'hotel' ? 'un hôtel' : 'un commerçant'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedRole === 'hotel' ? hotels : merchants).map((entity) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name} - {entity.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePassword}
                >
                  Générer
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe sécurisé"
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
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Permissions selon le rôle :</h4>
              <div className="text-sm text-blue-700 space-y-1">
                {selectedRole === 'admin' && (
                  <>
                    <p>• Accès complet à tous les dashboards</p>
                    <p>• Gestion des hôtels, commerçants et produits</p>
                    <p>• Validation des entités</p>
                    <p>• Supervision des commissions</p>
                  </>
                )}
                {selectedRole === 'hotel' && (
                  <>
                    <p>• Accès au dashboard de l'hôtel assigné</p>
                    <p>• Gestion des commandes et réceptions</p>
                    <p>• Suivi des commissions (5%)</p>
                    <p>• Validation des livraisons</p>
                  </>
                )}
                {selectedRole === 'merchant' && (
                  <>
                    <p>• Accès au dashboard du commerçant assigné</p>
                    <p>• Gestion des produits et commandes</p>
                    <p>• Suivi des revenus (75%)</p>
                    <p>• Workflow des commandes</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  form.reset();
                  setSelectedRole('');
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                <UserPlus className="mr-2" size={16} />
                {isSubmitting ? 'Création...' : 'Créer l\'accès'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-primary" />
            Gestion des Accès Utilisateurs
          </CardTitle>
          <Button onClick={() => setShowForm(true)} className="bg-primary">
            <UserPlus className="mr-2" size={16} />
            Nouvel accès
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Key className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Aucun utilisateur enregistré</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Créer le premier accès
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getRoleIcon(user.role)}
                    <div>
                      <h4 className="font-medium text-gray-800">{user.username}</h4>
                      <p className="text-sm text-gray-600">{getEntityName(user.role, user.entityId)}</p>
                      <p className="text-xs text-gray-500">
                        Créé le {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`${
                        user.role === 'admin' ? 'bg-purple-500' :
                        user.role === 'hotel' ? 'bg-blue-500' : 'bg-green-500'
                      } text-white text-xs`}
                    >
                      {user.role === 'admin' ? 'Admin' : 
                       user.role === 'hotel' ? 'Hôtel' : 'Commerçant'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Edit size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 