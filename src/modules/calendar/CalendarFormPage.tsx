import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { calendarApi } from '@/api/calendar';
import { CalendarEventRequestDto } from '@/types';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { getErrorMessage } from '@/api/client';

export const CalendarFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CalendarEventRequestDto>({
    defaultValues: {
      date_start: '',
      date_end: '',
      event_korean: '',
      event_english: '',
      description: '',
    },
  });

  const dateStart = watch('date_start');

  useEffect(() => {
    if (isEdit && id) {
      // 수정 모드일 때 기존 데이터 로드
      calendarApi
        .getEvent(Number(id))
        .then((event) => {
          setValue('date_start', event.date_start);
          setValue('date_end', event.date_end);
          setValue('event_korean', event.event_korean);
          setValue('event_english', event.event_english || '');
          setValue('description', event.description || '');
        })
        .catch((err) => {
          setError(getErrorMessage(err));
        });
    }
  }, [id, isEdit, setValue]);

  const validateDates = (dateEnd: string, dateStart: string): boolean => {
    if (!dateStart || !dateEnd) return true; // 다른 유효성 검사에서 처리
    return new Date(dateEnd) >= new Date(dateStart);
  };

  const onSubmit = async (data: CalendarEventRequestDto) => {
    setIsLoading(true);
    setError(null);

    // 프론트엔드 유효성 검증
    if (!validateDates(data.date_end, data.date_start)) {
      setError('종료일은 시작일 이후여야 합니다.');
      setIsLoading(false);
      return;
    }

    if (!data.event_korean || data.event_korean.trim().length === 0) {
      setError('행사명(한글)을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      if (isEdit && id) {
        await calendarApi.updateEvent(Number(id), data);
      } else {
        await calendarApi.createEvent(data);
      }
      navigate('/calendar');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? '행사 일정 수정' : '새 행사 일정 작성'}
      </h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일 *
            </label>
            <input
              type="date"
              {...register('date_start', {
                required: '시작일을 선택해주세요.',
              })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date_start ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date_start && (
              <p className="mt-1 text-sm text-red-600">{errors.date_start.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일 *
            </label>
            <input
              type="date"
              {...register('date_end', {
                required: '종료일을 선택해주세요.',
                validate: (value: string) => {
                  if (!dateStart) return true;
                  return (
                    validateDates(value, dateStart) ||
                    '종료일은 시작일 이후여야 합니다.'
                  );
                },
              })}
              min={dateStart || undefined}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date_end ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date_end && (
              <p className="mt-1 text-sm text-red-600">{errors.date_end.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <Input
            label="행사명 (한글) *"
            {...register('event_korean', {
              required: '행사명(한글)을 입력해주세요.',
              minLength: {
                value: 1,
                message: '행사명(한글)은 최소 1자 이상이어야 합니다.',
              },
            })}
            error={errors.event_korean?.message}
          />
        </div>

        <div className="mb-4">
          <Input
            label="행사명 (영문)"
            {...register('event_english')}
            error={errors.event_english?.message}
          />
        </div>

        <div className="mb-4">
          <Textarea
            label="설명"
            rows={5}
            {...register('description')}
            error={errors.description?.message}
          />
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? '수정' : '작성'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/calendar')}
            disabled={isLoading}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
};
