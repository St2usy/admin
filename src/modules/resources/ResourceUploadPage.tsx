import React, { useState, useEffect, useCallback } from 'react';
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

export const ResourceUploadPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('inspection');
  const [files, setFiles] = useState<ResourceFileResponse[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

  // 파일 업로드 처리
  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadPromises = Array.from(fileList).map((file) =>
        resourcesApi.uploadFile(selectedCategory, file)
      );
      await Promise.all(uploadPromises);
      setSuccess(`${fileList.length}개 파일이 업로드되었습니다.`);
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
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loading />
              <p className="mt-2 text-gray-600">업로드 중...</p>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-600 mb-4">
                파일을 드래그하여 놓거나 아래 버튼을 클릭하세요
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
                {selectedCategory === 'finance' ? 'PDF 파일만 가능' : '이미지 파일만 가능 (jpeg, png, gif, webp)'}
              </p>
            </>
          )}
        </div>
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
                      {file.title && (
                        <div className="text-xs text-gray-500">{file.title}</div>
                      )}
                    </td>
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
