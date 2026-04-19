import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiggyBank,
  Plus,
  ChartBar,
  Coins,
  Trash,
} from '@phosphor-icons/react';
import CreatePiggyBankDialog from '../components/CreatePiggyBankDialog';
import { toast } from 'sonner';
import { getIcon } from '../utils/iconMap';

const colorClasses = {
  mint: 'bg-[#A8E6CF]',
  lavender: 'bg-[#DCD3FF]',
  peach: 'bg-[#FFD3B6]',
  coral: 'bg-[#FF9B9B]',
  yellow: 'bg-[#FFE8A1]',
};

const STORAGE_KEY = 'hucha_piggy_banks';

const demoPiggyBanks = [
  {
    id: '1',
    name: 'Viaje',
    balance: 250,
    goal: 1000,
    color: 'mint',
    icon: 'piggy-bank',
  },
  {
    id: '2',
    name: 'Caprichos',
    balance: 80,
    goal: 300,
    color: 'lavender',
    icon: 'coins',
  },
];

const loadPiggyBanks = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoPiggyBanks));
      return demoPiggyBanks;
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading piggy banks:', error);
    return demoPiggyBanks;
  }
};

const savePiggyBanks = (piggyBanks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(piggyBanks));
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [piggyBanks, setPiggyBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [piggyBankToDelete, setPiggyBankToDelete] = useState(null);

  const fetchPiggyBanks = () => {
    try {
      const data = loadPiggyBanks();
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

  const handleDeletePiggyBank = () => {
    if (!piggyBankToDelete) return;

    try {
      const updatedPiggyBanks = piggyBanks.filter(
        (pb) => pb.id !== piggyBankToDelete.id
      );

      setPiggyBanks(updatedPiggyBanks);
      savePiggyBanks(updatedPiggyBanks);
      setPiggyBankToDelete(null);
      toast.success('Hucha eliminada correctamente');
    } catch (error) {
      console.error('Error deleting piggy bank:', error);
      toast.error('Error al eliminar la hucha');
    }
  };

  const totalSavings = piggyBanks.reduce((sum, pb) => sum + (pb.balance || 0), 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
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
              <button
                onClick={() => navigate('/statistics')}
                className="neo-button flex items-center space-x-2"
                data-testid="statistics-button"
              >
                <ChartBar size={20} weight="bold" />
                <span className="hidden sm:inline">Estadísticas</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-2">
            Hola
          </h2>
          <div className="flex items-center space-x-3 mt-4">
            <Coins size={32} weight="duotone" className="text-[#1A1A1A]" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                Total Ahorrado
              </p>
              <p className="text-3xl font-black text-[#1A1A1A]" data-testid="total-savings">
                €{totalSavings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

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
                    className={`neo-card ${colorClasses[piggyBank.color] || colorClasses.mint} p-6 relative`}
                    data-testid={`piggy-bank-card-${piggyBank.id}`}
                  >
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
                            €{Number(piggyBank.balance || 0).toFixed(2)}
                          </p>
                        </div>
                        <IconComponent size={40} weight="duotone" className="text-[#1A1A1A]" />
                      </div>

                      {piggyBank.goal ? (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                            <span>Meta</span>
                            <span>€{Number(piggyBank.goal).toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-[#1A1A1A] transition-all"
                              style={{
                                width: `${Math.min(
                                  (Number(piggyBank.balance || 0) / Number(piggyBank.goal || 1)) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs font-medium text-[#1A1A1A] mt-1">
                            {(
                              (Number(piggyBank.balance || 0) / Number(piggyBank.goal || 1)) * 100
                            ).toFixed(0)}
                            % completado
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {showCreateDialog && (
        <CreatePiggyBankDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchPiggyBanks();
          }}
        />
      )}

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
              Se perderá el saldo de{' '}
              <span className="font-bold">
                €{Number(piggyBankToDelete.balance || 0).toFixed(2)}
              </span>{' '}
              y todo el historial. Esta acción no se puede deshacer.
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