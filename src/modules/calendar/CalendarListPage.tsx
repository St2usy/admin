import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calendarApi } from '@/api/calendar';
import { CalendarEventResponseDto } from '@/types';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { getErrorMessage } from '@/api/client';

export const CalendarListPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEventResponseDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await calendarApi.getAllEvents();
      // 날짜순으로 정렬 (최신순)
      const sortedData = [...data].sort((a, b) => {
        return new Date(b.date_start).getTime() - new Date(a.date_start).getTime();
      });
      setEvents(sortedData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await calendarApi.deleteEvent(id);
      fetchEvents();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">행사 일정 관리</h1>
        <Button onClick={() => navigate('/calendar/new')}>새 행사 일정 작성</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {isLoading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">행사 일정이 없습니다.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시작일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  종료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  행사명 (한글)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  행사명 (영문)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event: CalendarEventResponseDto) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(event.date_start)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(event.date_end)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {event.event_korean}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.event_english || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {event.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/calendar/${event.id}/edit`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
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
      )}
    </div>
  );
};
