import { useState } from 'react';
import { Bell, X, Check, AlertCircle, Package, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNotifications, type Notification } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

interface NotificationsPanelProps {
  userType: string;
  entityId?: number;
  userId?: number;
}

export function NotificationsPanel({ userType, entityId, userId }: NotificationsPanelProps) {
  const { notifications, isConnected, markAsRead, clearAll, unreadCount } = useNotifications(userType, entityId, userId);
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'order_confirmed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'order_delivered':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'order_update':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
        return 'border-l-blue-500 bg-blue-50';
      case 'order_confirmed':
        return 'border-l-green-500 bg-green-50';
      case 'order_delivered':
        return 'border-l-purple-500 bg-purple-50';
      case 'order_update':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              <div className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
            </span>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 text-sm text-muted-foreground">
          {isConnected ? 'Connecté - Notifications en temps réel' : 'Déconnecté'}
        </div>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <Card 
                  key={`${notification.timestamp}-${index}`}
                  className={cn(
                    "p-3 border-l-4 cursor-pointer hover:bg-muted/50 transition-colors",
                    getNotificationColor(notification.type)
                  )}
                  onClick={() => markAsRead(index)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      {notification.orderNumber && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.orderNumber}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Connection Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={cn(
            "flex items-center gap-2 text-xs p-2 rounded",
            isConnected 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {isConnected ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Notifications activées
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Reconnexion...
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 