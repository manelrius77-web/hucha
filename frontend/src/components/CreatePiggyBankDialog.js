import React, { useState } from 'react';
import {
  PiggyBank,
  Airplane,
  House,
  Car,
  GraduationCap,
  Heart,
  Gift,
  ShoppingCart,
  GameController,
  Rocket,
  Hamburger,
  Confetti,
} from '@phosphor-icons/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'hucha_piggy_banks';

const colors = [
  { name: 'Menta', value: 'mint', class: 'bg-[#A8E6CF]' },
  { name: 'Lavanda', value: 'lavender', class: 'bg-[#DCD3FF]' },
  { name: 'Melocotón', value: 'peach', class: 'bg-[#FFD3B6]' },
  { name: 'Coral', value: 'coral', class: 'bg-[#FF9B9B]' },
  { name: 'Amarillo', value: 'yellow', class: 'bg-[#FFE8A1]' },
];

const icons = [
  { name: 'Hucha', value: 'piggy-bank', Component: PiggyBank },
  { name: 'Viaje', value: 'airplane', Component: Airplane },
  { name: 'Casa', value: 'house', Component: House },
  { name: 'Coche', value: 'car', Component: Car },
  { name: 'Educación', value: 'graduation', Component: GraduationCap },
  { name: 'Salud', value: 'heart', Component: Heart },
  { name: 'Regalo', value: 'gift', Component: Gift },
  { name: 'Compras', value: 'shopping', Component: ShoppingCart },
  { name: 'Ocio', value: 'game', Component: GameController },
  { name: 'Proyectos', value: 'rocket', Component: Rocket },
  { name: 'Comida', value: 'food', Component: Hamburger },
  { name: 'Fiesta', value: 'party', Component: Confetti },
];

const loadPiggyBanks = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading piggy banks:', error);
    return [];
  }
};

const savePiggyBanks = (piggyBanks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(piggyBanks));
};

const CreatePiggyBankDialog = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('mint');
  const [selectedIcon, setSelectedIcon] = useState('piggy-bank');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Por favor, introduce un nombre');
      return;
    }

    setLoading(true);

    try {
      const currentPiggyBanks = loadPiggyBanks();

      const newPiggyBank = {
        id: Date.now().toString(),
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
        goal: goal ? parseFloat(goal) : null,
        balance: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedPiggyBanks = [newPiggyBank, ...currentPiggyBanks];
      savePiggyBanks(updatedPiggyBanks);

      toast.success('¡Hucha creada!');
      onSuccess();
    } catch (error) {
      console.error('Error creating piggy bank:', error);
      toast.error('Error al crear la hucha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#1A1A1A] bg-opacity-50 flex items-center justify-center z-50 p-4"
      data-testid="create-piggy-bank-dialog"
    >
      <div className="bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A]">
            Nueva Hucha
          </h3>
          <button
            onClick={onClose}
            className="text-[#1A1A1A] hover:bg-[#FDFBF7] p-2 rounded-lg transition-colors"
            data-testid="close-dialog-button"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
              Nombre de la Hucha
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="neo-input"
              placeholder="Ej: Vacaciones, Coche nuevo..."
              required
              data-testid="piggy-bank-name-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`${color.class} border-2 ${
                    selectedColor === color.value
                      ? 'border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]'
                      : 'border-[#1A1A1A]'
                  } rounded-xl h-16 transition-all hover:shadow-[3px_3px_0px_#1A1A1A]`}
                  data-testid={`color-${color.value}`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
              Icono
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-[#FDFBF7] border-2 border-[#1A1A1A] rounded-xl">
              {icons.map((icon) => {
                const IconComponent = icon.Component;
                const colorClass =
                  colors.find((c) => c.value === selectedColor)?.class || 'bg-[#A8E6CF]';

                return (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setSelectedIcon(icon.value)}
                    className={`${colorClass} border-2 ${
                      selectedIcon === icon.value
                        ? 'border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]'
                        : 'border-[#1A1A1A] opacity-70'
                    } rounded-xl h-12 flex items-center justify-center transition-all hover:opacity-100 hover:shadow-[2px_2px_0px_#1A1A1A]`}
                    data-testid={`icon-${icon.value}`}
                    title={icon.name}
                  >
                    <IconComponent size={24} weight="duotone" className="text-[#1A1A1A]" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
              Meta de Ahorro (Opcional) - €
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="neo-input"
              placeholder="0.00"
              data-testid="goal-input"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="neo-button neo-button-secondary flex-1"
              disabled={loading}
              data-testid="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="neo-button flex-1"
              disabled={loading}
              data-testid="create-button"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePiggyBankDialog;