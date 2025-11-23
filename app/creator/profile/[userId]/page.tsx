import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import FollowButton from '@/components/FollowButton';

interface CreatorProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const { userId } = await params;
  const session = await auth();

  const creator = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      createdCourses: {
        where: { published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          cpdHours: true,
          difficulty: true,
          totalViews: true,
          createdAt: true,
        },
      },
      publications: {
        where: { published: true },
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          totalViews: true,
          createdAt: true,
        },
      },
      followers: {
        select: { id: true },
      },
    },
  });

  if (!creator || !creator.isCreator || creator.creatorStatus !== 'APPROVED') {
    notFound();
  }

  // Calculate real total views from courses and publications
  const coursesViews = creator.createdCourses.reduce((sum, course) => sum + course.totalViews, 0);
  const publicationsViews = creator.publications.reduce((sum, pub) => sum + pub.totalViews, 0);
  const totalViews = coursesViews + publicationsViews;
  const totalCourses = creator.createdCourses.length;
  const totalFollowers = creator.followers.length;

  // Check if current user is following this creator
  let isFollowing = false;
  if (session?.user?.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });
    isFollowing = !!follow;
  }

  const socialLinks = creator.socialLinks as { twitter?: string; linkedin?: string; website?: string } | null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {creator.avatar ? (
                <img
                  src={creator.avatar}
                  alt={creator.name || 'Creator'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-200">
                  <span className="text-4xl font-bold text-blue-600">
                    {creator.name?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {creator.name}
              </h1>

              {creator.specialty && (
                <p className="text-lg text-gray-600 mb-2">{creator.specialty}</p>
              )}

              {creator.institution && (
                <p className="text-sm text-gray-500 mb-4">
                  {creator.institution}
                  {creator.country && ` • ${creator.country}`}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{totalCourses}</span>
                  <span className="text-sm text-gray-600 ml-2">Courses</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">{totalViews}</span>
                  <span className="text-sm text-gray-600 ml-2">Views</span>
                </div>
              </div>

              {/* Follow Button */}
              {session?.user?.id && session.user.id !== userId && (
                <FollowButton
                  creatorId={userId}
                  initialFollowing={isFollowing}
                  initialFollowerCount={totalFollowers}
                />
              )}

              {/* Show follower count for own profile or when not logged in */}
              {(!session?.user?.id || session.user.id === userId) && (
                <div className="text-gray-600 mb-4">
                  <span className="font-semibold text-gray-900">{totalFollowers}</span>{' '}
                  {totalFollowers === 1 ? 'Follower' : 'Followers'}
                </div>
              )}

              {/* Social Links */}
              {socialLinks && (
                <div className="flex gap-4 mt-4">
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-500"
                    >
                      Twitter
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      LinkedIn
                    </a>
                  )}
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-700"
                    >
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {creator.bio && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{creator.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Courses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Courses</h2>
          {creator.createdCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creator.createdCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{course.cpdHours} CPD Hours</span>
                      <span className="text-gray-500">{course.difficulty}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No published courses yet.</p>
          )}
        </div>

        {/* Publications */}
        {creator.publications.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Publications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creator.publications.map((publication) => (
                <div
                  key={publication.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {publication.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {publication.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    {publication.totalViews} views
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
