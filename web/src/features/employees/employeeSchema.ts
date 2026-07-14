import { z } from 'zod';

export const employeeFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().trim().optional(),
  department: z.string().min(1, 'Select a department'),
  jobTitle: z.string().trim().min(1, 'Job title is required'),
  employmentType: z.string().min(1, 'Select an employment type'),
  dateOfJoining: z.string().min(1, 'Joining date is required'),
  location: z.string().trim().optional(),
  managerId: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
