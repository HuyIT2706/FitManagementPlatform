import apiClient from '../api/axios';
import { toast } from './toast';
import { broadcastSync } from './realtimeSync';

export const approvePtStudentRequest = async (
  requestId: string,
  onSuccess?: () => void,
): Promise<boolean> => {
  try {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/pt/students/accept/${requestId}`,
    );
    toast.success(res.data.message || 'Đã chấp nhận học viên thành công!');
    onSuccess?.();
    broadcastSync('PT_REQUEST_UPDATED');
    return true;
  } catch (err) {
    console.error(err);
    toast.error('Không thể chấp nhận yêu cầu học viên!');
    return false;
  }
};

export const rejectPtStudentRequest = async (
  requestId: string,
  onSuccess?: () => void,
): Promise<boolean> => {
  try {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/pt/students/reject/${requestId}`,
    );
    toast.success(res.data.message || 'Đã từ chối yêu cầu học viên!');
    onSuccess?.();
    broadcastSync('PT_REQUEST_UPDATED');
    return true;
  } catch (err) {
    console.error(err);
    toast.error('Không thể từ chối yêu cầu học viên!');
    return false;
  }
};
