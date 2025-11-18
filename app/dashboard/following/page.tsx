import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FollowingList from './FollowingList';
import Link from 'next/link';

export default async function FollowingPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch followed creators
  const following = await prisma.follow.findMany({
    where: {
      followerId: session.user.id,
    },
    select: {
      following: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          specialty: true,
          bio: true,
          createdCourses: {
            where: {
              published: true,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              createdAt: true,
              thumbnail: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get course counts for each creator
  const creatorsWithCounts = await Promise.all(
    following.map(async (follow) => {
      const courseCount = await prisma.course.count({
        where: {
          creatorId: follow.following.id,
          published: true,
        },
      });

      return {
        id: follow.following.id,
        name: follow.following.name || 'Unknown',
        avatar: follow.following.avatar,
        specialty: follow.following.specialty || 'General',
        bio: follow.following.bio,
        courseCount,
        latestCourse: follow.following.createdCourses[0] || null,
        followedAt: follow.createdAt,
      };
    })
  );

  // Fetch recent activity from followed creators (latest courses)
  const recentActivity = await prisma.course.findMany({
    where: {
      creatorId: {
        in: following.map((f) => f.following.id),
      },
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnail: true,
      createdAt: true,
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Following</h1>
        <p className="text-gray-600 mt-2">
          Creators you follow and their latest content
        </p>
      </div>

      {creatorsWithCounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Not following anyone yet
          </h2>
          <p className="text-gray-600 mb-6">
            Discover talented creators and stay updated with their latest courses
          </p>
          <Link
            href="/courses"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Discover Creators
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Following List */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Following ({creatorsWithCounts.length})
              </h2>
            </div>
            <FollowingList initialCreators={creatorsWithCounts} />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No recent activity from creators you follow
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">📚</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {course.creator?.name || 'Unknown Creator'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
