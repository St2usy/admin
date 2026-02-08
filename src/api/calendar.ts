import { apiClient } from './client';
import { CalendarEventRequestDto, CalendarEventResponseDto } from '@/types';

export const calendarApi = {
  // 전체 행사 일정 조회
  getAllEvents: async (): Promise<CalendarEventResponseDto[]> => {
    const response = await apiClient.get<CalendarEventResponseDto[]>('/api/calendar/events/all');
    return response.data;
  },

  // 조건부 행사 일정 조회
  getEvents: async (params?: {
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CalendarEventResponseDto[]> => {
    const response = await apiClient.get<CalendarEventResponseDto[]>('/api/calendar/events', {
      params,
    });
    return response.data;
  },

  // 특정 행사 일정 상세 조회
  getEvent: async (id: number): Promise<CalendarEventResponseDto> => {
    const response = await apiClient.get<CalendarEventResponseDto>(`/api/calendar/events/${id}`);
    return response.data;
  },

  // 행사 일정 생성
  createEvent: async (data: CalendarEventRequestDto): Promise<CalendarEventResponseDto> => {
    const response = await apiClient.post<CalendarEventResponseDto>('/api/calendar/events', data);
    return response.data;
  },

  // 행사 일정 수정
  updateEvent: async (
    id: number,
    data: Partial<CalendarEventRequestDto>
  ): Promise<CalendarEventResponseDto> => {
    const response = await apiClient.put<CalendarEventResponseDto>(
      `/api/calendar/events/${id}`,
      data
    );
    return response.data;
  },

  // 행사 일정 삭제
  deleteEvent: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/calendar/events/${id}`);
  },
};
