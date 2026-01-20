import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { galleryApi } from '@/api/gallery';
import { GalleryRequestDto } from '@/types';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { FileUpload } from '@/components/common/FileUpload';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { getErrorMessage } from '@/api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const GalleryFormPage: React.FC = () => {
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
  } = useForm<GalleryRequestDto>({
    defaultValues: {
      title: '',
      description: '',
      photographer: '',
      category: '',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      // 수정 모드일 때 기존 데이터 로드
      galleryApi
        .getGallery(Number(id))
        .then((gallery) => {
          setValue('title', gallery.title);
          setValue('description', gallery.description || '');
          setValue('photographer', gallery.photographer || '');
          setValue('category', gallery.category || '');
          if (gallery.imageUrl) {
            setPreviewUrl(`${API_BASE_URL}${gallery.imageUrl}`);
          }
        })
        .catch((err) => {
          setError(getErrorMessage(err));
        });
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: GalleryRequestDto) => {
    setIsLoading(true);
    setError(null);

    // 생성 모드에서는 이미지가 필수
    if (!isEdit && !imageFile) {
      setError('이미지 파일을 선택해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      if (isEdit && id) {
        await galleryApi.updateGallery(Number(id), data, imageFile || undefined);
      } else {
        if (!imageFile) {
          setError('이미지 파일을 선택해주세요.');
          setIsLoading(false);
          return;
        }
        await galleryApi.createGallery(data, imageFile);
      }
      navigate('/gallery');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: '카테고리 선택' },
    { value: '행사', label: '행사' },
    { value: '전시', label: '전시' },
    { value: '기타', label: '기타' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? '갤러리 수정' : '새 갤러리 추가'}</h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <Input
          label="제목 *"
          {...register('title', { required: '제목을 입력해주세요.', maxLength: 200 })}
          error={errors.title?.message}
        />

        <Textarea
          label="설명"
          rows={5}
          {...register('description', { maxLength: 1000 })}
          error={errors.description?.message}
        />

        <Input
          label="촬영자"
          {...register('photographer', { maxLength: 50 })}
          error={errors.photographer?.message}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <select
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <FileUpload
          label={isEdit ? '이미지 (선택사항 - 새 이미지로 교체)' : '이미지 *'}
          onChange={(file) => {
            setImageFile(file);
            if (!file) {
              // 수정 모드에서 파일을 제거하면 기존 이미지로 되돌림
              if (isEdit && id) {
                galleryApi
                  .getGallery(Number(id))
                  .then((gallery) => {
                    if (gallery.imageUrl) {
                      setPreviewUrl(`${API_BASE_URL}${gallery.imageUrl}`);
                    }
                  })
                  .catch(() => {
                    setPreviewUrl(null);
                  });
              } else {
                setPreviewUrl(null);
              }
            }
          }}
          previewUrl={previewUrl}
        />

        <div className="flex gap-4 mt-6">
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? '수정' : '추가'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/gallery')}
            disabled={isLoading}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
};
