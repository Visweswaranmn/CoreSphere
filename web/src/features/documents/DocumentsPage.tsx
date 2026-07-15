import { useMemo, useState } from 'react';
import { Download, FileText, MoreHorizontal, Search, Trash2, Upload } from 'lucide-react';
import { DOCUMENT_CATEGORIES, type DocumentDto } from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { DropdownItem, DropdownMenu, DropdownSeparator } from '@/components/ui/DropdownMenu';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate, formatFileSize, formatNumber } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { UploadDocumentModal } from './UploadDocumentModal';
import { documentsApi } from './documentsApi';
import { useDeleteDocument, useDocumentStats, useDocuments } from './documentHooks';

const PAGE_SIZE = 10;
const categoryFilterOptions = [{ value: '', label: 'All categories' }, ...DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))];

export function DocumentsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState<DocumentDto | undefined>();
  const search = useDebouncedValue(searchInput);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: search || undefined, category: category || undefined }),
    [page, search, category],
  );

  const { data, isLoading } = useDocuments(params);
  const { data: stats } = useDocumentStats();
  const deleteDocument = useDeleteDocument();
  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const download = async (doc: DocumentDto) => {
    try {
      await documentsApi.download(doc.id, doc.originalName);
    } catch (error) {
      toast({ title: 'Download failed', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDocument.mutateAsync(deleting.id);
      toast({ title: 'Document removed', tone: 'success' });
      setDeleting(undefined);
    } catch (error) {
      toast({ title: 'Could not remove document', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const tiles = [
    { label: 'Total documents', value: formatNumber(stats?.total ?? 0) },
    { label: 'Storage used', value: formatFileSize(stats?.totalSize ?? 0) },
    { label: 'Categories', value: formatNumber(stats?.byCategory.length ?? 0) },
  ];

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Store and share company files."
        actions={<Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" />Upload</Button>}
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-xs text-muted-fg">{t.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{t.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
            <input
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); resetPage(); }}
              placeholder="Search documents…"
              className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select options={categoryFilterOptions} value={category} onChange={(e) => { setCategory(e.target.value); resetPage(); }} className="sm:w-48" />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={FileText} title="No documents" description="Upload your first file to get started." className="m-4 border-0" action={<Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" />Upload</Button>} />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Document</TH>
                  <TH>Category</TH>
                  <TH>Size</TH>
                  <TH>Uploaded by</TH>
                  <TH>Date</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((doc) => (
                  <TR key={doc.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{doc.name}</p>
                          <p className="truncate text-xs text-muted-fg">{doc.originalName}</p>
                        </div>
                      </div>
                    </TD>
                    <TD><Badge tone="neutral">{doc.category}</Badge></TD>
                    <TD className="text-muted-fg">{formatFileSize(doc.size)}</TD>
                    <TD className="text-muted-fg">{doc.uploadedByName}</TD>
                    <TD className="text-muted-fg">{formatDate(doc.createdAt)}</TD>
                    <TD className="text-right">
                      <DropdownMenu
                        trigger={<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-fg hover:bg-surface-muted hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></span>}
                      >
                        <DropdownItem icon={Download} onSelect={() => download(doc)}>Download</DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem icon={Trash2} danger onSelect={() => setDeleting(doc)}>Remove</DropdownItem>
                      </DropdownMenu>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <UploadDocumentModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        size="sm"
        title="Remove document"
        description={`This permanently removes ${deleting?.name ?? ''}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(undefined)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteDocument.isPending}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-muted-fg">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
