import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { noticesApi } from '@/api/notices';
import { NoticeRequestDto } from '@/types';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { FileUpload } from '@/components/common/FileUpload';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { NOTICE_CATEGORIES } from '@/utils/constants';
import { getErrorMessage } from '@/api/client';

export const NoticeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NoticeRequestDto>({
    defaultValues: {
      title: '',
      content: '',
      author: '',
      isPinned: false,
      category: '',
    },
  });

  const isPinned = watch('isPinned');

  useEffect(() => {
    if (isEdit && id) {
      // 수정 모드일 때 기존 데이터 로드
      noticesApi
        .getNotice(Number(id))
        .then((notice) => {
          setValue('title', notice.title);
          setValue('content', notice.content);
          setValue('author', notice.author);
          setValue('isPinned', notice.isPinned);
          setValue('category', notice.category || '');
          if (notice.imageUrl) {
            setPreviewUrl(`http://localhost:8080${notice.imageUrl}`);
          }
        })
        .catch((err) => {
          setError(getErrorMessage(err));
        });
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: NoticeRequestDto) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEdit && id) {
        await noticesApi.updateNotice(Number(id), data, imageFile || undefined);
      } else {
        await noticesApi.createNotice(data, imageFile || undefined);
      }
      navigate('/notices');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: '카테고리 선택' },
    ...NOTICE_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? '공지사항 수정' : '새 공지사항 작성'}
      </h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <Input
          label="제목 *"
          {...register('title', { required: '제목을 입력해주세요.', maxLength: 200 })}
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
          {...register('author', {
            required: '작성자를 입력해주세요.',
            maxLength: { value: 50, message: '작성자는 최대 50자까지 입력 가능합니다.' },
          })}
          error={errors.author?.message}
        />

        <Select
          label="카테고리"
          options={categoryOptions}
          {...register('category')}
          error={errors.category?.message}
        />

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setValue('isPinned', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">고정 공지사항</span>
          </label>
        </div>

        <FileUpload
          label="이미지 (선택사항)"
          onChange={(file) => {
            setImageFile(file);
            if (!file) {
              setPreviewUrl(null);
            }
          }}
          previewUrl={previewUrl}
        />

        <div className="flex gap-4 mt-6">
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? '수정' : '작성'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/notices')}
            disabled={isLoading}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
};
