import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  PiggyBank,
  Plus,
  SignOut,
  ChartBar,
  Coins,
  Trash,
  PencilSimple,
} from '@phosphor-icons/react';
import CreatePiggyBankDialog from '../components/CreatePiggyBankDialog';
import { toast } from 'sonner';
import { getIcon } from '../utils/iconMap';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const colorClasses = {
  mint: 'bg-[#A8E6CF]',
  lavender: 'bg-[#DCD3FF]',
  peach: 'bg-[#FFD3B6]',
  coral: 'bg-[#FF9B9B]',
  yellow: 'bg-[#FFE8A1]',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [piggyBanks, setPiggyBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [piggyBankToDelete, setPiggyBankToDelete] = useState(null);

  const fetchPiggyBanks = async () => {
    try {
      const { data } = await axios.get(`${API}/piggy-banks`, { withCredentials: true });
      setPiggyBanks(data);
    } catch (error) {
      console.error('Error fetching piggy banks:', error);
      toast.error('Error al cargar las huchas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiggyBanks();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeletePiggyBank = async () => {
    if (!piggyBankToDelete) return;
    
    try {
      await axios.delete(`${API}/piggy-banks/${piggyBankToDelete.id}`, { withCredentials: true });
      toast.success('Hucha eliminada correctamente');
      setPiggyBankToDelete(null);
      fetchPiggyBanks();
    } catch (error) {
      console.error('Error deleting piggy bank:', error);
      toast.error('Error al eliminar la hucha');
    }
  };

  const totalSavings = piggyBanks.reduce((sum, pb) => sum + pb.balance, 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-[#FDFBF7] border-b-4 border-[#1A1A1A] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PiggyBank size={40} weight="duotone" className="text-[#1A1A1A]" />
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-[#1A1A1A]">
                Mis Huchas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-sm font-bold text-[#1A1A1A]">
                {user?.name || user?.email}
              </span>
              <button
                onClick={() => navigate('/statistics')}
                className="neo-button flex items-center space-x-2"
                data-testid="statistics-button"
              >
                <ChartBar size={20} weight="bold" />
                <span className="hidden sm:inline">Estadísticas</span>
              </button>
              <button
                onClick={handleLogout}
                className="neo-button neo-button-danger flex items-center space-x-2"
                data-testid="logout-button"
              >
                <SignOut size={20} weight="bold" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-2">
            Hola, {user?.name}!
          </h2>
          <div className="flex items-center space-x-3 mt-4">
            <Coins size={32} weight="duotone" className="text-[#1A1A1A]" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">Total Ahorrado</p>
              <p className="text-3xl font-black text-[#1A1A1A]" data-testid="total-savings">
                €{totalSavings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Piggy Banks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : piggyBanks.length === 0 ? (
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] rounded-xl p-12 text-center">
            <PiggyBank size={80} weight="duotone" className="mx-auto mb-4 text-[#1A1A1A]" />
            <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-2">
              No tienes huchas aún
            </h3>
            <p className="text-base font-medium text-[#1A1A1A] mb-6">
              ¡Crea tu primera hucha y empieza a ahorrar!
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="neo-button flex items-center space-x-2 mx-auto"
              data-testid="create-first-piggy-bank-button"
            >
              <Plus size={20} weight="bold" />
              <span>Crear Hucha</span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A]">
                Tus Huchas ({piggyBanks.length})
              </h3>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="neo-button flex items-center space-x-2 text-xs py-2 px-4"
                data-testid="create-piggy-bank-button"
              >
                <Plus size={16} weight="bold" />
                <span>Nueva</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {piggyBanks.map((piggyBank) => {
                const IconComponent = getIcon(piggyBank.icon);
                return (
                  <div
                    key={piggyBank.id}
                    className={`neo-card ${colorClasses[piggyBank.color]} p-6 relative`}
                    data-testid={`piggy-bank-card-${piggyBank.id}`}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPiggyBankToDelete(piggyBank);
                      }}
                      className="absolute top-4 left-4 p-2 bg-[#FF9B9B] border-2 border-[#1A1A1A] rounded-lg hover:bg-[#FF7F7F] transition-colors shadow-[2px_2px_0px_#1A1A1A] hover:shadow-[3px_3px_0px_#1A1A1A]"
                      data-testid={`delete-piggy-bank-${piggyBank.id}`}
                      title="Eliminar hucha"
                    >
                      <Trash size={16} weight="bold" className="text-[#1A1A1A]" />
                    </button>

                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/piggy-bank/${piggyBank.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pl-10 pr-2">
                          <h4 className="text-xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-1">
                            {piggyBank.name}
                          </h4>
                          <p className="text-3xl font-black text-[#1A1A1A]" data-testid={`balance-${piggyBank.id}`}>
                            €{piggyBank.balance.toFixed(2)}
                          </p>
                        </div>
                        <IconComponent size={40} weight="duotone" className="text-[#1A1A1A]" />
                      </div>

                      {piggyBank.goal && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                            <span>Meta</span>
                            <span>€{piggyBank.goal.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-[#1A1A1A] transition-all"
                              style={{ width: `${Math.min((piggyBank.balance / piggyBank.goal) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs font-medium text-[#1A1A1A] mt-1">
                            {((piggyBank.balance / piggyBank.goal) * 100).toFixed(0)}% completado
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreatePiggyBankDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchPiggyBanks();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {piggyBankToDelete && (
        <div className="fixed inset-0 bg-[#1A1A1A] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-4">
              ¿Eliminar Hucha?
            </h3>
            <p className="text-base font-medium text-[#1A1A1A] mb-2">
              ¿Estás seguro de que quieres eliminar <span className="font-black">"{piggyBankToDelete.name}"</span>?
            </p>
            <p className="text-sm text-[#1A1A1A] mb-6">
              Se perderá el saldo de <span className="font-bold">€{piggyBankToDelete.balance.toFixed(2)}</span> y todo el historial. Esta acción no se puede deshacer.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setPiggyBankToDelete(null)}
                className="neo-button flex-1"
                data-testid="cancel-delete-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePiggyBank}
                className="neo-button neo-button-danger flex-1"
                data-testid="confirm-delete-button"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
