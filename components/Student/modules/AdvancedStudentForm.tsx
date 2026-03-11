import React, { useState } from 'react';
import { AdvancedStudent } from '../../types/student-advanced';

interface AdvancedStudentFormProps {
    onSave: (student: Partial<AdvancedStudent>) => void;
    onCancel: () => void;
}

export const AdvancedStudentForm: React.FC<AdvancedStudentFormProps> = ({ onSave, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // 1. Personal Info
        name: '',
        tcNo: '',
        birthDate: '',
        gender: '',
        bloodType: '',
        address: '',
        phone: '',
        email: '',
        
        // 2. Family Info
        parentName: '',
        parentRelation: '', // Anne, Baba, Vasi
        parentPhone: '',
        parentEmail: '',
        parentJob: '',
        emergencyContact: '',
        
        // 3. Academic & School
        schoolName: '',
        grade: '',
        studentNumber: '',
        teacherName: '',
        
        // 4. Diagnosis & Health
        diagnosis: [] as string[],
        medications: '',
        allergies: '',
        reportDate: '',
        reportEndDate: '',
        
        // 5. Notes
        initialObservations: '',
        expectations: '',
        strengths: '',
        weaknesses: ''
    });

    const [diagnosisInput, setDiagnosisInput] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDiagnosis = () => {
        if (diagnosisInput.trim()) {
            setFormData(prev => ({
                ...prev,
                diagnosis: [...prev.diagnosis, diagnosisInput.trim()]
            }));
            setDiagnosisInput('');
        }
    };

    const handleRemoveDiagnosis = (index: number) => {
        setFormData(prev => ({
            ...prev,
            diagnosis: prev.diagnosis.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = () => {
        // Map form data to AdvancedStudent structure
        // Note: This is a partial mapping, a real app would need more robust mapping
        const newStudent: Partial<AdvancedStudent> = {
            id: crypto.randomUUID(),
            name: formData.name,
            grade: formData.grade,
            // @ts-ignore - Extending core type with extra fields (mock)
            personalInfo: {
                tcNo: formData.tcNo,
                birthDate: formData.birthDate,
                gender: formData.gender,
                bloodType: formData.bloodType,
                address: formData.address,
                phone: formData.phone,
                email: formData.email
            },
            familyInfo: {
                parentName: formData.parentName,
                parentRelation: formData.parentRelation,
                parentPhone: formData.parentPhone,
                parentEmail: formData.parentEmail,
                parentJob: formData.parentJob,
                emergencyContact: formData.emergencyContact
            },
            schoolInfo: {
                schoolName: formData.schoolName,
                studentNumber: formData.studentNumber,
                teacherName: formData.teacherName
            },
            healthInfo: {
                diagnosis: formData.diagnosis,
                medications: formData.medications,
                allergies: formData.allergies,
                reportDate: formData.reportDate,
                reportEndDate: formData.reportEndDate
            },
            initialNotes: {
                observations: formData.initialObservations,
                expectations: formData.expectations,
                strengths: formData.strengths,
                weaknesses: formData.weaknesses
            },
            // Initialize empty modules
            iep: { goals: [], status: 'draft', startDate: new Date().toISOString(), endDate: new Date().toISOString(), diagnosis: formData.diagnosis, strengths: [], needs: [], accommodations: [], teamMembers: [], lastUpdated: new Date().toISOString() } as any,
            financial: { balance: 0, transactions: [], totalPaid: 0, totalDue: 0, currency: 'TRY', billingCycle: 'monthly', scholarshipRate: 0, paymentPlan: [] } as any,
            attendance: { records: [], stats: { totalDays: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0, trend: 'stable' } } as any,
            academic: { grades: [], metrics: { gpa: 0, subjectAverages: {}, attendanceRate: 0, participationRate: 0, homeworkCompletionRate: 0, strongestSubject: '', weakestSubject: '', recentTrend: 'flat' } } as any,
            behavior: { incidents: [], score: 100 } as any,
            portfolio: [],
            aiProfile: { learningStyle: 'visual', strengthAnalysis: '', struggleAnalysis: '', recommendedActivities: [], riskFactors: [], lastUpdated: new Date().toISOString() } as any
        };

        onSave(newStudent);
    };

    const steps = [
        { id: 1, title: 'Kişisel Bilgiler', icon: 'fa-user' },
        { id: 2, title: 'Aile Bilgileri', icon: 'fa-users' },
        { id: 3, title: 'Okul Bilgileri', icon: 'fa-school' },
        { id: 4, title: 'Tanı ve Sağlık', icon: 'fa-file-medical' },
        { id: 5, title: 'Gözlem Notları', icon: 'fa-clipboard-list' }
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-4xl mx-auto my-8 font-['Lexend'] animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                    <span className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                        <i className="fa-solid fa-user-plus"></i>
                    </span>
                    Yeni Öğrenci Kaydı
                </h2>
                <button onClick={onCancel} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* Stepper */}
            <div className="flex justify-between mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800 -z-10 -translate-y-1/2 rounded-full"></div>
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setStep(s.id)}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300
                            ${step >= s.id 
                                ? 'bg-indigo-600 border-indigo-100 dark:border-indigo-900 text-white shadow-lg' 
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400'}`}>
                            <i className={`fa-solid ${s.icon} text-sm`}></i>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300
                            ${step >= s.id ? 'text-indigo-600' : 'text-zinc-400'}`}>
                            {s.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Form Content */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3 mb-2">
                            <i className="fa-solid fa-info-circle text-indigo-600 mt-1"></i>
                            <p className="text-xs text-indigo-800 dark:text-indigo-300">
                                Öğrencinin temel kimlik ve iletişim bilgilerini eksiksiz giriniz. TC Kimlik No faturalandırma ve resmi işlemler için gereklidir.
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Ad Soyad <span className="text-red-500">*</span></label>
                            <input 
                                type="text" name="name" value={formData.name} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                placeholder="Örn: Ali Yılmaz"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">TC Kimlik No</label>
                            <input 
                                type="text" name="tcNo" value={formData.tcNo} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                maxLength={11} placeholder="11 haneli TC No"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Doğum Tarihi</label>
                            <input 
                                type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Cinsiyet</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold">
                                <option value="">Seçiniz</option>
                                <option value="male">Erkek</option>
                                <option value="female">Kız</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Kan Grubu</label>
                            <select name="bloodType" value={formData.bloodType} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold">
                                <option value="">Seçiniz</option>
                                <option value="A+">A Rh+</option>
                                <option value="A-">A Rh-</option>
                                <option value="B+">B Rh+</option>
                                <option value="B-">B Rh-</option>
                                <option value="AB+">AB Rh+</option>
                                <option value="AB-">AB Rh-</option>
                                <option value="0+">0 Rh+</option>
                                <option value="0-">0 Rh-</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Telefon</label>
                            <input 
                                type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                placeholder="05XX XXX XX XX"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Adres</label>
                            <textarea 
                                name="address" value={formData.address} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[100px]"
                                placeholder="Tam adres bilgisi..."
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-8 duration-300">
                         <div className="col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3 mb-2">
                            <i className="fa-solid fa-users text-indigo-600 mt-1"></i>
                            <p className="text-xs text-indigo-800 dark:text-indigo-300">
                                Acil durumlarda ulaşılacak veli ve iletişim bilgilerini giriniz. Fatura bu kişiye kesilecektir.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Veli Adı Soyadı <span className="text-red-500">*</span></label>
                            <input 
                                type="text" name="parentName" value={formData.parentName} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Yakınlık Derecesi</label>
                            <select name="parentRelation" value={formData.parentRelation} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold">
                                <option value="">Seçiniz</option>
                                <option value="mother">Anne</option>
                                <option value="father">Baba</option>
                                <option value="guardian">Yasal Vasi</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Veli Telefon <span className="text-red-500">*</span></label>
                            <input 
                                type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Veli E-posta</label>
                            <input 
                                type="email" name="parentEmail" value={formData.parentEmail} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Meslek</label>
                            <input 
                                type="text" name="parentJob" value={formData.parentJob} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Acil Durum İletişim (Ekstra)</label>
                            <input 
                                type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                placeholder="Ad Soyad - Telefon"
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3 mb-2">
                            <i className="fa-solid fa-school text-indigo-600 mt-1"></i>
                            <p className="text-xs text-indigo-800 dark:text-indigo-300">
                                Öğrencinin devam ettiği örgün eğitim kurumuna dair bilgiler. RAM raporları için gereklidir.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Okul Adı</label>
                            <input 
                                type="text" name="schoolName" value={formData.schoolName} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Sınıf / Şube</label>
                            <input 
                                type="text" name="grade" value={formData.grade} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                placeholder="Örn: 3-B"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Okul Numarası</label>
                            <input 
                                type="text" name="studentNumber" value={formData.studentNumber} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Sınıf Öğretmeni</label>
                            <input 
                                type="text" name="teacherName" value={formData.teacherName} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3 mb-2">
                            <i className="fa-solid fa-file-medical text-indigo-600 mt-1"></i>
                            <p className="text-xs text-indigo-800 dark:text-indigo-300">
                                Varsa tıbbi tanı, RAM raporu ve sağlık durumuna ilişkin kritik bilgiler. Bu bilgiler BEP oluşturulurken kullanılacaktır.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Tanı Ekle</label>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={diagnosisInput}
                                    onChange={(e) => setDiagnosisInput(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    placeholder="Örn: Disleksi, DEHB, Özgül Öğrenme Güçlüğü"
                                />
                                <button 
                                    onClick={handleAddDiagnosis}
                                    className="px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                                >
                                    Ekle
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.diagnosis.map((d, i) => (
                                    <span key={i} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold flex items-center gap-2">
                                        {d}
                                        <button onClick={() => handleRemoveDiagnosis(i)} className="hover:text-indigo-900"><i className="fa-solid fa-xmark"></i></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Rapor Başlangıç Tarihi</label>
                            <input 
                                type="date" name="reportDate" value={formData.reportDate} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Rapor Bitiş Tarihi</label>
                            <input 
                                type="date" name="reportEndDate" value={formData.reportEndDate} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Kullanılan İlaçlar</label>
                            <input 
                                type="text" name="medications" value={formData.medications} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                placeholder="Yok veya ilaç isimleri..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Alerjiler / Özel Durumlar</label>
                            <input 
                                type="text" name="allergies" value={formData.allergies} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3 mb-2">
                            <i className="fa-solid fa-clipboard-list text-indigo-600 mt-1"></i>
                            <p className="text-xs text-indigo-800 dark:text-indigo-300">
                                Öğrenciyle yapılan ilk görüşme notları, ailenin beklentileri ve sizin ilk izlenimleriniz.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">İlk Gözlem Notları</label>
                            <textarea 
                                name="initialObservations" value={formData.initialObservations} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[100px]"
                                placeholder="Öğrencinin iletişim becerileri, göz teması, dikkat süresi vb..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">Aile Beklentileri</label>
                            <textarea 
                                name="expectations" value={formData.expectations} onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[80px]"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Güçlü Yönler (Gözlem)</label>
                                <textarea 
                                    name="strengths" value={formData.strengths} onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[80px]"
                                    placeholder="İlgi alanları, yetenekleri..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Zayıf Yönler / İhtiyaçlar</label>
                                <textarea 
                                    name="weaknesses" value={formData.weaknesses} onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[80px]"
                                    placeholder="Desteklenmesi gereken alanlar..."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                    onClick={() => setStep(prev => Math.max(1, prev - 1))}
                    disabled={step === 1}
                    className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Geri
                </button>
                
                {step < steps.length ? (
                    <button 
                        onClick={() => setStep(prev => Math.min(steps.length, prev + 1))}
                        className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                    >
                        İleri <i className="fa-solid fa-arrow-right ml-2"></i>
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-indigo-300 dark:shadow-indigo-900/50"
                    >
                        <i className="fa-solid fa-check mr-2"></i> Kaydı Tamamla
                    </button>
                )}
            </div>
        </div>
    );
};
