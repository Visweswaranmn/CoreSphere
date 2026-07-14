export const AttendanceStatus = {
  Present: 'present',
  Absent: 'absent',
  Late: 'late',
  HalfDay: 'half_day',
  OnLeave: 'on_leave',
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
export const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = Object.values(AttendanceStatus);
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: 'Present',
  [AttendanceStatus.Absent]: 'Absent',
  [AttendanceStatus.Late]: 'Late',
  [AttendanceStatus.HalfDay]: 'Half Day',
  [AttendanceStatus.OnLeave]: 'On Leave',
};

export interface AttendanceDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  /** Calendar date (YYYY-MM-DD). */
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  workedHours?: number;
  note?: string;
  createdAt: string;
}

export interface AttendanceSummary {
  from: string;
  to: string;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  totalRecords: number;
}
