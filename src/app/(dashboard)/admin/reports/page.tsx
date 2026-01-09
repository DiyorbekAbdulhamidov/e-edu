import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function ReportsPage() {
  const reports = [
    {
      title: 'Daromad hisoboti',
      description: 'Oylik va yillik daromadlarni ko\'rish',
      icon: '💰',
      href: '/admin/reports/income',
      color: 'bg-success-50 hover:bg-success-100',
    },
    {
      title: 'Qarzlar hisoboti',
      description: 'Talabalar qarzlari ro\'yxati',
      icon: '📋',
      href: '/admin/reports/debts',
      color: 'bg-danger-50 hover:bg-danger-100',
    },
    {
      title: 'Davomat hisoboti',
      description: 'Guruhlar bo\'yicha davomat statistikasi',
      icon: '📊',
      href: '/admin/reports/attendance',
      color: 'bg-primary-50 hover:bg-primary-100',
    },
    {
      title: 'O\'qituvchilar hisoboti',
      description: 'O\'qituvchilar samaradorligi',
      icon: '👨‍🏫',
      href: '/admin/reports/teachers',
      color: 'bg-warning-50 hover:bg-warning-100',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hisobotlar</h1>
        <p className="text-gray-600 mt-1">
          Turli xil hisobotlar va statistikalar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className={`${report.color} transition-colors cursor-pointer`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{report.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    {report.title}
                  </h3>
                  <p className="text-gray-600">{report.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}