/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { HospitalProfile, IcraRecord, MasterCatalogItem } from './types';
import {
  clearAllRecords,
  getDistinctYears,
  getStoredProfile,
  getStoredRecords,
  getStoredMasterCatalog,
  saveStoredMasterCatalog,
  resetMasterCatalogToSeed,
  resetToSeedData,
  saveStoredProfile,
  saveStoredRecords
} from './utils/storage';
import { LoginPage } from './components/LoginPage';
import { NavViewKey, Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InputView } from './components/InputView';
import { DataView } from './components/DataView';
import { DataExplorerView } from './components/DataExplorerView';
import { MasterDatabaseView } from './components/MasterDatabaseView';
import { GuideView } from './components/GuideView';
import { SettingsView } from './components/SettingsView';
import { Menu, X, BookOpen } from 'lucide-react';

const AUTH_STORAGE_KEY = 'siloam_icra_auth_user_v1';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  });

  // Data State
  const [profile, setProfile] = useState<HospitalProfile>(getStoredProfile);
  const [records, setRecords] = useState<IcraRecord[]>(getStoredRecords);
  const [catalog, setCatalog] = useState<MasterCatalogItem[]>(getStoredMasterCatalog);
  const [currentView, setCurrentView] = useState<NavViewKey>('dashboard');
  const [editRecordId, setEditRecordId] = useState<string | null>(null);

  // Mobile sidebar open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Guide modal state
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Synchronize records with localStorage
  const updateRecords = (newRecords: IcraRecord[]) => {
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  const updateProfile = (newProfile: HospitalProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
  };

  const updateCatalog = (newCatalog: MasterCatalogItem[]) => {
    setCatalog(newCatalog);
    saveStoredMasterCatalog(newCatalog);
  };

  const handleLoginSuccess = (username: string) => {
    localStorage.setItem(AUTH_STORAGE_KEY, username);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  };

  const handleSaveRecord = (record: IcraRecord) => {
    const exists = records.some(r => r.id === record.id);
    let updated: IcraRecord[];
    if (exists) {
      updated = records.map(r => (r.id === record.id ? record : r));
    } else {
      updated = [record, ...records];
    }
    updateRecords(updated);
    setEditRecordId(null);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    updateRecords(updated);
    if (editRecordId === id) setEditRecordId(null);
  };

  const handleEditRecord = (id: string) => {
    setEditRecordId(id);
    setCurrentView('input');
    setMobileMenuOpen(false);
  };

  const handleCancelEdit = () => {
    setEditRecordId(null);
    setCurrentView('dashboard');
  };

  const handleUpdateRecordStatus = (id: string, newStatus: 'Belum' | 'Proses' | 'Selesai') => {
    const updated = records.map(r => (r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r));
    updateRecords(updated);
  };

  const handleImportRecords = (imported: Partial<IcraRecord>[]) => {
    const now = new Date().toISOString();
    const formatted: IcraRecord[] = imported.map((r, i) => ({
      id: r.id || `imp-${Date.now()}-${i}`,
      seq: records.length + i + 1,
      tahun: r.tahun || profile.year || 2026,
      unit: r.unit || 'Seluruh Departemen',
      grup: r.grup || 'Umum',
      subgrup: r.subgrup || '',
      masalah: r.masalah || '',
      L: r.L || 1,
      I: r.I || 1,
      S: r.S || 1,
      status: r.status || 'Belum',
      tujuan: r.tujuan || '',
      indikator: r.indikator || '',
      rencana: r.rencana || '',
      pic: r.pic || '',
      target: r.target || '',
      bukti: r.bukti || '',
      ket: r.ket || 'Diimpor dari file Excel',
      createdAt: r.createdAt || now,
      updatedAt: now
    }));

    const updated = [...formatted, ...records];
    updateRecords(updated);
  };

  const handleRestoreBackup = (backupRecords: IcraRecord[], backupProfile?: HospitalProfile) => {
    updateRecords(backupRecords);
    if (backupProfile) {
      updateProfile(backupProfile);
    }
  };

  const handleCopyYear = (fromYear: number, toYear: number, unitFilter?: string) => {
    const sourceRecords = records.filter(
      r => r.tahun === fromYear && (!unitFilter || r.unit === unitFilter)
    );
    const now = new Date().toISOString();
    const newItems: IcraRecord[] = sourceRecords.map((r, idx) => ({
      ...r,
      id: `copy-${toYear}-${Date.now()}-${idx}`,
      tahun: toYear,
      seq: records.length + idx + 1,
      status: 'Belum',
      bukti: '',
      ket: `Disalin dari penilaian tahun ${fromYear}`,
      createdAt: now,
      updatedAt: now
    }));

    updateRecords([...newItems, ...records]);
  };

  const handleResetSeedData = () => {
    const initial = resetToSeedData();
    setRecords(initial);
  };

  // Master Catalog handlers
  const handleSaveMasterItem = (item: MasterCatalogItem) => {
    const exists = catalog.some(c => c.id === item.id);
    let updated: MasterCatalogItem[];
    if (exists) {
      updated = catalog.map(c => (c.id === item.id ? item : c));
    } else {
      updated = [item, ...catalog];
    }
    updateCatalog(updated);
  };

  const handleDeleteMasterItem = (id: string) => {
    const updated = catalog.filter(c => c.id !== id);
    updateCatalog(updated);
  };

  const handleResetMasterCatalog = () => {
    const initial = resetMasterCatalogToSeed();
    setCatalog(initial);
  };

  const handleSelectForAssessment = (item: MasterCatalogItem) => {
    setEditRecordId(null);
    setCurrentView('input');
  };

  const distinctYears = useMemo(() => getDistinctYears(records), [records]);

  // If not logged in, render Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        hospitalName={profile.hospital}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f2] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#0f4c5c] text-white p-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-[#0f4c5c] font-black flex items-center justify-center text-xs shadow-xs">
            ICRA
          </div>
          <div>
            <div className="font-bold text-xs truncate leading-tight">Siloam Hospitals</div>
            <div className="text-[10px] text-teal-200">Komite PPI</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar
          currentView={currentView}
          onSelectView={v => {
            setCurrentView(v);
            if (v !== 'input') setEditRecordId(null);
          }}
          recordCount={records.length}
          yearCount={distinctYears.length}
          catalogCount={catalog.length}
          profile={profile}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 flex">
          <div className="w-64 bg-[#0f4c5c] h-full flex flex-col">
            <Sidebar
              currentView={currentView}
              onSelectView={v => {
                setCurrentView(v);
                setMobileMenuOpen(false);
                if (v !== 'input') setEditRecordId(null);
              }}
              recordCount={records.length}
              yearCount={distinctYears.length}
              catalogCount={catalog.length}
              profile={profile}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
        {currentView === 'dashboard' && (
          <DashboardView
            records={records}
            profile={profile}
            onEditRecord={handleEditRecord}
          />
        )}

        {currentView === 'input' && (
          <InputView
            records={records}
            catalog={catalog}
            profile={profile}
            editRecordId={editRecordId}
            onSaveRecord={handleSaveRecord}
            onDeleteRecord={handleDeleteRecord}
            onCancelEdit={handleCancelEdit}
            onOpenGuide={() => setIsGuideModalOpen(true)}
            onOpenDatabase={() => setCurrentView('database')}
          />
        )}

        {currentView === 'data' && (
          <DataView
            records={records}
            profile={profile}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onImportRecords={handleImportRecords}
          />
        )}

        {currentView === 'explorer' && (
          <DataExplorerView
            records={records}
            profile={profile}
            onEditRecord={handleEditRecord}
            onUpdateStatus={handleUpdateRecordStatus}
          />
        )}

        {currentView === 'database' && (
          <MasterDatabaseView
            catalog={catalog}
            onSaveItem={handleSaveMasterItem}
            onDeleteItem={handleDeleteMasterItem}
            onResetCatalog={handleResetMasterCatalog}
            onSelectForAssessment={handleSelectForAssessment}
          />
        )}

        {currentView === 'guide' && <GuideView />}

        {currentView === 'settings' && (
          <SettingsView
            profile={profile}
            records={records}
            onSaveProfile={updateProfile}
            onRestoreBackup={handleRestoreBackup}
            onCopyYear={handleCopyYear}
            onResetSeedData={handleResetSeedData}
          />
        )}
      </main>

      {/* Guide Modal (Popup from Input view or anywhere) */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0f4c5c]" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Panduan Penetapan Skor ICRA
                </h3>
              </div>
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <GuideView />
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="px-4 py-2 bg-[#0f4c5c] text-white text-xs font-semibold rounded-xl hover:bg-[#13677b] cursor-pointer"
              >
                Tutup &amp; Lanjut Input
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
