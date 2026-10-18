'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useBodyMetrics } from '../../hooks/swr';
import apiClient from '../../api/axios';
import toast from '../../utils/toast';
import type {
  WeightTimeRange,
  WeightEditMode,
  WeightChartPoint,
} from '../../interface';

import WeightHeader from './components/WeightHeader';
import WeightSummaryCard from './components/WeightSummaryCard';
import WeightStatusBanner from './components/WeightStatusBanner';
import WeightTimeRangeFilter from './components/WeightTimeRangeFilter';
import WeightChartCard from './components/WeightChartCard';
import WeightHistoryList from './components/WeightHistoryList';
import WeightEditModal from './components/WeightEditModal';

export default function WeightTrackingPage() {
  const router = useRouter();
  const { data: userData, mutate: mutateUser } = useCurrentUser();
  const { data: metricsData, mutate: mutateMetrics } = useBodyMetrics();

  const [timeRange, setTimeRange] = useState<WeightTimeRange>('DAY');
  const [editMode, setEditMode] = useState<WeightEditMode>(null);
  const [weightInput, setWeightInput] = useState<string>('');
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Chronologically sorted metrics (oldest -> newest)
  const sortedMetrics = useMemo(() => {
    if (!metricsData || !Array.isArray(metricsData)) return [];
    return [...metricsData].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
  }, [metricsData]);

  // Derived initial, current, target weights
  const initialWeight = useMemo(() => {
    if (sortedMetrics.length > 0 && sortedMetrics[0]) {
      return sortedMetrics[0].weight;
    }
    return userData?.weight || 81;
  }, [sortedMetrics, userData]);

  const currentWeight = useMemo(() => {
    const last = sortedMetrics[sortedMetrics.length - 1];
    if (last) {
      return last.weight;
    }
    return userData?.weight || initialWeight;
  }, [sortedMetrics, userData, initialWeight]);

  const targetWeight = useMemo(() => {
    return userData?.targetWeight || 75;
  }, [userData]);

  // Weight difference status
  const weightDiff = useMemo(() => {
    return Math.round((currentWeight - initialWeight) * 10) / 10;
  }, [currentWeight, initialWeight]);

  const statusMessage = useMemo(() => {
    if (Math.abs(weightDiff) < 0.1) {
      return 'Bạn đang giữ vững cân nặng';
    }
    if (weightDiff < 0) {
      return `Bạn đã giảm ${Math.abs(weightDiff).toFixed(1)} kg`;
    }
    return `Bạn đã tăng ${weightDiff.toFixed(1)} kg`;
  }, [weightDiff]);

  // Filtered data points for the selected range
  const chartPoints = useMemo<WeightChartPoint[]>(() => {
    if (sortedMetrics.length === 0) {
      // Fallback sample point for brand-new users
      const today = new Date();
      return [
        {
          label: `${today.getDate()}-${today.getMonth() + 1}`,
          fullDate: today.toISOString(),
          weight: currentWeight,
          id: 'temp-current',
        },
      ];
    }

    if (timeRange === 'DAY') {
      const slice = sortedMetrics.slice(-10);
      return slice.map((m) => {
        const d = new Date(m.recordedAt);
        return {
          label: `${d.getDate()}-${d.getMonth() + 1}`,
          fullDate: d.toLocaleDateString('vi-VN'),
          weight: m.weight,
          id: m.id,
        };
      });
    }

    if (timeRange === 'WEEK') {
      const slice = sortedMetrics.slice(-12);
      return slice.map((m, i) => {
        const d = new Date(m.recordedAt);
        return {
          label: `T${i + 1}`,
          fullDate: d.toLocaleDateString('vi-VN'),
          weight: m.weight,
          id: m.id,
        };
      });
    }

    // MONTH: Last 6-12 months
    const slice = sortedMetrics.slice(-12);
    return slice.map((m) => {
      const d = new Date(m.recordedAt);
      return {
        label: `T${d.getMonth() + 1}`,
        fullDate: d.toLocaleDateString('vi-VN'),
        weight: m.weight,
        id: m.id,
      };
    });
  }, [sortedMetrics, timeRange, currentWeight]);

  // Chart Y-axis calculation matching the user's screenshot
  const { yTicks, maxVal } = useMemo(() => {
    const maxDataWeight = Math.max(
      initialWeight,
      currentWeight,
      targetWeight,
      ...chartPoints.map((p) => p.weight)
    );
    // Upper boundary with 10% breathing room
    const calculatedMax = Math.max(89.1, Math.round(maxDataWeight * 1.1 * 10) / 10);
    const step = calculatedMax / 6;
    const ticks: number[] = [];
    for (let i = 6; i >= 0; i--) {
      ticks.push(Math.round(step * i * 10) / 10);
    }
    return { yTicks: ticks, maxVal: calculatedMax };
  }, [initialWeight, currentWeight, targetWeight, chartPoints]);

  // Handlers for modal
  const openEditModal = (mode: WeightEditMode) => {
    setEditMode(mode);
    if (mode === 'INITIAL') {
      setWeightInput(String(initialWeight));
      setSelectedMetricId(sortedMetrics[0]?.id || null);
    } else if (mode === 'CURRENT') {
      setWeightInput(String(currentWeight));
      setSelectedMetricId(null);
    } else if (mode === 'TARGET') {
      setWeightInput(String(targetWeight));
      setSelectedMetricId(null);
    }
  };

  const closeEditModal = () => {
    setEditMode(null);
    setWeightInput('');
    setSelectedMetricId(null);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!val || isNaN(val) || val < 20 || val > 300) {
      toast.warning('Vui lòng nhập số cân nặng hợp lệ (20 - 300 kg)', 'Cân nặng không hợp lệ');
      return;
    }

    setIsSaving(true);
    try {
      if (editMode === 'TARGET') {
        await apiClient.patch('/users/me', {
          targetWeight: val,
        });
        await mutateUser();
        toast.success(`Đã cập nhật mục tiêu cân nặng: ${val} kg`, 'Thành công');
      } else if (editMode === 'INITIAL') {
        if (selectedMetricId) {
          // Update earliest metric
          await apiClient.patch(`/progress/metrics/${selectedMetricId}`, {
            weight: val,
          });
        } else {
          // Create initial baseline
          await apiClient.post('/progress/metrics', {
            weight: val,
          });
        }
        await mutateMetrics();
        await mutateUser();
        toast.success(`Đã cập nhật cân nặng ban đầu: ${val} kg`, 'Thành công');
      } else {
        // CURRENT: Add new metric entry
        await apiClient.post('/progress/metrics', {
          weight: val,
        });
        await mutateMetrics();
        await mutateUser();
        toast.success(`Đã ghi nhận cân nặng hôm nay: ${val} kg`, 'Thành công');
      }
      closeEditModal();
    } catch (err: unknown) {
      console.error('Save weight failed:', err);
      toast.error('Không thể lưu cân nặng. Vui lòng thử lại!', 'Thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMetric = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi cân nặng này không?')) return;
    setIsDeletingId(id);
    try {
      await apiClient.delete(`/progress/metrics/${id}`);
      await mutateMetrics();
      await mutateUser();
      toast.success('Đã xóa bản ghi cân nặng thành công');
    } catch (err) {
      console.error('Delete metric error:', err);
      toast.error('Không thể xóa bản ghi cân nặng này');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f6] dark:bg-[#0c120e] text-slate-900 dark:text-white pb-20">
      {/* 1. Header */}
      <WeightHeader
        onBack={handleBack}
        onOpenAddModal={() => openEditModal('CURRENT')}
      />

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-6">
        {/* 2. Top Summary Card (Ban đầu | Hiện tại | Mục tiêu) */}
        <WeightSummaryCard
          initialWeight={initialWeight}
          currentWeight={currentWeight}
          targetWeight={targetWeight}
          onEditInitial={() => openEditModal('INITIAL')}
          onEditCurrent={() => openEditModal('CURRENT')}
          onEditTarget={() => openEditModal('TARGET')}
        />

        {/* 3. Centered Status Message */}
        <WeightStatusBanner statusMessage={statusMessage} />

        {/* 4. Time Range Filter (Ngày | Tuần | Tháng) */}
        <WeightTimeRangeFilter
          timeRange={timeRange}
          onChangeTimeRange={setTimeRange}
        />

        {/* 5. Chart Card */}
        <WeightChartCard
          yTicks={yTicks}
          maxVal={maxVal}
          chartPoints={chartPoints}
        />

        {/* 6. History Logs Section */}
        <WeightHistoryList
          metrics={sortedMetrics}
          isDeletingId={isDeletingId}
          onDelete={handleDeleteMetric}
          onOpenAddModal={() => openEditModal('CURRENT')}
        />
      </main>

      {/* 7. Modal for Adding / Editing Weight */}
      <WeightEditModal
        isOpen={editMode !== null}
        editMode={editMode}
        weightInput={weightInput}
        isSaving={isSaving}
        onWeightInputChange={setWeightInput}
        onSave={handleSaveModal}
        onClose={closeEditModal}
      />
    </div>
  );
}
