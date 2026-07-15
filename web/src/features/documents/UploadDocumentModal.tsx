import { useEffect, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { DOCUMENT_CATEGORIES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { formatFileSize } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { useUploadDocument } from './documentHooks';

const categoryOptions = DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }));

export function UploadDocumentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const upload = useUploadDocument();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setName('');
      setCategory('');
      setDescription('');
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    setError(null);
    if (!file) return setError('Please choose a file to upload.');
    if (!category) return setError('Please select a category.');
    try {
      const created = await upload.mutateAsync({ file, name: name || undefined, category, description: description || undefined });
      toast({ title: 'Document uploaded', description: created.name, tone: 'success' });
      onClose();
    } catch (err) {
      toast({ title: 'Upload failed', description: err instanceof ApiClientError ? err.message : 'Please try again.', tone: 'error' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload document"
      description="Files up to 10 MB."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={upload.isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={upload.isPending}>Upload</Button>
        </>
      }
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-muted/40 px-4 py-8 text-center transition-colors hover:border-primary"
        >
          <UploadCloud className="h-7 w-7 text-muted-fg" />
          {file ? (
            <span className="text-sm text-foreground">{file.name} · {formatFileSize(file.size)}</span>
          ) : (
            <span className="text-sm text-muted-fg">Click to choose a file</span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const chosen = e.target.files?.[0] ?? null;
            setFile(chosen);
            if (chosen && !name) setName(chosen.name.replace(/\.[^.]+$/, ''));
          }}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <TextField label="Display name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <Select label="Category" placeholder="Select category" options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} />
        <Textarea label="Description (optional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
    </Modal>
  );
}
