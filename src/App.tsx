import { useState } from 'react';
import { Layout } from './components/Layout';
import { SearchBar } from './components/SearchBar';
import { PrescriptionList } from './components/PrescriptionList';
import { PrescriptionDetail } from './components/PrescriptionDetail';
import { PrescriptionForm } from './components/PrescriptionForm';
import { usePrescriptions } from './hooks/usePrescriptions';
import { useUnitSettings } from './hooks/useUnitSettings';
import type { Prescription, PrescriptionInput } from './types/prescription';
import type { DonConversionRate } from './utils/unitConversion';
import './index.css';

type ViewMode = 'list' | 'detail' | 'add' | 'edit';

function App() {
  const { prescriptions, add, update, remove, search, refresh } = usePrescriptions();
  const { showGrams, donRate, toggleShowGrams, setDonRate } = useUnitSettings();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[] | null>(null);

  // 검색 핸들러
  const handleSearch = (query: string, includeHerbs: string[], excludeHerbs: string[], modHerb: string = '', modAction: string = '') => {
    if (!query && includeHerbs.length === 0 && excludeHerbs.length === 0 && !modHerb && !modAction) {
      setFilteredPrescriptions(null);
    } else {
      const results = search(query, includeHerbs, excludeHerbs, modHerb, modAction);
      setFilteredPrescriptions(results);
    }
  };

  // 검색 초기화
  const handleClearSearch = () => {
    setFilteredPrescriptions(null);
  };

  // 처방 선택
  const handleSelect = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setViewMode('detail');
  };

  // 새 처방 추가 시작
  const handleAddStart = () => {
    setSelectedPrescription(null);
    setViewMode('add');
  };

  // 수정 시작
  const handleEditStart = () => {
    setViewMode('edit');
  };

  // 저장 처리
  const handleSave = (input: PrescriptionInput) => {
    if (viewMode === 'add') {
      add(input);
    } else if (viewMode === 'edit' && selectedPrescription) {
      update(selectedPrescription.id, input);
    }
    setViewMode('list');
    setSelectedPrescription(null);
    setFilteredPrescriptions(null);
  };

  // 삭제 처리
  const handleDelete = () => {
    if (selectedPrescription) {
      remove(selectedPrescription.id);
      setViewMode('list');
      setSelectedPrescription(null);
      setFilteredPrescriptions(null);
    }
  };

  // 취소/닫기
  const handleClose = () => {
    setViewMode('list');
    setSelectedPrescription(null);
  };

  // 변환율 변경 핸들러
  const handleDonRateChange = (rate: DonConversionRate) => {
    setDonRate(rate);
  };

  // 표시할 처방 목록
  const displayPrescriptions = filteredPrescriptions ?? prescriptions;

  return (
    <Layout
      onRefresh={refresh}
      showGrams={showGrams}
      donRate={donRate}
      onToggleGrams={toggleShowGrams}
      onDonRateChange={handleDonRateChange}
    >
      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

      <PrescriptionList
        prescriptions={displayPrescriptions}
        onSelect={handleSelect}
        onAdd={handleAddStart}
        showGrams={showGrams}
        donRate={donRate}
      />

      {viewMode === 'detail' && selectedPrescription && (
        <PrescriptionDetail
          prescription={selectedPrescription}
          onEdit={handleEditStart}
          onDelete={handleDelete}
          onClose={handleClose}
          showGrams={showGrams}
          donRate={donRate}
        />
      )}

      {(viewMode === 'add' || viewMode === 'edit') && (
        <PrescriptionForm
          prescription={viewMode === 'edit' ? selectedPrescription ?? undefined : undefined}
          onSave={handleSave}
          onCancel={handleClose}
        />
      )}
    </Layout>
  );
}

export default App;
