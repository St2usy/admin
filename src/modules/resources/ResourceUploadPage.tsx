import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  resourcesApi,
  ResourceFileResponse,
  ResourceCategory,
  ResourceStats,
  CATEGORY_INFO,
} from '@/api/resources';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Loading } from '@/components/common/Loading';
import { getErrorMessage } from '@/api/client';

const CATEGORIES: ResourceCategory[] = ['inspection', 'finance', 'gallery', 'study-support'];

// 월 선택이 필요한 카테고리
const MONTH_REQUIRED_CATEGORIES: ResourceCategory[] = ['inspection', 'finance', 'study-support'];

const MONTHS = [
  { value: 1, label: '1월' },
  { value: 2, label: '2월' },
  { value: 3, label: '3월' },
  { value: 4, label: '4월' },
  { value: 5, label: '5월' },
  { value: 6, label: '6월' },
  { value: 7, label: '7월' },
  { value: 8, label: '8월' },
  { value: 9, label: '9월' },
  { value: 10, label: '10월' },
  { value: 11, label: '11월' },
  { value: 12, label: '12월' },
];

export const ResourceUploadPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('inspection');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<ResourceFileResponse[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiresMonth = MONTH_REQUIRED_CATEGORIES.includes(selectedCategory);

  // 통계 조회
  const fetchStats = useCallback(async () => {
    try {
      const data = await resourcesApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('통계 조회 실패:', err);
    }
  }, []);

  // 파일 목록 조회
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resourcesApi.getAllFilesByCategory(selectedCategory);
      setFiles(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchStats();
    fetchFiles();
  }, [fetchStats, fetchFiles]);

  // 카테고리 변경 시 선택 초기화
  useEffect(() => {
    setSelectedMonth(null);
    setSelectedFiles([]);
  }, [selectedCategory]);

  // 파일 선택 처리 (바로 업로드하지 않음)
  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setSelectedFiles(Array.from(fileList));
  };

  // 실제 업로드 처리
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('업로드할 파일을 선택해주세요.');
      return;
    }

    if (requiresMonth && !selectedMonth) {
      setError('월을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const title = requiresMonth ? `${selectedMonth}월` : undefined;
      const uploadPromises = selectedFiles.map((file) =>
        resourcesApi.uploadFile(selectedCategory, file, title)
      );
      await Promise.all(uploadPromises);
      setSuccess(`${selectedFiles.length}개 파일이 업로드되었습니다.`);
      setSelectedFiles([]);
      setSelectedMonth(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      await resourcesApi.deleteFile(id);
      setSuccess('파일이 삭제되었습니다.');
      fetchFiles();
      fetchStats();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // 선택된 파일 제거
  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
    handleFileSelect(e.dataTransfer.files);
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

        {/* 월 선택 (필요한 경우) */}
        {requiresMonth && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              월 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">월을 선택하세요</option>
              {MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 파일 드롭 영역 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-4xl mb-2">📁</div>
          <p className="text-gray-600 mb-4">
            파일을 드래그하여 놓거나 아래 버튼을 클릭하세요
          </p>
          <label className="inline-block">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={categoryInfo.accept}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <span className="px-4 py-2 bg-gray-600 text-white rounded-md cursor-pointer hover:bg-gray-700 transition-colors">
              파일 선택
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            {selectedCategory === 'finance' ? 'PDF 파일만 가능' : '이미지 파일만 가능 (jpeg, png, gif, webp)'}
          </p>
        </div>

        {/* 선택된 파일 목록 */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              선택된 파일 ({selectedFiles.length}개)
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {file.type.startsWith('image/') ? '🖼️' : '📄'}
                    </span>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    onClick={() => removeSelectedFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* 업로드 버튼 */}
            <div className="mt-4">
              <Button
                onClick={handleUpload}
                isLoading={isUploading}
                disabled={isUploading || (requiresMonth && !selectedMonth)}
                className="w-full md:w-auto"
              >
                {isUploading ? '업로드 중...' : `${selectedFiles.length}개 파일 업로드`}
              </Button>
              {requiresMonth && !selectedMonth && (
                <p className="text-xs text-red-500 mt-1">월을 먼저 선택해주세요</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 파일 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {categoryInfo.label} 파일 목록 ({files.length}개)
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loading />
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            업로드된 파일이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">미리보기</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">파일명</th>
                  {requiresMonth && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">월</th>
                  )}
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">크기</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">업로드일</th>
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
                      <div className="font-medium text-sm">{file.originalFileName}</div>
                    </td>
                    {requiresMonth && (
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {file.title || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(file.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
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
        )}
      </div>
    </div>
  );
};
