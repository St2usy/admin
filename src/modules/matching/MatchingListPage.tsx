import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchingApi } from '@/api/matching';
import { MatchingResponseDto } from '@/types';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { getErrorMessage } from '@/api/client';

export const MatchingListPage: React.FC = () => {
  const [items, setItems] = useState<MatchingResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMatchings = async (page: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await matchingApi.getMatchings({
        page: page + 1,
        limit: 10,
        type: selectedType || undefined,
        category: selectedCategory || undefined,
        search: searchKeyword || undefined,
      });
      setItems(response.content);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchings(0);
  }, [selectedType, selectedCategory]);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchMatchings(0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await matchingApi.deleteMatching(id);
      fetchMatchings(currentPage);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">매칭 플랫폼 관리</h1>
        <Button onClick={() => navigate('/matching/new')}>새 매칭 등록</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="제목/내용 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button variant="secondary" onClick={handleSearch}>
          검색
        </Button>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setCurrentPage(0);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">전체 타입</option>
          <option value="study">스터디</option>
          <option value="project">프로젝트</option>
          <option value="mentor">멘토링</option>
        </select>
        <input
          type="text"
          placeholder="카테고리"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(0);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">등록된 매칭이 없습니다.</div>
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
                    타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마감일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    인원
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조회수
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.deadline || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.members || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/matching/${item.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
                onClick={() => fetchMatchings(currentPage - 1)}
                disabled={currentPage === 0}
              >
                이전
              </Button>
              <span className="px-4 py-2">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => fetchMatchings(currentPage + 1)}
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
