import { useState } from 'react';
import { FileBarChart, FileSpreadsheet, FileText } from 'lucide-react';
import { REPORTS, type ReportFormat, type ReportType } from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { downloadReport } from './reportsApi';

const formats: { format: ReportFormat; label: string; icon: typeof FileText }[] = [
  { format: 'csv', label: 'CSV', icon: FileText },
  { format: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
  { format: 'pdf', label: 'PDF', icon: FileBarChart },
];

export function ReportsPage() {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const handleExport = async (type: ReportType, format: ReportFormat) => {
    setBusy(`${type}-${format}`);
    try {
      await downloadReport(type, format);
      toast({ title: `${format.toUpperCase()} export ready`, tone: 'success' });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader title="Reports" description="Generate and export operational reports." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORTS.map((report) => (
          <Card key={report.type} className="flex flex-col p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileBarChart className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">{report.name}</p>
                <p className="text-sm text-muted-fg">{report.description}</p>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              {formats.map(({ format, label, icon: Icon }) => (
                <Button
                  key={format}
                  variant="secondary"
                  size="sm"
                  isLoading={busy === `${report.type}-${format}`}
                  onClick={() => handleExport(report.type, format)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
