'use client';

import { useViewTracking } from '@/hooks/useViewTracking';
import { useEffect } from 'react';

interface CourseDetailClientProps {
  courseId: string;
  children: React.ReactNode;
}

export default function CourseDetailClient({ courseId, children }: CourseDetailClientProps) {
  // Track view for course detail page
  useViewTracking('course', courseId);

  return <>{children}</>;
}
