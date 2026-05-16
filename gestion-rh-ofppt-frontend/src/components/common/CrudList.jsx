import { useState, useOptimistic, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import Card from '../ui/Card';
import Table from '../ui/Table';
import Button from '../ui/Button';
import PageHeader from '../common/PageHeader';
import ConfirmDialog from '../common/ConfirmDialog';
import { Loader, ErrorMessage } from '../common/index';
import useFetch from '../../hooks/useFetch';

/**
 * Generic CRUD list page.
 * Uses React 19 useOptimistic for instant delete feedback,
 * and useTransition to keep the UI responsive during network calls.
 */
export function CrudList({
  title, subtitle, basePath,
  service, columns, extractData,
  emptyMessage, searchKeys = [],
}) {
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isPending, startTransition]  = useTransition();

  const { data: raw, loading, error, refetch } = useFetch(
    () => service.getAll?.() || [],
    []
  );

  const items = extractData
    ? extractData(raw)
    : Array.isArray(raw) ? raw : raw?.data || [];

  // ── useOptimistic: remove row immediately on user click ───
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (current, idToRemove) => current.filter(item => (item._id || item.id) !== idToRemove)
  );

  const filtered = search.trim()
    ? optimisticItems.filter(item =>
        searchKeys.some(k => String(item[k] || '').toLowerCase().includes(search.toLowerCase()))
      )
    : optimisticItems;

  const handleDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;

    startTransition(async () => {
      removeOptimistic(id);        // instant UI update
      setDeleteTarget(null);
      try {
        await (service.remove || service.deleteItem)(id);
        refetch();                 // sync with server
      } catch {
        refetch();                 // rollback by refetching
      }
    });
  };

  const actionColumn = {
    key: '_actions',
    header: 'Actions',
    width: '120px',
    render: (_, row) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate(`${basePath}/${row._id || row.id}`)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          aria-label="Voir le détail"
          title="Voir"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={() => navigate(`${basePath}/${row._id || row.id}/edit`)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          aria-label="Modifier"
          title="Modifier"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => setDeleteTarget(row)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Supprimer"
          title="Supprimer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ),
  };

  return (
    <MainLayout>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button onClick={() => navigate(`${basePath}/create`)}>
            <Plus size={16} />
            Ajouter
          </Button>
        }
      />

      <Card padding={false}>
        {searchKeys.length > 0 && (
          <div className="px-5 py-4 border-b border-surface-200">
            <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 w-full max-w-sm">
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <input
                type="search"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
                aria-label="Rechercher dans la liste"
              />
            </div>
          </div>
        )}

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : (
          <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            <Table
              data={filtered}
              columns={[...columns, actionColumn]}
              emptyMessage={emptyMessage || 'Aucun enregistrement trouvé.'}
            />
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isPending}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet enregistrement ? Cette action est irréversible."
      />
    </MainLayout>
  );
}
