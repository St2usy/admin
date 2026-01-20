import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticesApi } from '@/api/notices';
import { NoticeResponseDto } from '@/types';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { formatDate } from '@/utils/validation';
import { NOTICE_CATEGORIES } from '@/utils/constants';
import { getErrorMessage } from '@/api/client';

export const NoticeListPage: React.FC = () => {
  const [notices, setNotices] = useState<NoticeResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotices = async (page: number = 0, category?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await noticesApi.getNotices({
        page,
        size: 10,
        category: category || undefined,
      });
      setNotices(response.content);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(0, selectedCategory);
  }, [selectedCategory]);

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await noticesApi.deleteNotice(id);
      fetchNotices(currentPage, selectedCategory);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Button onClick={() => navigate('/notices/new')}>새 공지사항 작성</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(0);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">전체 카테고리</option>
          {NOTICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">공지사항이 없습니다.</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조회수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고정
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notices.map((notice) => (
                  <tr key={notice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notice.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notice.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(notice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notice.viewCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notice.isPinned ? '✓' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/notices/${notice.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => fetchNotices(currentPage - 1, selectedCategory)}
                disabled={currentPage === 0}
              >
                이전
              </Button>
              <span className="px-4 py-2">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => fetchNotices(currentPage + 1, selectedCategory)}
                disabled={currentPage >= totalPages - 1}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
