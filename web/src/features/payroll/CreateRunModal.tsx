import { useState } from 'react';
import { MONTH_NAMES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useCreateRun } from './payrollHooks';

const now = new Date();
const monthOptions = MONTH_NAMES.map((name, i) => ({ value: String(i + 1), label: name }));

export function CreateRunModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const createRun = useCreateRun();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [notes, setNotes] = useState('');

  const submit = async () => {
    try {
      await createRun.mutateAsync({
        month: Number(month),
        year: Number(year),
        notes: notes || undefined,
      });
      toast({ title: 'Payroll run created', tone: 'success' });
      onClose();
    } catch (error) {
      toast({
        title: 'Could not create run',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New payroll run"
      description="Create a draft run for a period, then process it to generate payslips."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createRun.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={createRun.isPending}>
            Create run
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Month" options={monthOptions} value={month} onChange={(e) => setMonth(e.target.value)} />
          <TextField label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <Textarea label="Notes (optional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
}
