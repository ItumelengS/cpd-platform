import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export interface AnalyticsData {
  totalViews: number;
  viewsByDay: Array<{ date: string; views: number }>;
  topContent: Array<{
    id: string;
    title: string;
    type: string;
    views: number;
    avgDuration: number;
    completionRate: number;
    slug: string;
  }>;
  uniqueViewers: number;
  avgDuration: number;
  completionRate: number;
}

/**
 * Track a view for a course or publication
 */
export async function trackView(
  contentType: 'course' | 'publication',
  contentId: string,
  creatorId: string,
  userId?: string,
  req?: NextRequest
): Promise<string> {
  // Extract metadata from request headers
  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  let referrer: string | null = null;

  if (req) {
    ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    userAgent = req.headers.get('user-agent');
    referrer = req.headers.get('referer');
  }

  // Create the view record
  const view = await prisma.view.create({
    data: {
      ...(contentType === 'course' ? { courseId: contentId } : { publicationId: contentId }),
      creatorId,
      userId: userId || null,
      ipAddress,
      userAgent,
      referrer,
      duration: 0,
      completed: false,
    },
  });

  // Increment totalViews on the content
  if (contentType === 'course') {
    await prisma.course.update({
      where: { id: contentId },
      data: { totalViews: { increment: 1 } },
    });
  } else if (contentType === 'publication') {
    await prisma.publication.update({
      where: { id: contentId },
      data: { totalViews: { increment: 1 } },
    });
  }

  return view.id;
}

/**
 * Update the duration of a view
 */
export async function updateViewDuration(
  viewId: string,
  duration: number
): Promise<void> {
  await prisma.view.update({
    where: { id: viewId },
    data: { duration },
  });
}

/**
 * Mark a view as completed
 */
export async function markViewCompleted(viewId: string): Promise<void> {
  await prisma.view.update({
    where: { id: viewId },
    data: { completed: true },
  });
}

/**
 * Get analytics data for a creator
 */
export async function getCreatorAnalytics(
  creatorId: string,
  timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<AnalyticsData> {
  // Calculate date range
  const now = new Date();
  let startDate: Date | null = null;

  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      startDate = null;
      break;
  }

  // Build where clause
  const whereClause: any = { creatorId };
  if (startDate) {
    whereClause.createdAt = { gte: startDate };
  }

  // Get all views for the creator in the time range
  const views = await prisma.view.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  // Calculate total views
  const totalViews = views.length;

  // Calculate unique viewers
  const uniqueUserIds = new Set(views.filter(v => v.userId).map(v => v.userId));
  const uniqueIps = new Set(views.filter(v => !v.userId && v.ipAddress).map(v => v.ipAddress));
  const uniqueViewers = uniqueUserIds.size + uniqueIps.size;

  // Calculate average duration
  const totalDuration = views.reduce((sum, v) => sum + v.duration, 0);
  const avgDuration = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;

  // Calculate completion rate
  const completedViews = views.filter(v => v.completed).length;
  const completionRate = totalViews > 0 ? Math.round((completedViews / totalViews) * 100) : 0;

  // Group views by day
  const viewsByDayMap = new Map<string, number>();
  views.forEach(view => {
    const dateKey = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(view.createdAt));
    viewsByDayMap.set(dateKey, (viewsByDayMap.get(dateKey) || 0) + 1);
  });

  const viewsByDay = Array.from(viewsByDayMap.entries())
    .map(([date, views]) => ({ date, views }))
    .reverse();

  // Get top content
  const contentMap = new Map<string, {
    id: string;
    title: string;
    type: string;
    views: number;
    totalDuration: number;
    completed: number;
    slug: string;
  }>();

  for (const view of views) {
    const contentType = view.courseId ? 'course' : 'publication';
    const contentId = view.courseId || view.publicationId;
    if (!contentId) continue;

    const key = `${contentType}-${contentId}`;
    if (!contentMap.has(key)) {
      contentMap.set(key, {
        id: contentId,
        title: '',
        type: contentType,
        views: 0,
        totalDuration: 0,
        completed: 0,
        slug: '',
      });
    }
    const content = contentMap.get(key)!;
    content.views++;
    content.totalDuration += view.duration;
    if (view.completed) content.completed++;
  }

  // Fetch titles and slugs for content
  const topContentArray = await Promise.all(
    Array.from(contentMap.entries()).map(async ([key, data]) => {
      let title = 'Unknown';
      let slug = '';

      if (data.type === 'course') {
        const course = await prisma.course.findUnique({
          where: { id: data.id },
          select: { title: true, slug: true },
        });
        if (course) {
          title = course.title;
          slug = course.slug;
        }
      } else if (data.type === 'publication') {
        const publication = await prisma.publication.findUnique({
          where: { id: data.id },
          select: { title: true },
        });
        if (publication) {
          title = publication.title;
          slug = data.id; // Publications use ID as slug
        }
      }

      const avgDuration = data.views > 0 ? Math.round(data.totalDuration / data.views) : 0;
      const completionRate = data.views > 0 ? Math.round((data.completed / data.views) * 100) : 0;

      return {
        id: data.id,
        title,
        type: data.type,
        views: data.views,
        avgDuration,
        completionRate,
        slug,
      };
    })
  );

  // Sort by views and take top 10
  const topContent = topContentArray
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return {
    totalViews,
    viewsByDay,
    topContent,
    uniqueViewers,
    avgDuration,
    completionRate,
  };
}
