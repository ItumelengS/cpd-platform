'use client';

import { Download } from 'lucide-react';

interface Revenue {
  id: string;
  month: number;
  year: number;
  totalRevenue: number;
  totalViews: number;
  revenuePerView: number;
  creatorEarnings: Array<{
    id: string;
    views: number;
    viewShare: number;
    grossEarnings: number;
    platformFee: number;
    netEarnings: number;
    paid: boolean;
    paidAt: Date | null;
    creator: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
}

interface ExportCSVButtonProps {
  revenue: Revenue;
  monthName: string;
}

export default function ExportCSVButton({ revenue, monthName }: ExportCSVButtonProps) {
  const handleExport = () => {
    // Prepare CSV data
    const headers = [
      'Creator ID',
      'Creator Name',
      'Creator Email',
      'Views',
      'View Share (%)',
      'Gross Earnings ($)',
      'Platform Fee ($)',
      'Net Earnings ($)',
      'Payout Status',
      'Paid Date',
    ];

    const rows = revenue.creatorEarnings.map((earning) => [
      earning.creator.id,
      earning.creator.name || 'N/A',
      earning.creator.email || 'N/A',
      earning.views.toString(),
      (earning.viewShare * 100).toFixed(2),
      earning.grossEarnings.toFixed(2),
      earning.platformFee.toFixed(2),
      earning.netEarnings.toFixed(2),
      earning.paid ? 'Paid' : 'Pending',
      earning.paidAt ? new Date(earning.paidAt).toLocaleDateString() : 'N/A',
    ]);

    // Add summary row
    const totalViews = revenue.totalViews;
    const totalGross = revenue.totalRevenue;
    const totalPlatformFee = revenue.creatorEarnings.reduce((sum, e) => sum + e.platformFee, 0);
    const totalNet = revenue.creatorEarnings.reduce((sum, e) => sum + e.netEarnings, 0);

    rows.push([
      'TOTAL',
      '',
      '',
      totalViews.toString(),
      '100.00',
      totalGross.toFixed(2),
      totalPlatformFee.toFixed(2),
      totalNet.toFixed(2),
      '',
      '',
    ]);

    // Create CSV content
    const csvContent = [
      [`Revenue Report - ${monthName} ${revenue.year}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Total Revenue: $${revenue.totalRevenue.toFixed(2)}`],
      [`Total Views: ${revenue.totalViews.toLocaleString()}`],
      [`Revenue Per View: $${revenue.revenuePerView.toFixed(4)}`],
      [],
      headers,
      ...rows,
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `revenue_${monthName}_${revenue.year}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
    >
      <Download className="w-4 h-4" />
      Export as CSV
    </button>
  );
}
