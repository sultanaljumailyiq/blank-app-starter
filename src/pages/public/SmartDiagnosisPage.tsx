import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversation } from '@elevenlabs/react';
import {
  Brain, MessageCircle, User, Image as ImageIcon, X, MapPin, Calendar as CalendarIcon,
  Mic, Volume2, Send, Phone, Check, ChevronLeft, Sparkles, Stethoscope, Baby, Scissors,
  Smile, Activity, Crown, Clock, PhoneOff, Loader2, Heart, Bone, Pill
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { aiService } from '../../services/ai/AIService';
import { usePublicClinics } from '../../hooks/usePublicClinics';
import { Clinic } from '../../types';
import { supabase } from '../../lib/supabase';

const ELEVENLABS_AGENT_ID = 'agent_9501kqetfd9jf9hrqaxnp79yffak';

const SPECIALTIES = [
  { id: 'general', label: 'طب أسنان عام', icon: Stethoscope, color: 'from-blue-500 to-cyan-500', keys: ['عام', 'كشف', 'general', 'أسنان عام'] },
  { id: 'ortho', label: 'تقويم الأسنان', icon: Smile, color: 'from-purple-500 to-pink-500', keys: ['تقويم', 'orthodontic'] },
  { id: 'kids', label: 'طب أسنان أطفال', icon: Baby, color: 'from-orange-500 to-red-500', keys: ['أطفال', 'اطفال', 'pediatric', 'أسنان أطفال'] },
  { id: 'root', label: 'علاج الجذور', icon: Heart, color: 'from-red-500 to-rose-500', keys: ['جذور', 'root canal', 'علاج الجذور'] },
  { id: 'gum', label: 'لثة وأنسجة داعمة', icon: Activity, color: 'from-green-500 to-emerald-500', keys: ['لثة', 'أنسجة', 'periodontal', 'اللثة'] },
  { id: 'implant', label: 'زراعة الأسنان', icon: Bone, color: 'from-gray-500 to-slate-500', keys: ['زراعة', 'implant'] },
  { id: 'surgery', label: 'جراحة وجه وفكين', icon: Scissors, color: 'from-rose-500 to-red-600', keys: ['جراحة', 'فكين', 'surgery', 'وجه'] },
  { id: 'cosmetic', label: 'تجميل الأسنان', icon: Crown, color: 'from-amber-500 to-yellow-500', keys: ['تجميل', 'تبييض', 'cosmetic', 'فينير'] },
];

const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء',
  'بابل', 'كركوك', 'السليمانية', 'الأنبار', 'ذي قار', 'ديالى',
  'واسط', 'صلاح الدين', 'القادسية', 'ميسان', 'المثنى', 'دهوك'
];

type Step = 'intro' | 'specialty' | 'governorate' | 'clinics' | 'date' | 'time' | 'patient' | 'confirmed';

type CardKind =
  | { kind: 'specialty' }
  | { kind: 'governorate' }
  | { kind: 'clinics'; clinics: Clinic[] }
  | { kind: 'date' }
  | { kind: 'time' }
  | { kind: 'patient' }
  | { kind: 'confirmation' };

type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  image?: string | null;
  card?: CardKind;
};

interface BookingState {
  specialty?: typeof SPECIALTIES[number];
  governorate?: string;
  clinic?: Clinic;
  date?: string;
  time?: string;
  patient: { name: string; phone: string; age: string; gender: 'male' | 'female' | '' };
}

const TIME_SLOTS = {
  morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
  evening: ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'],
};

