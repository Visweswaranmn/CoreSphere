import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  attendanceApi,
  type AttendanceListParams,
  type RecordAttendancePayload,
} from './attendanceApi';

export const attendanceKeys = {
  all: ['attendance'] as const,
  list: (params: AttendanceListParams) => ['attendance', 'list', params] as const,
  summary: (params: { employeeId?: string; from: string; to: string }) =>
    ['attendance', 'summary', params] as const,
};

export function useAttendance(params: AttendanceListParams) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useAttendanceSummary(params: { employeeId?: string; from: string; to: string }) {
  return useQuery({
    queryKey: attendanceKeys.summary(params),
    queryFn: () => attendanceApi.summary(params),
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordAttendancePayload) => attendanceApi.record(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
