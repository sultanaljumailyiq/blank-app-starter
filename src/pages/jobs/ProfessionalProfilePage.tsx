import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, Save, Trash2, FileText, Award } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useJobProfile, JobSeekerProfile, Experience, Education } from '../../hooks/useJobProfile';

// UI Helper for toggle switch
const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <label className="flex items-center cursor-pointer gap-2 select-none">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
);

export const ProfessionalProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { profile: serverProfile, loading, updateProfile, toggleLookingForWork, lastError } = useJobProfile();
    const [isEditing, setIsEditing] = useState(false);

    // Local state for editing form
    const [profile, setProfile] = useState<JobSeekerProfile>(serverProfile);

    // Sync from server when loading finishes or server updates
    useEffect(() => {
        if (serverProfile) {
            setProfile(serverProfile);
        }
    }, [serverProfile]);

    const saveProfile = async () => {
        await updateProfile(profile);
        setIsEditing(false);
    };

    const addExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            title: '',
            company: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        };
        setProfile(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    };

    const updateExperience = (id: string, field: keyof Experience, value: any) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };

    const removeExperience = (id: string) => {
        setProfile(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
    };

    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            education: [...prev.education, { id: Date.now().toString(), degree: '', institution: '', year: '' }]
        }));
    };

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };

    const removeEducation = (id: string) => {
        setProfile(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skillsString = e.target.value;
        setProfile(prev => ({ ...prev, skills: skillsString.split(',').map(s => s.trim()) }));
    };

    if (loading) return <div className="p-12 text-center">جاري التحميل...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
            <div className="container mx-auto px-4 max-w-4xl">
                {lastError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-right">
                        <strong>خطأ:</strong> {lastError}
                    </div>
                )}
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-8 h-8 text-blue-600" />
                            الملف الشخصي المهني
                        </h1>
                        <p className="text-gray-500 mt-1">قم بإعداد سيرتك الذاتية للتقديم على الوظائف</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                        {/* Toggle Looking for Work */}
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                            <Toggle
                                label="متاح للعمل (Looking for Work)"
                                checked={serverProfile?.is_looking_for_work || false}
                                onChange={(val) => {
                                    console.log('Toggle clicked:', val);
                                    toggleLookingForWork(val);
                                }}
                            />

                        </div>

                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
                                    <Button onClick={saveProfile} className="bg-green-600 hover:bg-green-700 text-white">
                                        <Save className="w-4 h-4 ml-2" />
                                        حفظ التغييرات
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}>تعديل الملف</Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Sidebar - Personal Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="p-6 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="font-bold text-xl text-gray-900">{user?.name}</h2>

                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        className="mt-2 w-full text-center border rounded px-2 py-1 text-sm mb-2"
                                        placeholder="المسمى الوظيفي (مثلاً طبيب أسنان)"
                                        value={profile.title}
                                        onChange={e => setProfile({ ...profile, title: e.target.value })}
                                    />
                                    <select
                                        className="w-full border rounded px-2 py-1 text-sm bg-white"
                                        value={profile.role || 'doctor'}
                                        onChange={e => setProfile({ ...profile, role: e.target.value })}
                                    >
                                        <option value="doctor">طبيب أسنان (Doctor)</option>
                                        <option value="assistant">مساعد / طاقم عيادة (Staff/Nurse)</option>
                                        <option value="technician">تقني معمل (Lab Technician)</option>
                                        <option value="supplier">مورد / مندوب (Supplier)</option>
                                    </select>
                                </>
                            ) : (
                                <div>
                                    <p className="text-blue-600 font-medium">{profile.title || 'لم يحدد المسمى الوظيفي'}</p>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1 inline-block">
                                        {profile.role === 'doctor' && 'طبيب'}
                                        {profile.role === 'assistant' && 'طاقم عيادة'}
                                        {profile.role === 'technician' && 'تقني معمل'}
                                        {profile.role === 'supplier' && 'مورد'}
                                        {!profile.role && 'غير محدد'}
                                    </span>
                                </div>
                            )}

                            <div className="mt-6 space-y-3 text-right">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="border rounded px-2 py-1 w-full"
                                            value={profile.phone}
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="رقم الهاتف"
                                        />
                                    ) : (
                                        <span>{profile.phone || 'غير محدد'}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="border rounded px-2 py-1 w-full"
                                            value={profile.location}
                                            onChange={e => setProfile({ ...profile, location: e.target.value })}
                                            placeholder="الموقع (المدينة)"
                                        />
                                    ) : (
                                        <span>{profile.location || 'غير محدد'}</span>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-purple-600" />
                                المهارات
                            </h3>
                            {isEditing ? (
                                <div>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                        value={profile.skills.join(', ')}
                                        onChange={handleSkillsChange}
                                        placeholder="افصل بين المهارات بفاصلة"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">مثال: جراحة, تقويم, زراعة</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.length > 0 ? (
                                        profile.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400">لا توجد مهارات مضافة</span>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Bio */}
                        <Card className="p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-600" />
                                نبذة عني
                            </h3>
                            {isEditing ? (
                                <textarea
                                    className="w-full border rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={profile.bio}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="اكتب نبذة مختصرة عن خبراتك وطموحاتك..."
                                />
                            ) : (
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {profile.bio || 'لم تتم إضافة نبذة شخصية بعد.'}
                                </p>
                            )}
                        </Card>

                        {/* Experience */}
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    الخبرات العملية
                                </h3>
                                {isEditing && (
                                    <Button size="sm" onClick={addExperience} variant="outline" className="text-blue-600 hover:bg-blue-50">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-6 relative">
                                {profile.experience.length > 0 ? (
                                    profile.experience.map((exp, index) => (
                                        <div key={exp.id} className={`relative pl-4 ${index !== profile.experience.length - 1 ? 'border-r-2 border-gray-100 pb-8 mr-2 pr-6' : 'mr-2 pr-6'}`}>
                                            <div className="absolute top-0 -right-[5px] w-3 h-3 bg-blue-600 rounded-full ring-4 ring-white" />

                                            {isEditing ? (
                                                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                                    <div className="flex justify-between">
                                                        <input
                                                            className="font-bold bg-transparent border-b border-gray-300 w-full ml-2 focus:border-blue-500 outline-none"
                                                            value={exp.title}
                                                            onChange={e => updateExperience(exp.id, 'title', e.target.value)}
                                                            placeholder="المسمى الوظيفي"
                                                        />
                                                        <button onClick={() => removeExperience(exp.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <input
                                                        className="text-sm w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                                                        value={exp.company}
                                                        onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                                                        placeholder="اسم الشركة/العيادة"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="date"
                                                            className="text-xs border rounded px-2 py-1"
                                                            value={exp.startDate}
                                                            onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                                                        />
                                                        <span className="text-gray-400">-</span>
                                                        <input
                                                            type="date"
                                                            className="text-xs border rounded px-2 py-1"
                                                            value={exp.endDate}
                                                            onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                                                            disabled={exp.current}
                                                        />
                                                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={exp.current}
                                                                onChange={e => updateExperience(exp.id, 'current', e.target.checked)}
                                                            />
                                                            أعمل هنا حالياً
                                                        </label>
                                                    </div>
                                                    <textarea
                                                        className="w-full text-sm border rounded p-2 h-20"
                                                        value={exp.description}
                                                        onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                                                        placeholder="وصف المهام..."
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{exp.title}</h4>
                                                    <p className="text-sm text-blue-600 font-medium mb-1">{exp.company}</p>
                                                    <p className="text-xs text-gray-400 mb-2">
                                                        {exp.startDate} - {exp.current ? 'الآن' : exp.endDate}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{exp.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">لا توجد خبرات مسجلة</p>
                                )}
                            </div>
                        </Card>

                        {/* Education */}
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-green-600" />
                                    التعليم والمؤهلات
                                </h3>
                                {isEditing && (
                                    <Button size="sm" onClick={addEducation} variant="outline" className="text-green-600 hover:bg-green-50">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {profile.education.length > 0 ? (
                                    profile.education.map((edu) => (
                                        <div key={edu.id} className="flex gap-4 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <input
                                                                className="font-bold text-sm w-full border rounded px-2 py-1"
                                                                value={edu.degree}
                                                                onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                                                                placeholder="الدرجة العلمية"
                                                            />
                                                            <button onClick={() => removeEducation(edu.id)} className="text-red-500 p-1">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <input
                                                            className="text-sm w-full border rounded px-2 py-1"
                                                            value={edu.institution}
                                                            onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                                                            placeholder="الجامعة / المعهد"
                                                        />
                                                        <input
                                                            className="text-xs w-24 border rounded px-2 py-1"
                                                            value={edu.year}
                                                            onChange={e => updateEducation(edu.id, 'year', e.target.value)}
                                                            placeholder="سنة التخرج"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="font-bold text-gray-900 text-sm">{edu.degree}</h4>
                                                        <p className="text-xs text-gray-600">{edu.institution}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{edu.year}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">لا توجد مؤهلات مسجلة</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
