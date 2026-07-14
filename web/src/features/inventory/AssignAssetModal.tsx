import { useEffect, useState } from 'react';
import type { AssetDto } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { useAssignAsset } from './inventoryHooks';

export function AssignAssetModal({ asset, onClose }: { asset: AssetDto | null; onClose: () => void }) {
  const { toast } = useToast();
  const { data: options } = useEmployeeOptions();
  const assign = useAssignAsset();
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    if (asset) setEmployeeId('');
  }, [asset]);

  const employeeOptions = [{ value: '', label: 'Select employee' }, ...(options ?? []).map((o) => o.option)];

  const submit = async () => {
    if (!asset || !employeeId) return;
    try {
      await assign.mutateAsync({ id: asset.id, employeeId });
      toast({ title: 'Asset assigned', tone: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'Could not assign asset', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  return (
    <Modal
      open={Boolean(asset)}
      onClose={onClose}
      size="sm"
      title="Assign asset"
      description={asset ? `${asset.name} · ${asset.code}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} isLoading={assign.isPending} disabled={!employeeId}>Assign</Button>
        </>
      }
    >
      <Select label="Assign to" options={employeeOptions} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
    </Modal>
  );
}
