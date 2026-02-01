import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { matchingApi } from '@/api/matching';
import { MatchingRequestDto } from '@/types';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { getErrorMessage } from '@/api/client';

interface MatchingFormValues {
  title: string;
  type: string;
  category: string;
  description: string;
  maxMembers: string;
  currentMembers: string;
  deadline: string;
  thumbnail: string;
  organizerId: string;
  organizerName: string;
  companyType: string;
  targetAudience: string;
  applicationStart: string;
  applicationEnd: string;
  activityPeriod: string;
  recruitCount: string;
  activityArea: string;
  homepage: string;
  tagsActivity: string;
}

const toDotDate = (value: string) => (value ? value.replace(/-/g, '.') : '');
const toHyphenDate = (value: string) => (value ? value.replace(/\./g, '-') : '');
const toNumberOrUndefined = (value: string) => (value ? Number(value) : undefined);
const toArray = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
const parseMembers = (members?: string | null) => {
  if (!members) {
    return { current: '', max: '' };
  }
  const [current, max] = members.split('/');
  return {
    current: current?.trim() || '',
    max: max?.trim() === '-' ? '' : max?.trim() || '',
  };
};

export const MatchingFormPage: React.FC = () => {
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
  } = useForm<MatchingFormValues>({
    defaultValues: {
      title: '',
      type: 'study',
      category: '',
      description: '',
      maxMembers: '',
      currentMembers: '',
      deadline: '',
      thumbnail: '',
      organizerId: '',
      organizerName: '',
      companyType: '',
      targetAudience: '',
      applicationStart: '',
      applicationEnd: '',
      activityPeriod: '',
      recruitCount: '',
      activityArea: '',
      homepage: '',
      tagsActivity: '',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      matchingApi
        .getMatching(Number(id))
        .then((matching) => {
          setValue('title', matching.title);
          setValue('type', matching.type);
          setValue('category', matching.category || '');
          setValue('description', matching.description || '');
          const parsedMembers = parseMembers(matching.members);
          setValue('currentMembers', parsedMembers.current);
          setValue('maxMembers', parsedMembers.max);
          setValue('deadline', matching.deadline || '');
          setValue('thumbnail', matching.thumbnail || '');
          setValue('organizerId', matching.organizerId ? String(matching.organizerId) : '');
          setValue('organizerName', matching.organizerName || '');
          setValue('companyType', matching.companyType || '');
          setValue('targetAudience', matching.targetAudience || '');
          setValue('applicationStart', toHyphenDate(matching.applicationStart || ''));
          setValue('applicationEnd', toHyphenDate(matching.applicationEnd || ''));
          setValue('activityPeriod', matching.activityPeriod || '');
          setValue('recruitCount', matching.recruitCount || '');
          setValue('activityArea', matching.activityArea || '');
          setValue('homepage', matching.homepage || '');
          setValue('tagsActivity', (matching.tagsActivity || []).join(', '));
        })
        .catch((err) => {
          setError(getErrorMessage(err));
        });
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (values: MatchingFormValues) => {
    setIsLoading(true);
    setError(null);

    const payload: MatchingRequestDto = {
      title: values.title,
      type: values.type,
      category: values.category || undefined,
      description: values.description || undefined,
      maxMembers: toNumberOrUndefined(values.maxMembers),
      currentMembers: toNumberOrUndefined(values.currentMembers),
      deadline: values.deadline || undefined,
      thumbnail: values.thumbnail || undefined,
      organizerId: toNumberOrUndefined(values.organizerId),
      organizerName: values.organizerName || undefined,
      companyType: values.companyType || undefined,
      targetAudience: values.targetAudience || undefined,
      applicationStart: toDotDate(values.applicationStart) || undefined,
      applicationEnd: toDotDate(values.applicationEnd) || undefined,
      activityPeriod: values.activityPeriod || undefined,
      recruitCount: values.recruitCount || undefined,
      activityArea: values.activityArea || undefined,
      homepage: values.homepage || undefined,
      tagsActivity: values.tagsActivity ? toArray(values.tagsActivity) : undefined,
    };

    try {
      if (isEdit && id) {
        await matchingApi.updateMatching(Number(id), payload);
      } else {
        await matchingApi.createMatching(payload);
      }
      navigate('/matching');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? '매칭 수정' : '새 매칭 등록'}</h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <Input
          label="제목 *"
          {...register('title', { required: '제목을 입력해주세요.', maxLength: 200 })}
          error={errors.title?.message}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">타입 *</label>
          <select
            {...register('type', { required: '타입을 선택해주세요.' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="study">스터디</option>
            <option value="project">프로젝트</option>
            <option value="mentor">멘토링</option>
          </select>
          {errors.type?.message && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        <Textarea
          label="상세 내용"
          rows={5}
          {...register('description', { maxLength: 5000 })}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="현재 인원" type="number" {...register('currentMembers')} />
          <Input label="최대 인원" type="number" {...register('maxMembers')} />
        </div>

        <Input label="썸네일 URL" {...register('thumbnail')} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="주최자 이름" {...register('organizerName')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="소속/단체 형태" {...register('companyType')} />
          <Input label="모집 대상" {...register('targetAudience')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="지원 시작일" type="date" {...register('applicationStart')} />
          <Input label="지원 종료일" type="date" {...register('applicationEnd')} />
        </div>

        <Input label="모집 인원 표시" {...register('recruitCount')} />
        <Input label="활동 지역" {...register('activityArea')} />
        <Input label="홈페이지/오픈카톡" {...register('homepage')} />
        <Input label="태그 (콤마로 구분)" {...register('tagsActivity')} />

        <div className="flex gap-4 mt-6">
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? '수정' : '등록'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/matching')}
            disabled={isLoading}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
};
