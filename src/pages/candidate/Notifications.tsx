import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Bell, CheckCircle, MessageSquare, Briefcase, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationAsRead } from '@/lib/supabase';
import { Notification } from '../../types';

export const CandidateNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const notifs = await getNotifications(user.id);
        setNotifications(notifs);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Briefcase className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'job_match':
        return <CheckCircle className="w-5 h-5" />;
      case 'verification':
        return <Shield className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-primary/10 text-primary';
      case 'message':
        return 'bg-green-100 text-green-600';
      case 'job_match':
        return 'bg-purple-100 text-purple-600';
      case 'verification':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-3xl">Notifications</CardTitle>
            {unreadCount > 0 && (
              <CardDescription className="mt-2">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''} notification{unreadCount > 1 ? 's' : ''}
              </CardDescription>
            )}
          </div>
        </div>

        <Card>
          {loading ? (
            <CardContent className="pt-6 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des notifications...</p>
            </CardContent>
          ) : notifications.length === 0 ? (
            <CardContent className="pt-6 text-center py-12">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune notification</p>
            </CardContent>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification, idx) => (
                <div key={notification.id}>
                  <CardContent
                    className={`p-6 hover:bg-muted/50 transition cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(
                          notification.type
                        )}`}
                      >
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-lg">{notification.title}</CardTitle>
                          {!notification.read && (
                            <Badge variant="default" className="h-2 w-2 p-0 rounded-full"></Badge>
                          )}
                        </div>
                        <CardDescription className="mb-2">{notification.message}</CardDescription>
                        <CardDescription className="text-xs">
                          {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </CardDescription>
                        {notification.link && (
                          <Button variant="link" asChild className="p-0 h-auto mt-2">
                            <a href={notification.link}>Voir plus →</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  {idx < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
