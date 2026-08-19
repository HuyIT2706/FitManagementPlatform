'use client';

import { useState } from 'react';
import { type OnboardingState } from '../../../store/onboardingStore';
import { Check, Activity, ShieldAlert, HeartPulse, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StepHealthProps {
  store: OnboardingState;
}

const parqQuestions = [
  { id: 'heartCondition', label: '1. Bác sĩ từng chẩn đoán bạn mắc bệnh tim mạch và khuyên chỉ tập luyện theo chỉ định?' },
  { id: 'chestPainExercise', label: '2. Bạn có hay bị đau ngực trong khi thực hiện các hoạt động thể chất?' },
  { id: 'chestPainNoExercise', label: '3. Trong tháng qua, bạn có bị đau ngực ngay cả khi KHÔNG vận động thể chất không?' },
  { id: 'dizzinessLossBalance', label: '4. Bạn có hay mất thăng bằng do chóng mặt hoặc từng bị ngất xỉu không?' },
  { id: 'boneJointProblem', label: '5. Bạn có vấn đề xương khớp (lưng, gối, hông) trở nên xấu đi khi vận động không?' },
  { id: 'bloodPressureMedicine', label: '6. Bác sĩ có đang kê đơn thuốc huyết áp hoặc tim mạch cho bạn không?' },
  { id: 'otherReason', label: '7. Bạn có biết bất kỳ lý do sức khỏe nào khác khiến bạn không nên tham gia thể thao không?' },
];

export default function StepHealth({ store }: StepHealthProps) {
  const [activeTab, setActiveTab] = useState<'CONDITIONS' | 'PARQ'>('PARQ');
  const [parqAnswers, setParqAnswers] = useState<Record<string, boolean>>({
    heartCondition: false,
    chestPainExercise: false,
    chestPainNoExercise: false,
    dizzinessLossBalance: false,
    boneJointProblem: false,
    bloodPressureMedicine: false,
    otherReason: false,
  });

  const options = [
    { id: 'HEALTHY', label: 'Khỏe mạnh', desc: 'Không có vấn đề sức khỏe đặc biệt' },
    { id: 'DIABETES', label: 'Tiểu đường', desc: 'Đường huyết cao, cần kiểm soát chỉ số GI' },
    { id: 'BLOOD_PRESSURE', label: 'Huyết áp cao', desc: 'Hoặc các vấn đề tim mạch' },
    { id: 'STOMACH', label: 'Dạ dày', desc: 'Khó tiêu, viêm loét dạ dày' },
  ];

  const handleSelectCondition = (optId: string) => {
    if (optId === 'HEALTHY') {
      store.toggleHealthCondition('HEALTHY');
    } else {
      if (store.healthConditions.includes('HEALTHY')) {
        store.toggleHealthCondition('HEALTHY');
      }
      store.toggleHealthCondition(optId);
    }
  };

  const handleParqAnswer = (qId: string, val: boolean) => {
    const updated = { ...parqAnswers, [qId]: val };
    setParqAnswers(updated);
    
    // Automatically update healthConditions tag if needed
    const hasAnyRisk = Object.values(updated).some(Boolean);
    if (hasAnyRisk && !store.healthConditions.includes('PARQ_ATTENTION')) {
      store.toggleHealthCondition('PARQ_ATTENTION');
    }
  };

  const hasParqRisk = Object.values(parqAnswers).some(Boolean);

  return (
    <div className="flex flex-col flex-1 h-full max-h-[62vh] md:max-h-[70vh]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-[#10b981]" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold">Tầm soát Sức khỏe (PAR-Q+)</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('PARQ')}
          className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'PARQ'
              ? 'bg-[#10b981] text-[#003824] shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Khảo sát PAR-Q+ (Chuẩn y tế)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CONDITIONS')}
          className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'CONDITIONS'
              ? 'bg-[#10b981] text-[#003824] shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Tiền sử bệnh lý
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pr-1 space-y-4 no-scrollbar">
        {activeTab === 'PARQ' ? (
          <div>
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
              <ShieldAlert className="text-[#10b981] shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-white/70">
                Bộ câu hỏi **PAR-Q+** giúp phát hiện sớm các rủi ro sức khỏe trước khi bắt đầu lộ trình tập luyện thể thao an toàn.
              </p>
            </div>

            {/* Questions list */}
            <div className="space-y-3">
              {parqQuestions.map((q) => {
                const isYes = parqAnswers[q.id] === true;
                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <span className="text-sm font-medium text-white/90 leading-snug">{q.label}</span>
                    <div className="flex gap-2 shrink-0 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={() => handleParqAnswer(q.id, false)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          !isYes
                            ? 'bg-[#10b981] text-[#003824]'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        Không
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParqAnswer(q.id, true)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isYes
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        Có
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Badge */}
            <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${
              hasParqRisk
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-[#10b981]/15 border-[#10b981]/30 text-[#10b981]'
            }`}>
              {hasParqRisk ? (
                <>
                  <AlertTriangle size={24} className="shrink-0 text-amber-400" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-300 text-sm mb-0.5">Khuyến cáo Chuyên môn</p>
                    <p className="text-amber-200/80">
                      Bạn có câu trả lời &quot;Có&quot;. Vui lòng tham khảo ý kiến Bác sĩ hoặc thông báo cụ thể cho PT trước khi tập các bài nặng.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} className="shrink-0 text-[#10b981]" />
                  <div className="text-xs">
                    <p className="font-bold text-[#10b981] text-sm mb-0.5">Sẵn sàng Tập luyện (PAR-Q Cleared)</p>
                    <p className="text-white/70">
                      Bạn hoàn toàn đủ điều kiện thể lực để tham gia các chương trình tập luyện cường độ cao.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-white/60 mb-2">Chọn thêm các bệnh lý nếu có để nhận gợi ý bài tập phù hợp:</p>
            {options.map((opt) => {
              const isSelected = store.healthConditions.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectCondition(opt.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-[#10b981] bg-[#10b981]/15'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div>
                    <span className={`text-base font-bold block mb-0.5 ${isSelected ? 'text-[#10b981]' : 'text-white'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-white/60">{opt.desc}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      isSelected
                        ? 'border-[#10b981] bg-[#10b981]'
                        : 'border-white/30 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-[#003824] stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
