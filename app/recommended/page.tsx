import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import RecommendedContent from './RecommendedContent';

export const metadata: Metadata = {
  title: 'Recommended For You | CPD Platform',
  description: 'Personalized course recommendations based on your interests and activity',
};

export default async function RecommendedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/recommended');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recommended For You
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover courses and content tailored to your interests, learning goals,
            and professional development needs.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <RecommendedContent />
      </div>
    </div>
  );
}
