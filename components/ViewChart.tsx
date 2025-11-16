'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ViewChartProps {
  data: Array<{ date: string; views: number }>;
}

export default function ViewChart({ data }: ViewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.5rem',
          }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '1rem',
          }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Views"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
