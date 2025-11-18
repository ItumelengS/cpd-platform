import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotificationsList from './NotificationsList';

export default async function NotificationsPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated with your latest activity</p>
      </div>

      <NotificationsList />
    </div>
  );
}
