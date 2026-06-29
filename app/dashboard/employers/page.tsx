'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Building2, MapPin, Edit, Trash2, X } from 'lucide-react';

const mockEmployers = [
  { id: 1, name: 'Coffee Co', store: 'Central', rate: 10, currency: 'GBP', active: true, totalEarnings: 450 },
  { id: 2, name: 'Retail Plus', store: 'Downtown', rate: 12, currency: 'GBP', active: true, totalEarnings: 720 },
  { id: 3, name: 'Delivery Co', store: 'Various', rate: 15, currency: 'GBP', active: false, totalEarnings: 300 },
];

export default function EmployersPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <DashboardLayout>
      {/* Overlay */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      {/* Slide-in Side Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] flex flex-col p-8 transition-transform duration-300 ease-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-bold text-[#005ea3]">Add Employer</h2>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Employer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Hourly Rate (£)
              </label>
              <input
                type="number"
                placeholder="22.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Currency
              </label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm">
                <option>GBP (£)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Location / Store
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="City or store name"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Company Website (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm"
            />
          </div>

          <div className="pt-8 border-t border-gray-100 flex gap-3 mt-auto">
            <button
              onClick={() => setIsPanelOpen(false)}
              className="flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors rounded-lg border border-gray-200"
            >
              Cancel
            </button>
            <button className="flex-[2] py-3.5 text-[11px] font-bold uppercase tracking-widest text-white rounded-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #005ea3 0%, #006a44 100%)' }}
            >
              Save Employer
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#005ea3]">Employers</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your employer information</p>
          </div>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-2 px-5 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-md hover:scale-[1.02] transition-all"
            style={{ background: 'linear-gradient(135deg, #005ea3 0%, #006a44 100%)' }}
          >
            <Plus className="h-4 w-4" />
            Add Employer
          </button>
        </div>

        {/* Employers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEmployers.map((employer) => (
            <div
              key={employer.id}
              className="group bg-white rounded-xl p-6 border border-gray-200/80 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-l-4 hover:border-l-[#005ea3] transition-all duration-300"
              style={{ boxShadow: '0 4px 6px -1px rgba(0,123,210,0.08), 0 2px 4px -1px rgba(0,123,210,0.04)' }}
            >
              {/* Card Top */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-100 rounded-lg text-[#005ea3]">
                  <Building2 className="h-6 w-6" />
                </div>
                {employer.active ? (
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ background: 'linear-gradient(135deg, #005ea3 0%, #006a44 100%)' }}
                  >
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-400">
                    Paused
                  </span>
                )}
              </div>

              {/* Name & Store */}
              <h3 className="font-bold text-gray-900 mb-1">{employer.name}</h3>
              <div className="flex items-center gap-1.5 text-gray-400 mb-6">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-xs">{employer.store}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100 mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Hourly Rate
                  </p>
                  <p className="font-mono text-lg font-semibold text-gray-900">
                    £{employer.rate}
                    <span className="text-xs text-gray-400 font-sans">/h</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Total Earned
                  </p>
                  <p className="font-mono text-lg font-semibold text-[#006a44]">
                    £{employer.totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-[11px] font-bold uppercase tracking-widest rounded-lg">
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-100 text-red-400 hover:bg-red-50 transition-colors text-[11px] font-bold uppercase tracking-widest rounded-lg">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state (shown when no employers) */}
        {mockEmployers.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="mb-6 p-8 bg-gray-100 rounded-full">
              <Building2 className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No employers yet</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-xs">
              Add your first employer to start tracking your earnings and shifts.
            </p>
            <button
              onClick={() => setIsPanelOpen(true)}
              className="px-8 py-4 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-lg hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #005ea3 0%, #006a44 100%)' }}
            >
              Add Your First Employer
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}