import { useEffect, useState } from 'react';
import { NOTIFICATION_TYPES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useBroadcast } from './notificationHooks';

const typeOptions = NOTIFICATION_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));

export function BroadcastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const broadcast = useBroadcast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setMessage('');
      setType('info');
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    setError(null);
    if (!title.trim() || !message.trim()) return setError('Title and message are required.');
    try {
      const result = await broadcast.mutateAsync({ title, message, type });
      toast({ title: 'Announcement sent', description: `Delivered to ${result.recipients} users`, tone: 'success' });
      onClose();
    } catch (err) {
      toast({ title: 'Could not send', description: err instanceof ApiClientError ? err.message : 'Please try again.', tone: 'error' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send announcement"
      description="This notification is delivered to every user."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={broadcast.isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={broadcast.isPending}>Send</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <p className="text-sm text-danger">{error}</p>}
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        <Select label="Type" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
      </div>
    </Modal>
  );
}
