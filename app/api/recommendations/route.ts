import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const sections: any[] = [];

    // 1. Based on Your Interests (from enrolled courses)
    const enrolledCourses = await prisma.enrollment.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          select: {
            categoryId: true,
            difficulty: true,
          },
        },
      },
      distinct: ['courseId'],
    });

    const enrolledCategories = [...new Set(enrolledCourses.map(e => e.course.categoryId))];

    if (enrolledCategories.length > 0) {
      const enrolledCourseIds = enrolledCourses.map(e => e.courseId);

      const interestBasedCourses = await prisma.course.findMany({
        where: {
          published: true,
          categoryId: {
            in: enrolledCategories,
          },
          id: {
            notIn: enrolledCourseIds,
          },
        },
        include: {
          creator: {
            select: {
              name: true,
              avatar: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          totalViews: 'desc',
        },
        take: 6,
      });

      if (interestBasedCourses.length > 0) {
        sections.push({
          title: 'Based on Your Interests',
          courses: interestBasedCourses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            slug: course.slug,
            category: course.category.name,
            difficulty: course.difficulty,
            cpdHours: course.cpdHours,
            price: course.price,
            creatorName: course.creator?.name,
            creatorAvatar: course.creator?.avatar,
            reason: 'Your interests',
          })),
        });
      }
    }

    // 2. From Followed Creators
    const followedCreators = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    if (followedCreators.length > 0) {
      const enrolledCourseIds = enrolledCourses.map(e => e.courseId);
      const creatorIds = followedCreators.map(f => f.followingId);

      const creatorCourses = await prisma.course.findMany({
        where: {
          published: true,
          creatorId: {
            in: creatorIds,
          },
          id: {
            notIn: enrolledCourseIds,
          },
        },
        include: {
          creator: {
            select: {
              name: true,
              avatar: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 6,
      });

      if (creatorCourses.length > 0) {
        sections.push({
          title: 'From Creators You Follow',
          courses: creatorCourses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            slug: course.slug,
            category: course.category.name,
            difficulty: course.difficulty,
            cpdHours: course.cpdHours,
            price: course.price,
            creatorName: course.creator?.name,
            creatorAvatar: course.creator?.avatar,
            reason: 'Following',
          })),
        });
      }
    }

    // 3. Popular This Week (most views in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const popularCourses = await prisma.course.findMany({
      where: {
        published: true,
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        creator: {
          select: {
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        totalViews: 'desc',
      },
      take: 6,
    });

    if (popularCourses.length > 0) {
      sections.push({
        title: 'Popular This Week',
        courses: popularCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          slug: course.slug,
          category: course.category.name,
          difficulty: course.difficulty,
          cpdHours: course.cpdHours,
          price: course.price,
          creatorName: course.creator?.name,
          creatorAvatar: course.creator?.avatar,
          reason: 'Trending',
        })),
      });
    }

    // 4. New Releases (published in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrolledCourseIds = enrolledCourses.map(e => e.courseId);

    const newCourses = await prisma.course.findMany({
      where: {
        published: true,
        publishedAt: {
          gte: thirtyDaysAgo,
        },
        id: {
          notIn: enrolledCourseIds,
        },
      },
      include: {
        creator: {
          select: {
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 6,
    });

    if (newCourses.length > 0) {
      sections.push({
        title: 'New Releases',
        courses: newCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          slug: course.slug,
          category: course.category.name,
          difficulty: course.difficulty,
          cpdHours: course.cpdHours,
          price: course.price,
          creatorName: course.creator?.name,
          creatorAvatar: course.creator?.avatar,
          reason: 'New',
        })),
      });
    }

    // If no personalized recommendations, show general popular courses
    if (sections.length === 0) {
      const generalCourses = await prisma.course.findMany({
        where: {
          published: true,
        },
        include: {
          creator: {
            select: {
              name: true,
              avatar: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          totalViews: 'desc',
        },
        take: 6,
      });

      sections.push({
        title: 'Popular Courses',
        courses: generalCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          slug: course.slug,
          category: course.category.name,
          difficulty: course.difficulty,
          cpdHours: course.cpdHours,
          price: course.price,
          creatorName: course.creator?.name,
          creatorAvatar: course.creator?.avatar,
          reason: 'Popular',
        })),
      });
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