export const SmartDiagnosisPage: React.FC = () => {
  const navigate = useNavigate();
  const { clinics } = usePublicClinics();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('intro');
  const [voiceMode, setVoiceMode] = useState(false);
  const [isConnectingVoice, setIsConnectingVoice] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    patient: { name: '', phone: '', age: '', gender: '' }
  });
  const [sessionId] = useState<string>(() => {
    let sid = localStorage.getItem('smart_diagnosis_session_id');
    if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('smart_diagnosis_session_id', sid); }
    return sid;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const initialMessageSent = useRef(false);

  // Refs to bookingState/clinics for ElevenLabs client tools (closures)
  const bookingRef = useRef(booking);
  const clinicsRef = useRef(clinics);
  useEffect(() => { bookingRef.current = booking; }, [booking]);
  useEffect(() => { clinicsRef.current = clinics; }, [clinics]);

  // Initial greeting + first card
  useEffect(() => {
    if (messages.length === 0 && !initialMessageSent.current) {
      initialMessageSent.current = true;
      pushAi('أهلاً بك! أنا مساعدك الذكي 🦷\n\nاختر ما الذي تحتاجه لنقترح لك أفضل عيادة:', { kind: 'specialty' });
      setStep('specialty');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const pushAi = (content: string, card?: CardKind) =>
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', content, card }]);
  const pushUser = (content: string, image?: string | null) =>
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content, image }]);

  // Filter clinics by current selection
  const filteredClinics = useMemo(() => {
    let list = clinics;
    if (booking.governorate) list = list.filter(c => (c.governorate || '').includes(booking.governorate!));
    if (booking.specialty) {
      const keys = booking.specialty.keys;
      list = list.filter(c =>
        c.specialties?.some(s => keys.some(k => s.toLowerCase().includes(k.toLowerCase()))) ||
        c.services?.some(s => keys.some(k => s.toLowerCase().includes(k.toLowerCase())))
      );
    }
    return list.slice(0, 8);
  }, [clinics, booking.governorate, booking.specialty]);

  // ============== Step Handlers ==============
  const handleSpecialty = (sp: typeof SPECIALTIES[number]) => {
    setBooking(prev => ({ ...prev, specialty: sp }));
    pushUser(`أحتاج ${sp.label}`);
    setTimeout(() => {
      pushAi(`ممتاز! اختر محافظتك لنعرض لك أقرب العيادات المتخصصة في ${sp.label}:`, { kind: 'governorate' });
      setStep('governorate');
    }, 300);
  };

  const handleGovernorate = (gov: string) => {
    setBooking(prev => ({ ...prev, governorate: gov }));
    pushUser(`أنا في ${gov}`);
    setTimeout(() => {
      const list = clinics
        .filter(c => (c.governorate || '').includes(gov))
        .filter(c => !booking.specialty || c.specialties?.some(s => booking.specialty!.keys.some(k => s.toLowerCase().includes(k.toLowerCase()))) || c.services?.some(s => booking.specialty!.keys.some(k => s.toLowerCase().includes(k.toLowerCase()))))
        .slice(0, 8);
      if (list.length === 0) {
        pushAi(`لم أجد عيادات في ${gov} مطابقة تماماً. إليك أفضل العيادات المتاحة:`, { kind: 'clinics', clinics: clinics.slice(0, 6) });
      } else {
        pushAi(`وجدت لك ${list.length} عيادة 👇 اختر العيادة المناسبة:`, { kind: 'clinics', clinics: list });
      }
      setStep('clinics');
    }, 300);
  };

  const handleClinic = (clinic: Clinic) => {
    setBooking(prev => ({ ...prev, clinic }));
    pushUser(`اخترت ${clinic.name}`);
    setTimeout(() => {
      pushAi(`اختيار رائع! 👏\nالآن اختر اليوم المناسب لموعدك:`, { kind: 'date' });
      setStep('date');
    }, 300);
  };

  const handleDate = (dateISO: string, label: string) => {
    setBooking(prev => ({ ...prev, date: dateISO }));
    pushUser(`أريد يوم ${label}`);
    setTimeout(() => {
      pushAi('اختر الوقت المفضل لك:', { kind: 'time' });
      setStep('time');
    }, 300);
  };

  const handleTime = (time: string) => {
    setBooking(prev => ({ ...prev, time }));
    pushUser(`الساعة ${time}`);
    setTimeout(() => {
      pushAi('ممتاز! آخر خطوة — أدخل بياناتك لتأكيد الحجز:', { kind: 'patient' });
      setStep('patient');
    }, 300);
  };

  const handleConfirmBooking = async () => {
    const b = bookingRef.current;
    if (!b.clinic || !b.date || !b.time || !b.patient.name || !b.patient.phone) return;
    setIsLoading(true);
    try {
      const dateObj = new Date(b.date);
      const offset = dateObj.getTimezoneOffset();
      const adjusted = new Date(dateObj.getTime() - offset * 60 * 1000);
      const formattedDate = adjusted.toISOString().split('T')[0];

      const { error } = await supabase.from('appointments').insert({
        clinic_id: parseInt(b.clinic.id),
        patient_name: b.patient.name,
        doctor_name: 'سيتم التحديد من العيادة',
        appointment_date: formattedDate,
        appointment_time: b.time,
        type: `${b.specialty?.label || 'كشف عام'} (مساعد ذكي)`,
        treatment_type: b.specialty?.label || 'كشف عام',
        status: 'pending',
        notes: `حجز عبر المساعد الذكي\nالعمر: ${b.patient.age || '—'}\nالجنس: ${b.patient.gender === 'male' ? 'ذكر' : b.patient.gender === 'female' ? 'أنثى' : '—'}\nالمحافظة: ${b.governorate || '—'}`,
        phone_number: b.patient.phone,
        cost: 0,
      });
      if (error) throw error;

      pushAi(`تم تأكيد حجزك بنجاح! ✅\n\n**${b.clinic.name}**\n📅 ${formattedDate}\n🕐 ${b.time}\n📞 ستتواصل معك العيادة قريباً على ${b.patient.phone}`, { kind: 'confirmation' });
      setStep('confirmed');
    } catch (e) {
      console.error(e);
      pushAi('عذراً، حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============== Free Chat (text/image) ==============
  const handleSendMessage = async () => {
    if ((!input.trim() && !imagePreview) || isLoading) return;
    const userText = input;
    const img = imagePreview;
    pushUser(userText, img);
    setInput(''); setImagePreview(null);
    setIsLoading(true);
    try {
      let base64: string | undefined, mime: string | undefined;
      if (img) {
        const m = img.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (m) { mime = m[1]; base64 = m[2]; }
      }
      const history = messages.filter(m => m.content).slice(-12).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content
      }));
      const response = await aiService.chat(
        'patient_assistant',
        userText || 'حلل الصورة المرفقة',
        { booking: bookingRef.current, step },
        undefined, undefined, sessionId,
        base64, mime, history
      );
      pushAi(response);
    } catch (e) {
      pushAi('عذراً حدث خطأ، حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const r = new SR(); r.lang = 'ar-IQ'; r.interimResults = true;
    r.onresult = (ev: any) => setInput(Array.from(ev.results).map((x: any) => x[0]?.transcript).join(' '));
    r.onend = () => setIsListening(false);
    recognitionRef.current = r; setIsListening(true); r.start();
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[*_#`>]/g, ''));
    u.lang = 'ar-IQ'; window.speechSynthesis.speak(u);
  };

  // ============== ElevenLabs Voice Mode ==============
  const conversation = useConversation({
    onConnect: () => { console.log('Voice connected'); pushAi('🎙️ المساعد الصوتي متصل، تكلم الآن…'); },
    onDisconnect: () => { console.log('Voice disconnected'); setVoiceMode(false); },
    onError: (e: any) => { console.error('Voice error:', e); pushAi('تعذر تشغيل المساعد الصوتي. حاول مرة أخرى.'); setVoiceMode(false); },
    onMessage: (m: any) => {
      const text = m?.message || m?.text;
      if (text && (m?.source === 'ai' || m?.role === 'assistant')) {
        pushAi(`🎙️ ${text}`);
      } else if (text && (m?.source === 'user' || m?.role === 'user')) {
        pushUser(`🎙️ ${text}`);
      }
    },
    clientTools: {
      select_specialty: ({ specialty }: { specialty: string }) => {
        const sp = SPECIALTIES.find(s => s.keys.some(k => specialty.toLowerCase().includes(k.toLowerCase())) || s.label.includes(specialty));
        if (sp) { handleSpecialty(sp); return `تم اختيار ${sp.label}`; }
        pushAi(`الاختصاصات المتاحة:`, { kind: 'specialty' });
        return 'showed specialty cards';
      },
      select_governorate: ({ governorate }: { governorate: string }) => {
        const g = GOVERNORATES.find(x => governorate.includes(x) || x.includes(governorate));
        if (g) { handleGovernorate(g); return `تم اختيار ${g}`; }
        pushAi('اختر محافظتك:', { kind: 'governorate' }); return 'showed governorate cards';
      },
      show_clinics: () => {
        pushAi('إليك العيادات المقترحة:', { kind: 'clinics', clinics: filteredClinics });
        return `${filteredClinics.length} clinics shown`;
      },
      select_clinic: ({ clinic_name }: { clinic_name: string }) => {
        const c = clinicsRef.current.find(cl => cl.name.includes(clinic_name) || clinic_name.includes(cl.name));
        if (c) { handleClinic(c); return `selected ${c.name}`; }
        return 'clinic not found';
      },
      pick_date: ({ date }: { date: string }) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) { pushAi('اختر اليوم:', { kind: 'date' }); return 'showed dates'; }
        handleDate(d.toISOString(), d.toLocaleDateString('ar-IQ'));
        return `picked ${date}`;
      },
      pick_time: ({ time }: { time: string }) => { handleTime(time); return `picked ${time}`; },
      fill_patient_info: (params: { name?: string; phone?: string; age?: string; gender?: string }) => {
        setBooking(prev => ({
          ...prev,
          patient: {
            name: params.name || prev.patient.name,
            phone: params.phone || prev.patient.phone,
            age: params.age || prev.patient.age,
            gender: (params.gender as any) || prev.patient.gender,
          }
        }));
        return 'patient info updated';
      },
      confirm_booking: async () => { await handleConfirmBooking(); return 'booking confirmed'; },
    },
    overrides: {
      agent: {
        firstMessage: 'أهلاً بك في منصة طب الأسنان الذكية! أنا مساعدك الصوتي. أخبرني، ما الذي تعاني منه أو ما نوع العلاج الذي تحتاجه؟',
        language: 'ar',
        prompt: {
          prompt: `أنت المساعد الصوتي الرسمي لمنصة طب الأسنان في العراق. تتحدث بلغة عربية عراقية ودودة ومحترفة باسم المنصة.
مهمتك: مساعدة المريض في حجز موعد عبر:
1) سؤاله عن المشكلة/الاختصاص (عام، تقويم، أطفال، جراحة، تجميل، طوارئ) → استخدم select_specialty
2) سؤاله عن المحافظة → استخدم select_governorate
3) عرض العيادات المسجلة → استخدم show_clinics ثم select_clinic عند اختياره
4) سؤاله عن اليوم والوقت المناسب → pick_date و pick_time
5) أخذ بياناته (الاسم، رقم الهاتف، العمر، الجنس) → fill_patient_info
6) تأكيد الحجز → confirm_booking
كن مختصراً ومتعاطفاً. لا تعطِ تشخيصاً طبياً نهائياً. اقترح دائماً عيادة من قاعدة بيانات المنصة.`
        }
      }
    }
  });

  const startVoiceMode = async () => {
    setIsConnectingVoice(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: ELEVENLABS_AGENT_ID, connectionType: 'webrtc' });
      setVoiceMode(true);
    } catch (e) {
      console.error(e);
      pushAi('تعذر الوصول للميكروفون. تأكد من السماح بالوصول.');
    } finally {
      setIsConnectingVoice(false);
    }
  };

  const stopVoiceMode = async () => {
    await conversation.endSession();
    setVoiceMode(false);
  };

  // ============== Cards UI ==============
  const renderCard = (card: CardKind) => {
    if (card.kind === 'specialty') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {SPECIALTIES.map(sp => {
            const Icon = sp.icon;
            return (
              <button
                key={sp.id}
                onClick={() => handleSpecialty(sp)}
                className={`group relative overflow-hidden bg-gradient-to-br ${sp.color} text-white p-3 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 text-right`}
              >
                <Icon className="w-6 h-6 mb-1.5 opacity-90" />
                <div className="text-xs font-bold leading-tight">{sp.label}</div>
              </button>
            );
          })}
        </div>
      );
    }
    if (card.kind === 'governorate') {
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {GOVERNORATES.map(g => (
            <button
              key={g}
              onClick={() => handleGovernorate(g)}
              className="bg-white border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 text-gray-800 text-xs font-semibold py-2 px-2 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-1"
            >
              <MapPin className="w-3 h-3 text-blue-500" />{g}
            </button>
          ))}
        </div>
      );
    }
    if (card.kind === 'clinics') {
      return (
        <div className="-mx-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex gap-3 px-2 snap-x snap-mandatory min-w-max">
            {card.clinics.map(c => (
              <div
                key={c.id}
                className="snap-start shrink-0 w-64 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all"
              >
                <div className="h-28 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                  {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-600 flex items-center gap-1">
                    ⭐ {c.rating || 4.5}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm text-gray-900 truncate">{c.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />{c.governorate || c.address || 'العراق'}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1 truncate">
                    {c.specialties?.slice(0, 2).join('، ')}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />{c.workingHours || '09:00 - 21:00'}
                  </div>
                  <button
                    onClick={() => handleClinic(c)}
                    className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <CalendarIcon className="w-3 h-3" />احجز هنا
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (card.kind === 'date') {
      const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i);
        return d;
      });
      return (
        <div className="-mx-2 mt-3 overflow-x-auto pb-2">
          <div className="flex gap-2 px-2">
            {days.map(d => {
              const dayName = d.toLocaleDateString('ar-IQ', { weekday: 'short' });
              const dayNum = d.getDate();
              const month = d.toLocaleDateString('ar-IQ', { month: 'short' });
              const iso = d.toISOString();
              return (
                <button
                  key={iso}
                  onClick={() => handleDate(iso, `${dayName} ${dayNum} ${month}`)}
                  className="shrink-0 w-16 bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl py-2 px-1 transition-all text-center hover:scale-105"
                >
                  <div className="text-[10px] text-gray-500">{dayName}</div>
                  <div className="text-lg font-bold text-gray-900">{dayNum}</div>
                  <div className="text-[10px] text-gray-500">{month}</div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    if (card.kind === 'time') {
      return (
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-xs font-bold text-amber-600 mb-1.5 flex items-center gap-1">☀️ الفترة الصباحية</div>
            <div className="flex flex-wrap gap-1.5">
              {TIME_SLOTS.morning.map(t => (
                <button key={t} onClick={() => handleTime(t)}
                  className="bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 text-xs font-bold py-1.5 px-3 rounded-lg border border-amber-200 transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-600 mb-1.5 flex items-center gap-1">🌙 الفترة المسائية</div>
            <div className="flex flex-wrap gap-1.5">
              {TIME_SLOTS.evening.map(t => (
                <button key={t} onClick={() => handleTime(t)}
                  className="bg-indigo-50 hover:bg-indigo-500 hover:text-white text-indigo-700 text-xs font-bold py-1.5 px-3 rounded-lg border border-indigo-200 transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (card.kind === 'patient') {
      return (
        <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-3 space-y-2">
          <input
            type="text" placeholder="الاسم الكامل"
            value={booking.patient.name}
            onChange={e => setBooking(p => ({ ...p, patient: { ...p.patient, name: e.target.value } }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-right"
          />
          <input
            type="tel" placeholder="رقم الهاتف (07XXXXXXXXX)"
            value={booking.patient.phone}
            onChange={e => setBooking(p => ({ ...p, patient: { ...p.patient, phone: e.target.value } }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-right"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number" placeholder="العمر"
              value={booking.patient.age}
              onChange={e => setBooking(p => ({ ...p, patient: { ...p.patient, age: e.target.value } }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-right"
            />
            <select
              value={booking.patient.gender}
              onChange={e => setBooking(p => ({ ...p, patient: { ...p.patient, gender: e.target.value as any } }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none bg-white"
              aria-label="اختيار الجنس"
            >
              <option value="">الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          <button
            disabled={!booking.patient.name || !booking.patient.phone || isLoading}
            onClick={handleConfirmBooking}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            تأكيد الحجز
          </button>
        </div>
      );
    }
    if (card.kind === 'confirmation') {
      return (
        <div className="mt-3 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-2">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div className="font-bold text-emerald-800">تم الحجز بنجاح</div>
          <button onClick={() => navigate('/')} className="mt-3 text-xs font-bold text-emerald-700 hover:underline">
            العودة للرئيسية
          </button>
        </div>
      );
    }
    return null;
  };

  // ============== UI ==============
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-3xl px-3 py-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur border border-white shadow-lg rounded-2xl p-4 mb-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="العودة للخلف">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">المساعد الذكي</div>
                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${voiceMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  {voiceMode ? (conversation.isSpeaking ? 'يتحدث…' : 'يستمع…') : 'متصل'}
                </div>
              </div>
            </div>
          </div>
          {!voiceMode ? (
            <button
              onClick={startVoiceMode}
              disabled={isConnectingVoice}
              className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-60"
            >
              {isConnectingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              تحدث صوتياً
            </button>
          ) : (
            <button
              onClick={stopVoiceMode}
              className="bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse"
            >
              <PhoneOff className="w-4 h-4" />إنهاء
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[calc(100vh-180px)]">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                  m.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                </div>
                <div className="max-w-[85%] flex-1">
                  {m.image && (
                    <img src={m.image} alt="" className="rounded-lg mb-1 max-w-[200px] border border-gray-200" />
                  )}
                  {m.content && (
                    <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      {m.content}
                      {m.role === 'ai' && (
                        <button onClick={() => speakText(m.content)} className="block mt-1.5 text-[10px] text-blue-600 hover:text-blue-800">
                          <Volume2 className="w-3 h-3 inline ml-1" />استمع
                        </button>
                      )}
                    </div>
                  )}
                  {m.card && renderCard(m.card)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-sm">
                  <Brain className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none p-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!voiceMode && (
            <div className="border-t border-gray-100 p-3">
              {imagePreview && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg w-fit border border-blue-100">
                  <img src={imagePreview} alt="" className="w-10 h-10 object-cover rounded" />
                  <button onClick={() => setImagePreview(null)} className="text-red-500 p-1 hover:bg-red-50 rounded-full" aria-label="إغلاق معاينة الصورة">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" aria-label="رفع صورة" />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white rounded-xl text-gray-500 hover:text-blue-600 transition-colors" aria-label="إرفاق صورة">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button onClick={toggleListening} className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-white text-gray-500 hover:text-blue-600'}`} aria-label={isListening ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}>
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب أي سؤال أو استفسار…"
                  className="flex-1 bg-transparent outline-none text-sm px-2 text-right"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && !imagePreview) || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2 rounded-xl disabled:opacity-40 transition-all"
                  aria-label="إرسال الرسالة"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {voiceMode && (
            <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-rose-50 to-pink-50 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg ${conversation.isSpeaking ? 'animate-pulse' : ''}`}>
                    <Mic className="w-6 h-6" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-rose-300 animate-ping" />
                </div>
                <div className="text-xs font-bold text-rose-700">
                  {conversation.isSpeaking ? 'المساعد يتحدث…' : 'تكلم الآن، أنا أستمع…'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
