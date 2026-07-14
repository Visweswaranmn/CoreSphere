import { useMemo, useState } from 'react';
import { CalendarClock, CalendarX, Clock, Plus, UserMinus, UserX } from 'lucide-react';
import {
  type AttendanceStatus,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUSES,
} from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { formatDate } from '@/lib/format';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { RecordAttendanceModal } from './RecordAttendanceModal';
import { useAttendance, useAttendanceSummary } from './attendanceHooks';

const statusTone: Record<AttendanceStatus, BadgeTone> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  half_day: 'info',
  on_leave: 'neutral',
};

function monthRange(): { from: string; to: string } {
  const now = new Date();
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
}

const PAGE_SIZE = 10;

export function AttendancePage() {
  const defaults = useMemo(monthRange, []);
  const [page, setPage] = useState(1);
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [recordOpen, setRecordOpen] = useState(false);

  const { data: options } = useEmployeeOptions();
  const employeeOptions = [
    { value: '', label: 'All employees' },
    ...(options ?? []).map((o) => o.option),
  ];
  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...ATTENDANCE_STATUSES.map((s) => ({ value: s, label: ATTENDANCE_STATUS_LABELS[s] })),
  ];

  const listParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      employeeId: employeeId || undefined,
      status: status || undefined,
      from,
      to,
    }),
    [page, employeeId, status, from, to],
  );

  const { data, isLoading } = useAttendance(listParams);
  const { data: summary } = useAttendanceSummary({
    ...(employeeId ? { employeeId } : {}),
    from,
    to,
  });

  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const tiles = [
    { icon: CalendarClock, label: 'Present', value: summary?.present ?? 0 },
    { icon: UserX, label: 'Absent', value: summary?.absent ?? 0 },
    { icon: Clock, label: 'Late', value: summary?.late ?? 0 },
    { icon: UserMinus, label: 'Half day', value: summary?.halfDay ?? 0 },
    { icon: CalendarX, label: 'On leave', value: summary?.onLeave ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track daily attendance and review period summaries."
        actions={
          <Button onClick={() => setRecordOpen(true)}>
            <Plus className="h-4 w-4" />
            Record attendance
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <Card key={tile.label} className="flex items-center gap-3 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <tile.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">{tile.value}</p>
              <p className="text-xs text-muted-fg">{tile.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            options={employeeOptions}
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              resetPage();
            }}
          />
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              resetPage();
            }}
          />
          <TextInputDate label="From" value={from} onChange={(v) => { setFrom(v); resetPage(); }} />
          <TextInputDate label="To" value={to} onChange={(v) => { setTo(v); resetPage(); }} />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No attendance records"
            description="Record attendance or widen your date range."
            className="m-4 border-0"
          />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Employee</TH>
                  <TH>Date</TH>
                  <TH>Status</TH>
                  <TH>Check in</TH>
                  <TH>Check out</TH>
                  <TH>Hours</TH>
                  <TH>Note</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((record) => (
                  <TR key={record.id}>
                    <TD>
                      <p className="font-medium text-foreground">{record.employeeName}</p>
                      <p className="text-xs text-muted-fg">{record.employeeCode}</p>
                    </TD>
                    <TD className="text-muted-fg">{formatDate(record.date)}</TD>
                    <TD>
                      <Badge tone={statusTone[record.status]} dot>
                        {ATTENDANCE_STATUS_LABELS[record.status]}
                      </Badge>
                    </TD>
                    <TD className="text-muted-fg">{record.checkIn ?? '—'}</TD>
                    <TD className="text-muted-fg">{record.checkOut ?? '—'}</TD>
                    <TD className="text-muted-fg">{record.workedHours ?? '—'}</TD>
                    <TD className="max-w-[16rem] truncate text-muted-fg">{record.note ?? '—'}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <RecordAttendanceModal open={recordOpen} onClose={() => setRecordOpen(false)} />
    </div>
  );
}

function TextInputDate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-fg">
      <span className="shrink-0">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}
