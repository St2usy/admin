import React, { useState, useEffect, useCallback } from 'react';
import {
  resourcesApi,
  financeReportApi,
  ResourceFileResponse,
  FinanceReportResponse,
  ResourceCategory,
  ResourceStats,
  CATEGORY_INFO,
} from '@/api/resources';
const isGallery = (cat: ResourceCategory) => cat === 'gallery';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Loading } from '@/components/common/Loading';
import { getErrorMessage } from '@/api/client';

const CATEGORIES: ResourceCategory[] = ['inspection', 'finance', 'gallery', 'study-support'];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

// 월별 업로드가 필요한 카테고리
const PERIOD_CATEGORIES: ResourceCategory[] = ['inspection', 'study-support'];

export const ResourceUploadPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('inspection');
  const [files, setFiles] = useState<ResourceFileResponse[]>([]);
  const [financeReports, setFinanceReports] = useState<FinanceReportResponse[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // 회계 보고서 폼 상태
  const [financeForm, setFinanceForm] = useState({
    title: '',
    description: '',
    year: CURRENT_YEAR,
    month: new Date().getMonth() + 1,
  });
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  // 시설점검/심과함께 업로드 폼 상태
  const [periodForm, setPeriodForm] = useState({
    year: CURRENT_YEAR,
    month: new Date().getMonth() + 1,
  });
  const [selectedPeriodFiles, setSelectedPeriodFiles] = useState<File[]>([]);

  // 갤러리 업로드 폼 (제목, 상세정보, 행사일)
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    eventDate: '', // yyyy-MM-dd
  });
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);

  // 조회 필터 상태
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);

  // 갤러리 제목/행사일 수정 모달
  const [editingFile, setEditingFile] = useState<ResourceFileResponse | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; eventDate: string }>({
    title: '',
    eventDate: '',
  });
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // 통계 조회
  const fetchStats = useCallback(async () => {
    try {
      const data = await resourcesApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('통계 조회 실패:', err);
    }
  }, []);

  // 사용 가능한 연도 목록 조회
  const fetchAvailableYears = useCallback(async () => {
    if (PERIOD_CATEGORIES.includes(selectedCategory)) {
      try {
        const years = await resourcesApi.getAvailableYears(selectedCategory);
        setAvailableYears(years);
        if (years.length > 0 && !filterYear) {
          setFilterYear(years[0]);
        }
      } catch (err) {
        console.error('연도 목록 조회 실패:', err);
      }
    }
  }, [selectedCategory, filterYear]);

  // 사용 가능한 월 목록 조회
  const fetchAvailableMonths = useCallback(async () => {
    if (PERIOD_CATEGORIES.includes(selectedCategory) && filterYear) {
      try {
        const months = await resourcesApi.getAvailableMonths(selectedCategory, filterYear);
        setAvailableMonths(months);
        if (months.length > 0) {
          setFilterMonth(months[0]);
        } else {
          setFilterMonth(null);
        }
      } catch (err) {
        console.error('월 목록 조회 실패:', err);
      }
    }
  }, [selectedCategory, filterYear]);

  // 파일 목록 조회
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedCategory === 'finance') {
        // 회계 보고서는 별도 API 사용
        const data = await financeReportApi.getReports({ page: 0, size: 100 });
        setFinanceReports(data.content);
        setFiles([]);
      } else if (PERIOD_CATEGORIES.includes(selectedCategory) && filterYear && filterMonth) {
        // 시설점검/심과함께는 연도/월별 조회
        const data = await resourcesApi.getFilesByPeriod(selectedCategory, filterYear, filterMonth);
        setFiles(data);
        setFinanceReports([]);
      } else if (!PERIOD_CATEGORIES.includes(selectedCategory)) {
        // 갤러리는 전체 조회
        const data = await resourcesApi.getAllFilesByCategory(selectedCategory);
        setFiles(data);
        setFinanceReports([]);
      } else {
        setFiles([]);
        setFinanceReports([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, filterYear, filterMonth]);

  // 카테고리 변경 시 필터 초기화
  useEffect(() => {
    setFilterYear(null);
    setFilterMonth(null);
    setAvailableYears([]);
    setAvailableMonths([]);
    setSelectedPeriodFiles([]);
    setSelectedGalleryFiles([]);
    setPeriodForm({ year: CURRENT_YEAR, month: new Date().getMonth() + 1 });
    setGalleryForm({ title: '', description: '', eventDate: '' });
  }, [selectedCategory]);

  useEffect(() => {
    fetchStats();
    fetchAvailableYears();
  }, [fetchStats, fetchAvailableYears]);

  useEffect(() => {
    if (filterYear) {
      fetchAvailableMonths();
    }
  }, [filterYear, fetchAvailableMonths]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // 일반 파일 업로드 처리 (gallery용)
  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (selectedCategory === 'finance') {
      // finance는 별도 처리
      setSelectedPdfFile(fileList[0]);
      return;
    }
    if (PERIOD_CATEGORIES.includes(selectedCategory)) {
      // 시설점검/심과함께는 파일 선택만 (바로 업로드 안함)
      setSelectedPeriodFiles(Array.from(fileList));
      return;
    }

    // 갤러리는 파일만 선택 (폼 입력 후 업로드 버튼으로 전송)
    setSelectedGalleryFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  // 갤러리 업로드 (제목·상세정보·행사일 적용)
  const handleGalleryUpload = async () => {
    if (selectedGalleryFiles.length === 0) {
      setError('파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const meta = {
        title: galleryForm.title.trim() || undefined,
        description: galleryForm.description.trim() || undefined,
        eventDate: galleryForm.eventDate.trim() || undefined,
      };
      const uploadPromises = selectedGalleryFiles.map((file) =>
        resourcesApi.uploadFile(selectedCategory, file, meta)
      );
      await Promise.all(uploadPromises);
      setSuccess(`${selectedGalleryFiles.length}개 파일이 업로드되었습니다.`);
      setSelectedGalleryFiles([]);
      setGalleryForm({ title: '', description: '', eventDate: '' });
      fetchFiles();
      fetchStats();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  // 시설점검/심과함께 업로드
  const handlePeriodUpload = async () => {
    if (selectedPeriodFiles.length === 0) {
      setError('파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadPromises = selectedPeriodFiles.map((file) =>
        resourcesApi.uploadFile(selectedCategory, file, {
          year: periodForm.year,
          month: periodForm.month,
        })
      );
      await Promise.all(uploadPromises);
      setSuccess(`${selectedPeriodFiles.length}개 파일이 ${periodForm.year}년 ${periodForm.month}월에 업로드되었습니다.`);
      setSelectedPeriodFiles([]);
      // 필터를 업로드한 연도/월로 변경
      setFilterYear(periodForm.year);
      setFilterMonth(periodForm.month);
      fetchFiles();
      fetchStats();
      fetchAvailableYears();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  // 회계 보고서 등록
  const handleFinanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdfFile) {
      setError('PDF 파일을 선택해주세요.');
      return;
    }
    if (!financeForm.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. PDF 파일 업로드
      const uploadResult = await financeReportApi.uploadPdf(selectedPdfFile);

      // 2. 회계 보고서 등록
      await financeReportApi.createReport({
        title: financeForm.title,
        description: financeForm.description || undefined,
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        fileSize: uploadResult.fileSize,
        year: financeForm.year,
        month: financeForm.month,
      });

      setSuccess('회계 보고서가 등록되었습니다.');
      setFinanceForm({ title: '', description: '', year: CURRENT_YEAR, month: new Date().getMonth() + 1 });
      setSelectedPdfFile(null);
      fetchFiles();
      fetchStats();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 삭제
  const handleDelete = async (id: number, fileName: string) => {
    if (!confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) return;

    try {
      if (selectedCategory === 'finance') {
        await financeReportApi.deleteReport(id);
      } else {
        await resourcesApi.deleteFile(id);
      }
      setSuccess('파일이 삭제되었습니다.');
      fetchFiles();
      fetchStats();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // 갤러리 제목/행사일 수정 모달 열기 (행사일은 DB created_at에 반영됨)
  const openEditMeta = (file: ResourceFileResponse) => {
    setEditingFile(file);
    setEditForm({
      title: file.title ?? '',
      eventDate: file.createdAt ? String(file.createdAt).slice(0, 10) : '',
    });
  };

  const closeEditMeta = () => {
    setEditingFile(null);
    setEditForm({ title: '', eventDate: '' });
  };

  const saveFileMeta = async () => {
    if (!editingFile) return;
    setIsSavingMeta(true);
    setError(null);
    try {
      await resourcesApi.updateFileMeta(editingFile.id, {
        title: editForm.title.trim() || null,
        eventDate: editForm.eventDate.trim() || null,
      });
      setSuccess('수정되었습니다.');
      closeEditMeta();
      fetchFiles();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSavingMeta(false);
    }
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 날짜 포맷
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const categoryInfo = CATEGORY_INFO[selectedCategory];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">파일 업로드 관리</h1>

      {/* 알림 */}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* 카테고리 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <div className="text-sm font-medium">{CATEGORY_INFO[cat].label}</div>
            <div className="text-2xl font-bold mt-1">
              {stats ? stats[cat] : '-'}
            </div>
            <div className="text-xs mt-1 opacity-75">파일</div>
          </div>
        ))}
      </div>

      {/* 업로드 영역 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">{categoryInfo.label} 업로드</h2>
        <p className="text-gray-600 text-sm mb-4">{categoryInfo.description}</p>

        {selectedCategory === 'finance' ? (
          /* 회계 보고서 폼 */
          <form onSubmit={handleFinanceSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={financeForm.title}
                  onChange={(e) => setFinanceForm({ ...financeForm, title: e.target.value })}
                  placeholder="예: 2026년 1월 회계 보고서"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연도</label>
                  <select
                    value={financeForm.year}
                    onChange={(e) => setFinanceForm({ ...financeForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {YEARS.map((year) => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
                  <select
                    value={financeForm.month}
                    onChange={(e) => setFinanceForm({ ...financeForm, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MONTHS.map((month) => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
              <textarea
                value={financeForm.description}
                onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
                placeholder="회계 보고서에 대한 간단한 설명"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF 파일 <span className="text-red-500">*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file?.type === 'application/pdf') {
                    setSelectedPdfFile(file);
                  } else {
                    setError('PDF 파일만 업로드 가능합니다.');
                  }
                }}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedPdfFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📄</span>
                    <span className="text-gray-700">{selectedPdfFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPdfFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">PDF 파일을 드래그하거나 선택하세요</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedPdfFile(file);
                        }}
                        className="hidden"
                      />
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 text-sm">
                        파일 선택
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUploading || !selectedPdfFile || !financeForm.title.trim()}>
                {isUploading ? '등록 중...' : '회계 보고서 등록'}
              </Button>
            </div>
          </form>
        ) : PERIOD_CATEGORIES.includes(selectedCategory) ? (
          /* 시설점검/심과함께 - 연도/월 선택 폼 */
          <div className="space-y-4">
            {/* 연도/월 선택 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연도 <span className="text-red-500">*</span>
                </label>
                <select
                  value={periodForm.year}
                  onChange={(e) => setPeriodForm({ ...periodForm, year: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  월 <span className="text-red-500">*</span>
                </label>
                <select
                  value={periodForm.month}
                  onChange={(e) => setPeriodForm({ ...periodForm, month: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>{month}월</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 파일 선택 영역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지 파일 <span className="text-red-500">*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedPeriodFiles.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">{selectedPeriodFiles.length}개 파일 선택됨</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedPeriodFiles.map((file, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {file.name}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriodFiles([])}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      선택 취소
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-600 mb-2">
                      이미지를 드래그하거나 선택하세요
                    </p>
                    <label className="inline-block">
                      <input
                        type="file"
                        multiple
                        accept={categoryInfo.accept}
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 text-sm">
                        파일 선택
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      여러 파일 동시 선택 가능 (jpeg, png, gif, webp)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 업로드 버튼 */}
            <div className="flex justify-end">
              <Button
                onClick={handlePeriodUpload}
                disabled={isUploading || selectedPeriodFiles.length === 0}
              >
                {isUploading ? '업로드 중...' : `${periodForm.year}년 ${periodForm.month}월에 업로드`}
              </Button>
            </div>
          </div>
        ) : (
          /* 갤러리 - 제목·상세정보·행사일 입력 후 파일 업로드 */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 (카드에 표시)</label>
                <input
                  type="text"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="예: 2026 동계 MT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">행사일 (user-front 표시용)</label>
                <input
                  type="date"
                  value={galleryForm.eventDate}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상세정보 (선택)</label>
              <textarea
                value={galleryForm.description}
                onChange={(e) => setGalleryForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="갤러리 이미지에 대한 설명"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지 파일 <span className="text-red-500">*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedGalleryFiles.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">{selectedGalleryFiles.length}개 파일 선택됨</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedGalleryFiles.map((file, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {file.name}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryFiles([])}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      선택 취소
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-600 mb-2">
                      이미지를 드래그하거나 선택하세요
                    </p>
                    <label className="inline-block">
                      <input
                        type="file"
                        multiple
                        accept={categoryInfo.accept}
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                        파일 선택
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      이미지 파일만 가능 (jpeg, png, gif, webp)
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleGalleryUpload}
                disabled={isUploading || selectedGalleryFiles.length === 0}
              >
                {isUploading ? '업로드 중...' : '업로드'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 파일 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold">
              {categoryInfo.label} 파일 목록 ({selectedCategory === 'finance' ? financeReports.length : files.length}개)
            </h2>
            
            {/* 시설점검/심과함께 연도/월 필터 */}
            {PERIOD_CATEGORIES.includes(selectedCategory) && availableYears.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={filterYear || ''}
                  onChange={(e) => {
                    const year = e.target.value ? Number(e.target.value) : null;
                    setFilterYear(year);
                    setFilterMonth(null);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">연도 선택</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
                {filterYear && availableMonths.length > 0 && (
                  <select
                    value={filterMonth || ''}
                    onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : null)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">월 선택</option>
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loading />
          </div>
        ) : selectedCategory === 'finance' ? (
          /* 회계 보고서 목록 */
          financeReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              등록된 회계 보고서가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">제목</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">기간</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">파일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">크기</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">등록일</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {financeReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{report.title}</div>
                        {report.description && (
                          <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {report.year}년 {report.month}월
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {report.fileName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatFileSize(report.fileSize)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            보기
                          </a>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(report.id, report.title)}
                            className="text-sm px-3 py-1"
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* 일반 파일 목록 */
          files.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {PERIOD_CATEGORIES.includes(selectedCategory) && (!filterYear || !filterMonth)
                ? '연도와 월을 선택하여 파일을 조회하세요.'
                : '업로드된 파일이 없습니다.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">미리보기</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {isGallery(selectedCategory) ? '제목' : '파일명'}
                    </th>
                    {isGallery(selectedCategory) && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">행사일</th>
                    )}
                    {PERIOD_CATEGORIES.includes(selectedCategory) && !isGallery(selectedCategory) && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">기간</th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">크기</th>
                    {!isGallery(selectedCategory) && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">업로드일</th>
                    )}
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {file.fileType.startsWith('image/') ? (
                          <img
                            src={file.fileUrl}
                            alt={file.originalFileName}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">
                            📄
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isGallery(selectedCategory) ? (
                          <div className="font-medium text-sm">{file.title || file.originalFileName}</div>
                        ) : (
                          <>
                            <div className="font-medium text-sm">{file.originalFileName}</div>
                            {file.title && (
                              <div className="text-xs text-gray-500">{file.title}</div>
                            )}
                          </>
                        )}
                      </td>
                      {isGallery(selectedCategory) && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDateOnly(file.createdAt)}
                        </td>
                      )}
                      {PERIOD_CATEGORIES.includes(selectedCategory) && !isGallery(selectedCategory) && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {file.year && file.month ? `${file.year}년 ${file.month}월` : '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatFileSize(file.fileSize)}
                      </td>
                      {!isGallery(selectedCategory) && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(file.createdAt)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2 flex-wrap">
                          {isGallery(selectedCategory) && (
                            <Button
                              variant="secondary"
                              onClick={() => openEditMeta(file)}
                              className="text-sm px-3 py-1"
                            >
                              수정
                            </Button>
                          )}
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            보기
                          </a>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(file.id, file.originalFileName)}
                            className="text-sm px-3 py-1"
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* 갤러리 제목/행사일 수정 모달 */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">제목 · 행사일 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 (카드에 표시)</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={editingFile.originalFileName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">행사일 (user-front 표시용)</label>
                <input
                  type="date"
                  value={editForm.eventDate}
                  onChange={(e) => setEditForm((f) => ({ ...f, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={closeEditMeta} disabled={isSavingMeta}>
                취소
              </Button>
              <Button onClick={saveFileMeta} disabled={isSavingMeta}>
                {isSavingMeta ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
