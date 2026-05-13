import { useState, useEffect } from 'react';
import { 
  Trash2, 
  RefreshCcw, 
  Search, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { resolveProductImageUrl } from '../lib/images';
import { ConfirmationModal } from './ConfirmationModal';

interface DeletedItemsProps {
  searchQuery?: string;
}

export function DeletedItems({ searchQuery }: DeletedItemsProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers' | 'movements'>('products');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeleted();
  }, [activeTab]);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab;
      const response = await fetch(`http://localhost:3000/api/trash/${endpoint}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error(`Error fetching deleted ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (item: any) => {
    setSelectedItem(item);
    setIsRestoreModalOpen(true);
  };

  const handleDeletePermanent = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedItem) return;
    try {
      const endpoint = activeTab;
      await fetch(`http://localhost:3000/api/trash/${endpoint}/${selectedItem.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      setItems(prev => prev.filter(i => i.id !== selectedItem.id));
      setIsRestoreModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error restoring ${activeTab}:`, error);
    }
  };

  const confirmDeletePermanent = async () => {
    if (!selectedItem) return;
    try {
      const endpoint = activeTab;
      await fetch(`http://localhost:3000/api/trash/${endpoint}/${selectedItem.id}/permanent`, {
        method: 'DELETE'
      });
      setItems(prev => prev.filter(i => i.id !== selectedItem.id));
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error deleting ${activeTab}:`, error);
    }
  };

  const filteredItems = items.filter(i => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    
    if (activeTab === 'products') {
      return (
        i.name?.toLowerCase().includes(term) ||
        i.sku?.toLowerCase().includes(term) ||
        i.category?.toLowerCase().includes(term)
      );
    } else if (activeTab === 'suppliers') {
      return (
        i.name?.toLowerCase().includes(term) ||
        i.cnpj?.toLowerCase().includes(term)
      );
    } else {
      // For movements, we might want to search in the JSON data
      const data = i.data || {};
      return (
        data.type?.toLowerCase().includes(term) ||
        data.note?.toLowerCase().includes(term)
      );
    }
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-7xl mx-auto w-full">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-none mb-2 font-headline uppercase">Itens Excluídos</h1>
          <p className="text-on-surface-variant font-body text-lg max-w-xl">Gerencie ativos removidos e restaure-os se necessário.</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface-container rounded-xl w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap",
            activeTab === 'products' 
              ? "bg-secondary text-on-secondary shadow-lg shadow-secondary/20" 
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Produtos
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap",
            activeTab === 'suppliers' 
              ? "bg-secondary text-on-secondary shadow-lg shadow-secondary/20" 
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Fornecedores
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap",
            activeTab === 'movements' 
              ? "bg-secondary text-on-secondary shadow-lg shadow-secondary/20" 
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Movimentações
        </button>
      </div>

      <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Search className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">
            {searchQuery ? `Resultados na lixeira para: ${searchQuery}` : `Todos os ${activeTab === 'products' ? 'Produtos' : activeTab === 'suppliers' ? 'Fornecedores' : 'Movimentações'} Excluídos`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          <AlertTriangle className="w-4 h-4 text-tertiary" />
          <span>Itens arquivados para conformidade</span>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <Trash2 className="w-16 h-16 mb-4" />
          <p className="text-lg font-bold uppercase tracking-tighter">Nenhum item encontrado nesta categoria</p>
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/20">
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {activeTab === 'products' ? 'Produto' : activeTab === 'suppliers' ? 'Fornecedor' : 'Tipo / ID'}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {activeTab === 'products' ? 'SKU' : activeTab === 'suppliers' ? 'CNPJ' : 'Quantidade'}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {activeTab === 'products' ? 'Categoria' : 'Data de Exclusão'}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest/10">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedRowId(item.id === selectedRowId ? null : item.id)}
                    className={cn(
                      "transition-all duration-300 group cursor-pointer relative",
                      selectedRowId === item.id 
                        ? "bg-secondary/10 shadow-[inset_0_0_30px_rgba(102,221,139,0.05)]" 
                        : "hover:bg-surface-container"
                    )}
                  >
                    <td className="px-6 py-4 relative">
                      {selectedRowId === item.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary shadow-[0_0_15px_rgba(102,221,139,0.6)] z-10" />
                      )}
                      <div className="flex items-center gap-4">
                        {activeTab === 'products' && (
                          <div className="w-10 h-10 bg-surface-container-highest rounded-lg overflow-hidden grayscale opacity-60">
                            <img 
                              src={resolveProductImageUrl(item.image)} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                        )}
                        <span className="font-bold text-on-surface">
                          {activeTab === 'movements' ? `${item.data?.type || 'N/A'} - ${item.id.slice(0,8)}` : item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">
                      {activeTab === 'products' ? item.sku : activeTab === 'suppliers' ? item.cnpj : item.data?.quantity || '0'}
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'products' ? (
                        <span className="bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">
                          {item.deleted_at ? new Date(item.deleted_at).toLocaleString('pt-BR') : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleRestore(item)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary transition-all text-[10px] font-bold uppercase tracking-widest"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" /> Restaurar
                        </button>
                        <button
                          onClick={() => handleDeletePermanent(item)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-on-tertiary transition-all text-[10px] font-bold uppercase tracking-widest"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={confirmRestore}
        title={`Restaurar ${activeTab === 'products' ? 'Produto' : 'Fornecedor'}`}
        message={`Deseja restaurar "${selectedItem?.name}" para o sistema ativo?`}
        confirmText="Restaurar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeletePermanent}
        title="Excluir Permanentemente"
        message={`AVISO: Esta ação excluirá "${selectedItem?.name}" permanentemente do banco de dados. Esta ação não pode ser desfeita.`}
        confirmText="Excluir Permanentemente"
        cancelText="Cancelar"
      />
    </div>
  );
}
