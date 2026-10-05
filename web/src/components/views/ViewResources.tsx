'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  CircleCheck,
  Droplet,
  Flame,
  Radio,
} from '@flux-icons/react';

interface ViewResourcesProps {
  resources: any[];
}

export function ViewResources({ resources: initialResources }: ViewResourcesProps) {
  const defaultItems = [
    {
      id: 'res-01',
      name: 'Amphibious Inflatable Rescue Craft (Zodiac MK3)',
      category: 'water_rescue',
      quantity: 8,
      availableQuantity: 5,
      isDeployable: true,
      depot: 'Okhla Flood Relief Depot',
      specs: 'Yamaha 40HP Outboard, 8-Person Capacity, Double Keel Armor',
    },
    {
      id: 'res-02',
      name: 'High-Volume Dewatering Pump (1500 L/min)',
      category: 'pumps',
      quantity: 16,
      availableQuantity: 11,
      isDeployable: true,
      depot: 'Kashmere Gate Municipal Depot',
      specs: 'Diesel 4-Stroke, 8-Inch Discharge, 24-Hour Continuous Run',
    },
    {
      id: 'res-03',
      name: 'Thermal Aerial Recon Drone Kit (Matrice 300 RTK)',
      category: 'drone',
      quantity: 6,
      availableQuantity: 4,
      isDeployable: true,
      depot: 'ITO EOC Flight Hangar',
      specs: 'Dual Zenmuse H20T Thermal & 200x Zoom, 55min Flight Endurance',
    },
    {
      id: 'res-04',
      name: 'Advanced Trauma Support Mobile Ambulance (ALS-04)',
      category: 'medical',
      quantity: 12,
      availableQuantity: 7,
      isDeployable: true,
      depot: 'AIIMS Cordon Station',
      specs: 'Ventilator, Defibrillator, Syringe Pump, Tele-Medicine Satellite Link',
    },
    {
      id: 'res-05',
      name: 'Chemical & HazMat Class-A Containment Suits',
      category: 'hazmat',
      quantity: 30,
      availableQuantity: 24,
      isDeployable: true,
      depot: 'Connaught Place Fire Station',
      specs: 'Fully Encapsulated Vapor-Tight Level-A with SCBA Oxygen Packs',
    },
    {
      id: 'res-06',
      name: 'Satellite Emergency Mesh Transceiver Pack (BGAN)',
      category: 'comms',
      quantity: 10,
      availableQuantity: 8,
      isDeployable: true,
      depot: 'Disaster Coordination Center',
      specs: 'Inmarsat BGAN Terminal, WiFi Mesh Repeater, Solar Backup Battery',
    },
  ];

  const [items, setItems] = useState<any[]>(
    initialResources && initialResources.length > 0 ? initialResources : defaultItems
  );
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    if (initialResources && initialResources.length > 0) {
      setItems(initialResources);
    }
  }, [initialResources]);

  const handleDeployOne = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.availableQuantity > 0
          ? { ...item, availableQuantity: item.availableQuantity - 1 }
          : item
      )
    );
  };

  const handleReturnOne = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.availableQuantity < item.quantity
          ? { ...item, availableQuantity: item.availableQuantity + 1 }
          : item
      )
    );
  };

  const filtered = items.filter((item) => {
    if (filterCategory === 'ALL') return true;
    return item.category === filterCategory;
  });

  const totalAssets = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const totalAvailable = items.reduce((acc, i) => acc + (i.availableQuantity || 0), 0);
  const inField = totalAssets - totalAvailable;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water_rescue':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'hazmat':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'drone':
        return <Radio className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-slate-800" />;
    }
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* 1. STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Total Equipment Assets
            </span>
            <Package className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-slate-950 mt-1 tracking-wide">
            {totalAssets} <span className="text-xs font-mono font-normal text-slate-500">units</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">
            6 specialized disaster categories
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Ready for Deployment
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-tactical text-emerald-700 mt-1 tracking-wide">
            {totalAvailable} <span className="text-xs font-mono font-normal text-emerald-600">available</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Staged at regional depots
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Deployed in Field
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-tactical text-blue-700 mt-1 tracking-wide">
            {inField} <span className="text-xs font-mono font-normal text-blue-600">in action</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">
            Active cordon operations
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Depot Readiness
            </span>
            <CircleCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-emerald-700 mt-1 tracking-wide">
            {Math.round((totalAvailable / totalAssets) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Full maintenance certified
          </div>
        </div>
      </div>

      {/* 2. COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs font-sans">
        <div>
          <h2 className="text-base font-bold text-slate-950 font-mono flex items-center space-x-2">
            <Package className="w-4 h-4 text-slate-800" />
            <span>DISASTER EQUIPMENT INVENTORY & DEPOT DEPLETION</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time tracking of amphibious boats, dewatering pumps, FLIR drones, and medical vehicles
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          NCR Central Inventory Grid
        </span>
      </div>

      {/* 3. CATEGORY FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 border border-slate-200 rounded-xl shadow-2xs text-xs font-mono">
        <span className="text-slate-400 text-[11px]">Asset Class:</span>
        {[
          { id: 'ALL', label: `All Equipment (${items.length})` },
          { id: 'water_rescue', label: 'Inflatable Boats' },
          { id: 'pumps', label: 'Dewatering Pumps' },
          { id: 'drone', label: 'Recon Drones' },
          { id: 'medical', label: 'Trauma Units' },
          { id: 'hazmat', label: 'HazMat Suits' },
          { id: 'comms', label: 'Satellite Comms' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
              filterCategory === tab.id
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. ASSETS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res: any) => {
          const availPct = Math.round((res.availableQuantity / res.quantity) * 100);

          return (
            <div
              key={res.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                      {getCategoryIcon(res.category)}
                    </div>
                    <span className="font-bold text-slate-950 uppercase text-[11px]">
                      {res.category.replace('_', ' ')}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      res.isDeployable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {res.isDeployable ? 'DEPLOYABLE' : 'MAINTENANCE'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-950 font-syne text-sm">{res.name}</h3>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Depot: {res.depot}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Inventory Ratio</span>
                    <span className="font-bold text-slate-900">
                      {res.availableQuantity} of {res.quantity} Available
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        availPct > 50 ? 'bg-emerald-500' : availPct > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${availPct}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 font-sans leading-relaxed">
                  Specs: {res.specs}
                </div>
              </div>

              {/* Action Buttons: Deploy 1 / Recall 1 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => handleDeployOne(res.id)}
                  disabled={res.availableQuantity <= 0}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                >
                  Deploy 1 Unit
                </button>

                <button
                  onClick={() => handleReturnOne(res.id)}
                  disabled={res.availableQuantity >= res.quantity}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-800 border border-slate-300 font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                >
                  Recall 1 Unit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
