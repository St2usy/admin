import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activitiesApi } from '@/api/activities';
import { ActivityPostResponseDto, ActivityCategory } from '@/types';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { getErrorMessage } from '@/api/client';

const CATEGORY_LABEL: Record<string, string> = {
  EXTERNAL_ACTIVITY: '대외활동',
  CONTEST: '공모전',
  TEAM_RECRUITMENT: '팀원 모집',
};

export const ActivityListPage: React.FC = () => {
  const [items, setItems] = useState<ActivityPostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ActivityCategory | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; size: number; category?: string } = { page, size };
      if (category) params.category = category;
      const res = await activitiesApi.getList(params);
      setItems(res.content || []);
      setTotalPages(res.totalPages ?? 0);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [category, page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;
    try {
      await activitiesApi.delete(id);
      fetchList();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">대외활동 / 공모전 관리</h1>
        <Link to="/activities/new">
          <Button>새 글 등록</Button>
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="mb-4 flex gap-2">
        <select
          className="border rounded px-3 py-2"
          value={category}
          onChange={(e) => {
            setCategory((e.target.value || '') as ActivityCategory | '');
            setPage(0);
          }}
        >
          <option value="">전체</option>
          <option value="EXTERNAL_ACTIVITY">대외활동</option>
          <option value="CONTEST">공모전</option>
          <option value="TEAM_RECRUITMENT">팀원 모집</option>
        </select>
      </div>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">작성자</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">조회수</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">마감일</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.id}</td>
                    <td className="px-4 py-2 text-sm">{CATEGORY_LABEL[row.category] || row.category}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.author}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.viewCount}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.endDate || '-'}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      <Link to={`/activities/${row.id}/edit`} className="text-blue-600 hover:underline mr-2">
                        수정
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:underline"
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
            <div className="mt-4 flex gap-2 justify-center">
              <Button variant="secondary" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
                이전
              </Button>
              <span className="py-2">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
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
