import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryApi } from '@/api/gallery';
import { GalleryResponseDto } from '@/types';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { formatDate } from '@/utils/validation';
import { getErrorMessage } from '@/api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const GalleryListPage: React.FC = () => {
  const [galleries, setGalleries] = useState<GalleryResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchGalleries = async (page: number = 0, category?: string, keyword?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (keyword) {
        response = await galleryApi.searchGalleries({
          keyword,
          page,
          size: 12,
          category: category || undefined,
        });
      } else {
        response = await galleryApi.getGalleries({
          page,
          size: 12,
          category: category || undefined,
        });
      }
      setGalleries(response.content);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries(0, selectedCategory, searchKeyword);
  }, [selectedCategory]);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchGalleries(0, selectedCategory, searchKeyword);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await galleryApi.deleteGallery(id);
      fetchGalleries(currentPage, selectedCategory, searchKeyword);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">갤러리 관리</h1>
        <Button onClick={() => navigate('/gallery/new')}>새 갤러리 추가</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="제목으로 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="secondary" onClick={handleSearch}>
          검색
        </Button>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(0);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">전체 카테고리</option>
          <option value="행사">행사</option>
          <option value="전시">전시</option>
          <option value="기타">기타</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">갤러리가 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleries.map((gallery) => (
              <div
                key={gallery.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-square">
                  <img
                    src={`${API_BASE_URL}${gallery.imageUrl}`}
                    alt={gallery.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{gallery.title}</h3>
                  {gallery.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>{gallery.category || '-'}</span>
                    <span>조회수: {gallery.viewCount}</span>
                  </div>
                  {gallery.photographer && (
                    <p className="text-xs text-gray-500 mb-2">촬영: {gallery.photographer}</p>
                  )}
                  <p className="text-xs text-gray-400 mb-3">{formatDate(gallery.createdAt)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/gallery/${gallery.id}/edit`)}
                      className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(gallery.id)}
                      className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => fetchGalleries(currentPage - 1, selectedCategory, searchKeyword)}
                disabled={currentPage === 0}
              >
                이전
              </Button>
              <span className="px-4 py-2">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => fetchGalleries(currentPage + 1, selectedCategory, searchKeyword)}
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
