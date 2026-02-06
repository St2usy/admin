import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { activitiesApi } from '@/api/activities';
import { ActivityPostRequestDto, ActivityCategory } from '@/types';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { FileUpload } from '@/components/common/FileUpload';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { getErrorMessage } from '@/api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const CATEGORY_OPTIONS: { value: ActivityCategory; label: string }[] = [
  { value: 'EXTERNAL_ACTIVITY', label: '대외활동' },
  { value: 'CONTEST', label: '공모전' },
];

export const ActivityFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ActivityPostRequestDto>({
    defaultValues: {
      category: 'EXTERNAL_ACTIVITY',
      title: '',
      content: '',
      author: '',
      organization: '',
      startDate: '',
      endDate: '',
      applyUrl: '',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      activitiesApi
        .getById(Number(id))
        .then((data) => {
          setValue('category', data.category);
          setValue('title', data.title);
          setValue('content', data.content);
          setValue('author', data.author);
          setValue('organization', data.organization ?? '');
          setValue('startDate', data.startDate ?? '');
          setValue('endDate', data.endDate ?? '');
          setValue('applyUrl', data.applyUrl ?? '');
          if (data.thumbnailUrl) {
            setExistingThumbnailUrl(data.thumbnailUrl);
            setPreviewUrl(`${API_BASE_URL}${data.thumbnailUrl}`);
          }
        })
        .catch((err) => setError(getErrorMessage(err)));
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: ActivityPostRequestDto) => {
    setLoading(true);
    setError(null);
    try {
      const payload: ActivityPostRequestDto = { ...data };
      if (isEdit && !thumbnailFile && existingThumbnailUrl) {
        payload.thumbnailUrl = existingThumbnailUrl;
      }
      if (isEdit && id) {
        await activitiesApi.update(Number(id), payload, thumbnailFile ?? undefined);
      } else {
        await activitiesApi.create(payload, thumbnailFile ?? undefined);
      }
      navigate('/activities');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? '대외활동/공모전 수정' : '대외활동/공모전 등록'}
      </h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <Select
          label="카테고리 *"
          options={categoryOptions}
          {...register('category', { required: '카테고리를 선택하세요.' })}
          error={errors.category?.message}
        />

        <Input
          label="제목 *"
          {...register('title', { required: '제목을 입력해주세요.', maxLength: 500 })}
          error={errors.title?.message}
        />

        <Textarea
          label="내용 *"
          rows={10}
          {...register('content', { required: '내용을 입력해주세요.' })}
          error={errors.content?.message}
        />

        <Input
          label="작성자 *"
          {...register('author', { required: '작성자를 입력해주세요.', maxLength: 100 })}
          error={errors.author?.message}
        />

        <Input
          label="주최(기관)"
          {...register('organization')}
          error={errors.organization?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="시작일"
            type="date"
            {...register('startDate')}
          />
          <Input
            label="마감일"
            type="date"
            {...register('endDate')}
          />
        </div>

        <Input
          label="지원 URL"
          {...register('applyUrl')}
          placeholder="https://..."
          error={errors.applyUrl?.message}
        />

        <FileUpload
          label="썸네일 이미지 (선택)"
          onChange={(file) => {
            setThumbnailFile(file);
            if (!file) setPreviewUrl(null);
          }}
          previewUrl={previewUrl}
        />

        <div className="flex gap-4 mt-6">
          <Button type="submit" isLoading={loading}>
            {isEdit ? '수정' : '등록'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/activities')}
            disabled={loading}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
};
