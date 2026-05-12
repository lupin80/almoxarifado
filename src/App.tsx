import React, { useEffect, useState } from 'react';
import { Sidebar, MobileNav, TopBar, View } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { ProductCatalog } from './components/ProductCatalog';
import { MovementForm } from './components/MovementForm';
import { Suppliers } from './components/Suppliers';
import { ABCAnalysis } from './components/ABCAnalysis';
import { Reports } from './components/Reports';
import { DeletedItems } from './components/DeletedItems';
import { Settings } from './components/Settings';
import { Support } from './components/Support';
import { ProductDetail } from './components/ProductDetail';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { canAccessView } from './lib/permissions';

const LAST_VIEW_STORAGE_KEY = 'vault_last_view';
const DEFAULT_VIEW: View = 'dashboard';
const PRODUCT_DETAIL_VIEW: View = 'product-detail';
const PRODUCT_LIST_VIEW: View = 'products';
const VALID_VIEWS: readonly View[] = [
  'dashboard',
  'inventory',
  'products',
  'movements',
  'suppliers',
  'product-detail',
  'deleted-items',
  'settings',
  'support',
  'reports',
  'abc-analysis',
];

function isView(value: string): value is View {
  return VALID_VIEWS.includes(value as View);
}

function renderCurrentView(
  currentView: View,
  searchQuery: string,
  selectedProductId: string | null,
  onViewChange: (view: View) => void,
  onViewProduct: (id: string) => void,
) {
  const searchProps = { searchQuery };

  switch (currentView) {
    case 'dashboard':
      return (
        <Dashboard
          onViewChange={onViewChange}
          onViewProduct={onViewProduct}
        />
      );
    case 'inventory':
      return (
        <InventoryList
          {...searchProps}
          onViewProduct={onViewProduct}
        />
      );
    case 'products':
      return (
        <ProductCatalog
          {...searchProps}
          onViewProduct={onViewProduct}
        />
      );
    case 'movements':
      return <MovementForm />;
    case 'suppliers':
      return <Suppliers {...searchProps} />;
    case 'abc-analysis':
      return <ABCAnalysis />;
    case 'reports':
      return <Reports {...searchProps} />;
    case 'deleted-items':
      return <DeletedItems {...searchProps} />;
    case 'settings':
      return <Settings />;
    case 'support':
      return <Support />;
    case PRODUCT_DETAIL_VIEW:
      return selectedProductId ? (
        <ProductDetail
          productId={selectedProductId}
          onBack={() => onViewChange(PRODUCT_LIST_VIEW)}
        />
      ) : null;
    default:
      return (
        <Dashboard
          onViewChange={onViewChange}
          onViewProduct={onViewProduct}
        />
      );
  }
}

function AppInner() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>(DEFAULT_VIEW);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const savedView = localStorage.getItem(LAST_VIEW_STORAGE_KEY);
    if (savedView && isView(savedView)) {
      setCurrentView(savedView);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LAST_VIEW_STORAGE_KEY, currentView);
  }, [currentView]);

  useEffect(() => {
    if (user && !canAccessView(currentView, user)) {
      setCurrentView(DEFAULT_VIEW);
    }
  }, [currentView, user]);

  const handleViewChange = (view: View) => {
    if (user && !canAccessView(view, user)) {
      setCurrentView(DEFAULT_VIEW);
      return;
    }

    setCurrentView(view);
    setSearchQuery('');
  };

  const handleProductDetail = (id: string) => {
    setSelectedProductId(id);
    setCurrentView(PRODUCT_DETAIL_VIEW);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <TopBar
          onViewChange={handleViewChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <ErrorBoundary>
            {renderCurrentView(
              currentView,
              searchQuery,
              selectedProductId,
              handleViewChange,
              handleProductDetail,
            )}
          </ErrorBoundary>
        </main>
      </div>
      <MobileNav currentView={currentView} onViewChange={handleViewChange} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
