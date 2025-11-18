import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const RESULTS_PER_PAGE = 12;
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const minHours = searchParams.get('minHours');
    const maxHours = searchParams.get('maxHours');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (!query) {
      return NextResponse.json(
        { results: [], total: 0, page: 1 },
        {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
          },
        }
      );
    }

    const skip = (page - 1) * RESULTS_PER_PAGE;
    const results: any[] = [];
    let total = 0;

    // Search Courses
    if (type === 'all' || type === 'courses') {
      const courseFilters: any = {
        published: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (category) {
        courseFilters.categoryId = category;
      }

      if (difficulty) {
        courseFilters.difficulty = difficulty;
      }

      if (minHours || maxHours) {
        courseFilters.cpdHours = {};
        if (minHours) courseFilters.cpdHours.gte = parseFloat(minHours);
        if (maxHours) courseFilters.cpdHours.lte = parseFloat(maxHours);
      }

      // Get courses with ratings
      let courseOrderBy: any = {};

      if (sort === 'popular') {
        courseOrderBy = { totalViews: 'desc' };
      } else if (sort === 'newest') {
        courseOrderBy = { createdAt: 'desc' };
      } else if (sort === 'price') {
        courseOrderBy = { price: 'asc' };
      } else {
        // Default relevance - order by title match first, then views
        courseOrderBy = { totalViews: 'desc' };
      }

      const courses = await prisma.course.findMany({
        where: courseFilters,
        include: {
          creator: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: courseOrderBy,
        skip: type === 'courses' ? skip : 0,
        take: type === 'courses' ? RESULTS_PER_PAGE : undefined,
      });

      // Calculate average ratings
      const coursesWithRatings = await Promise.all(
        courses.map(async (course) => {
          const ratingData = await prisma.review.aggregate({
            where: { courseId: course.id },
            _avg: { rating: true },
          });

          return {
            ...course,
            avgRating: ratingData._avg.rating || 0,
          };
        })
      );

      // Apply rating filter if specified
      let filteredCourses = coursesWithRatings;
      if (rating && sort === 'rating') {
        const minRating = parseFloat(rating);
        filteredCourses = coursesWithRatings.filter(
          (course) => course.avgRating >= minRating
        );
      }

      // Sort by rating if requested
      if (sort === 'rating') {
        filteredCourses.sort((a, b) => b.avgRating - a.avgRating);
      }

      const courseResults = filteredCourses.map((course) => ({
        id: course.id,
        type: 'course' as const,
        title: course.title,
        description: course.description,
        image: course.thumbnail,
        slug: course.slug,
        category: course.category.name,
        difficulty: course.difficulty,
        cpdHours: course.cpdHours,
        price: course.price,
        rating: course.avgRating,
        totalRatings: course._count.reviews,
        creatorName: course.creator?.name,
      }));

      if (type === 'courses') {
        results.push(...courseResults);
        total = await prisma.course.count({ where: courseFilters });
      } else {
        results.push(...courseResults.slice(0, 4)); // Limit for "all" type
      }
    }

    // Search Creators
    if (type === 'all' || type === 'creators') {
      const creatorFilters: any = {
        isCreator: true,
        creatorStatus: 'APPROVED',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      };

      let creatorOrderBy: any = {};

      if (sort === 'popular') {
        creatorOrderBy = { totalFollowers: 'desc' };
      } else if (sort === 'newest') {
        creatorOrderBy = { createdAt: 'desc' };
      } else {
        creatorOrderBy = { totalFollowers: 'desc' };
      }

      const creators = await prisma.user.findMany({
        where: creatorFilters,
        include: {
          _count: {
            select: {
              createdCourses: true,
              followers: true,
            },
          },
        },
        orderBy: creatorOrderBy,
        skip: type === 'creators' ? skip : 0,
        take: type === 'creators' ? RESULTS_PER_PAGE : undefined,
      });

      const creatorResults = creators.map((creator) => ({
        id: creator.id,
        type: 'creator' as const,
        title: creator.name,
        description: creator.bio || '',
        creatorAvatar: creator.avatar || undefined,
        slug: creator.id,
        specialty: creator.specialty || undefined,
        followers: creator._count.followers,
        courses: creator._count.createdCourses,
      }));

      if (type === 'creators') {
        results.push(...creatorResults);
        total = await prisma.user.count({ where: creatorFilters });
      } else {
        results.push(...creatorResults.slice(0, 4));
      }
    }

    // Search Publications
    if (type === 'all' || type === 'publications') {
      const publicationFilters: any = {
        published: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (category) {
        publicationFilters.categoryId = category;
      }

      let publicationOrderBy: any = {};

      if (sort === 'popular') {
        publicationOrderBy = { totalViews: 'desc' };
      } else if (sort === 'newest') {
        publicationOrderBy = { publishedDate: 'desc' };
      } else {
        publicationOrderBy = { publishedDate: 'desc' };
      }

      const publications = await prisma.publication.findMany({
        where: publicationFilters,
        include: {
          creator: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: publicationOrderBy,
        skip: type === 'publications' ? skip : 0,
        take: type === 'publications' ? RESULTS_PER_PAGE : undefined,
      });

      const publicationResults = publications.map((pub) => ({
        id: pub.id,
        type: 'publication' as const,
        title: pub.title,
        description: pub.description.substring(0, 200),
        slug: pub.id,
        category: pub.category.name,
        creatorName: pub.creator?.name,
        publishedAt: pub.publishedDate?.toISOString(),
      }));

      if (type === 'publications') {
        results.push(...publicationResults);
        total = await prisma.publication.count({ where: publicationFilters });
      } else {
        results.push(...publicationResults.slice(0, 4));
      }
    }

    // For "all" type, calculate total differently
    if (type === 'all') {
      total = results.length;
    }

    return NextResponse.json(
      {
        results,
        total,
        page,
        totalPages: Math.ceil(total / RESULTS_PER_PAGE),
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
