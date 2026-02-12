import React, { useState, useEffect } from 'react';
import { pledgeApi } from '@/api/pledge';
import { pledgeCategories } from '@/data/pledgeData';
import { Alert } from '@/components/common/Alert';
import { getErrorMessage } from '@/api/client';

export const PledgeProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pledgeApi.getProgress();
      setProgress(res.progress || {});
    } catch (err: unknown) {
      const status = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;
      if (status === 404) {
        // 백엔드에 공약 API가 아직 없거나 재시작 전 → 빈 progress로 표시, 토글 시 저장됨
        setProgress({});
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const getCompleted = (id: string) => progress[id] === true;

  const handleToggle = async (id: string) => {
    const next = !getCompleted(id);
    setUpdatingId(id);
    setError(null);
    try {
      const res = await pledgeApi.updateProgress(id, next);
      setProgress(res.progress || {});
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPledges = pledgeCategories.reduce((sum, cat) => sum + cat.pledges.length, 0);
  const completedCount = pledgeCategories.reduce(
    (sum, cat) => sum + cat.pledges.filter((p) => getCompleted(p.id)).length,
    0
  );
  const overallRate = totalPledges > 0 ? Math.round((completedCount / totalPledges) * 100) : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">공약 이행률 관리</h1>
        <p className="text-gray-600 mt-1">
          각 공약의 이행 여부를 ID 기준으로 조정합니다. 변경 내용은 공과대학 사이트 공약 이행률 페이지에 반영됩니다.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-gray-500">
            전체 이행률: <strong>{overallRate}%</strong> ({completedCount} / {totalPledges})
          </span>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {loading ? (
        <div className="text-gray-500">불러오는 중...</div>
      ) : (
        <div className="space-y-8">
          {pledgeCategories.map((category) => {
            const catCompleted = category.pledges.filter((p) => getCompleted(p.id)).length;
            const catTotal = category.pledges.length;
            const catRate = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
            return (
              <section key={category.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: category.color }}
                  >
                    {category.title}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {catRate}% ({catCompleted}/{catTotal})
                  </span>
                </div>
                <ul className="space-y-2">
                  {category.pledges.map((pledge) => {
                    const completed = getCompleted(pledge.id);
                    const isUpdating = updatingId === pledge.id;
                    return (
                      <li
                        key={pledge.id}
                        className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-gray-400 font-mono mr-2">{pledge.id}</span>
                          <span className={completed ? 'text-gray-600' : ''}>{pledge.title}</span>
                        </div>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggle(pledge.id)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                            completed ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          role="switch"
                          aria-checked={completed}
                          aria-label={`${pledge.title} 이행 여부: ${completed ? '이행' : '미이행'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                              completed ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
