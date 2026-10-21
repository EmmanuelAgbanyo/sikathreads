import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GARMENT_PRESETS, StoreService } from '../services/storeService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Calculator, X, Check, Scissors, ShoppingBag, Send, Info } from 'lucide-react';

interface FabricCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

export const FabricCalculatorModal: React.FC<FabricCalculatorModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(GARMENT_PRESETS[0].id);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentPreset = GARMENT_PRESETS.find((p) => p.id === selectedPresetId) || GARMENT_PRESETS[0];

  const handleToggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const calculation = StoreService.calculateGarmentYardage(currentPreset.id, selectedOptions);
  const totalYards = calculation?.totalYards || currentPreset.recommendedYards;
  const recommendedPieces = calculation?.recommendedPieces || Math.ceil(totalYards / 6);

  const estimatedCost = product ? totalYards * product.price : null;

  const handleAddToCart = () => {
    if (!product) return;
    const added = addToCart(product, totalYards);
    if (added) {
      addToast(
        `Added ${totalYards} ${product.sellingUnit} of "${product.name}" for ${currentPreset.name} to cart.`,
        'success'
      );
      onClose();
    }
  };

  const handleSourcingAttach = () => {
    onClose();
    navigate('/sourcing', {
      state: {
        desiredQuantity: totalYards,
        desiredFabricType: product?.fabricType || currentPreset.typicalFabric,
        occasion: currentPreset.name,
        additionalRequirements: `Estimated for ${currentPreset.name} (${totalYards} yards) with options: ${
          selectedOptions.length > 0 ? selectedOptions.join(', ') : 'standard cut'
        }.`,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-ivory rounded-2xl shadow-2xl border border-charcoal/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-charcoal/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-charcoal">Fabric Yardage Estimator</h2>
              <p className="text-xs text-charcoal-muted">
                Ghanaian & Contemporary Traditional Garment Calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-charcoal-muted hover:text-charcoal hover:bg-ivory-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target Product Badge if provided */}
          {product && (
            <div className="flex items-center gap-3 p-3 bg-white border border-gold/30 rounded-xl">
              <img
                src={product.images[0] || '/kente-weave.jpg'}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/kente-weave.jpg';
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">Selected Fabric</span>
                <p className="text-sm font-bold text-charcoal truncate">{product.name}</p>
                <p className="text-xs text-charcoal-muted font-serif">
                  GHS {product.price.toLocaleString()} per {product.sellingUnit.slice(0, -1)}
                </p>
              </div>
            </div>
          )}

          {/* Garment Presets Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-2">
              Select Garment or Ensemble Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GARMENT_PRESETS.map((preset) => {
                const isSelected = preset.id === currentPreset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setSelectedOptions([]);
                    }}
                    className={`flex flex-col text-left p-3 rounded-xl border text-sm transition-all ${
                      isSelected
                        ? 'border-gold bg-gold/5 shadow-sm text-charcoal'
                        : 'border-charcoal/10 bg-white hover:border-gold/40 text-charcoal-light'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-charcoal">{preset.name}</span>
                      <span className="text-xs font-serif font-bold text-gold px-2 py-0.5 bg-gold/10 rounded-full">
                        {preset.recommendedYards} yds
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted line-clamp-1">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Preset Details & Customizations */}
          <div className="bg-white p-4 rounded-xl border border-charcoal/10 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-charcoal text-sm">{currentPreset.name}</h4>
                <p className="text-xs text-charcoal-muted mt-0.5">{currentPreset.description}</p>
                <p className="text-xs text-burgundy font-medium mt-1">
                  Commonly tailored in: {currentPreset.typicalFabric}
                </p>
              </div>
            </div>

            {/* Custom Options */}
            {currentPreset.options && currentPreset.options.length > 0 && (
              <div className="pt-3 border-t border-charcoal/10">
                <p className="text-xs font-semibold text-charcoal mb-2">
                  Tailoring Variations & Accents:
                </p>
                <div className="space-y-2">
                  {currentPreset.options.map((opt) => {
                    const checked = selectedOptions.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          checked
                            ? 'bg-gold/10 border-gold/40 text-charcoal font-medium'
                            : 'bg-ivory/50 border-charcoal/10 text-charcoal-muted hover:border-charcoal/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleOption(opt.id)}
                            className="rounded border-charcoal/30 text-gold focus:ring-gold"
                          />
                          <span>{opt.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Result Calculation Summary Card */}
          <div className="bg-gradient-to-br from-charcoal to-charcoal-light text-ivory p-5 rounded-2xl shadow-lg border border-gold/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-ivory-muted uppercase tracking-wider">Recommended Yardage</p>
                <p className="text-3xl font-serif font-bold text-gold mt-1">{totalYards} yds</p>
                <p className="text-[11px] text-ivory-muted mt-0.5">Approx. {(totalYards * 0.9144).toFixed(1)} metres</p>
              </div>

              <div>
                <p className="text-xs text-ivory-muted uppercase tracking-wider">Standard Wax Pieces</p>
                <p className="text-3xl font-serif font-bold text-white mt-1">
                  {recommendedPieces} <span className="text-sm font-sans font-normal text-ivory-muted">piece{recommendedPieces > 1 ? 's' : ''}</span>
                </p>
                <p className="text-[11px] text-ivory-muted mt-0.5">Based on 6-yd full pieces</p>
              </div>

              {estimatedCost !== null ? (
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-ivory-muted uppercase tracking-wider">Estimated Fabric Cost</p>
                  <p className="text-3xl font-serif font-bold text-gold-light mt-1">
                    GHS {estimatedCost.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-ivory-muted mt-0.5">Fabric only (excluding tailoring)</p>
                </div>
              ) : (
                <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
                  <p className="text-xs text-ivory-muted">Tailor Consult Tip</p>
                  <p className="text-xs text-ivory-light mt-1">
                    Allow extra 0.5–1 yard if working with directional motifs or large patterns.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs text-ivory-muted">
              <Info className="w-4 h-4 text-gold flex-shrink-0" />
              <span>Tailor measurements may vary based on exact height, cut, and pattern alignment.</span>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="px-6 py-4 bg-white border-t border-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSourcingAttach}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-charcoal/20 text-charcoal hover:bg-ivory text-xs font-semibold transition-colors"
          >
            <Send className="w-4 h-4 text-gold" />
            <span>Request Sourcing for this Style</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-charcoal-muted hover:text-charcoal transition-colors"
            >
              Close
            </button>

            {product && (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-charcoal text-xs font-bold shadow transition-all duration-200"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {totalYards} Yards to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
