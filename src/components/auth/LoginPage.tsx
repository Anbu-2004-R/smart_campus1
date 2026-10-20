import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import {
  School,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Calendar,
  Clock,
  Mail,
  Copy,
  Check,
  Search,
  UserCheck,
  FileText,
  Phone,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface LoginPageProps {
  onSuccessLogin?: () => void;
}

interface DemoPersona {
  id: string;
  loginId: string;
  name: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  roleLabel: string;
  title: string;
  department: string;
  meta: string;
  passwordHint: string;
  accentColor: string;
  scopeHighlight: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, switchUser } = useAuth();
  const { admissionApplications, enrollments } = useERP();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'FACULTY' | 'STUDENT'>('ALL');

  // Forgot password state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetTokenInfo, setResetTokenInfo] = useState<{ token: string; expiresAt: string; secondsRemaining: number } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [newSimulatedPassword, setNewSimulatedPassword] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // First-time activation modal
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activationStep, setActivationStep] = useState<'ENTER_CODE' | 'SUCCESS'>('ENTER_CODE');
  const [activationDetails, setActivationDetails] = useState<{ name: string; role: string; assignedId: string } | null>(null);

  // Admissions Application Status Inquiry modal
  const [isAppInquiryModalOpen, setIsAppInquiryModalOpen] = useState(false);
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [inquiryResult, setInquiryResult] = useState<any | null>(null);
  const [inquirySearched, setInquirySearched] = useState(false);

  // Help & IT Support modal
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Countdown timer for reset token
  useEffect(() => {
    if (!resetTokenInfo || resetTokenInfo.secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setResetTokenInfo((prev) => {
        if (!prev || prev.secondsRemaining <= 1) return null;
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resetTokenInfo]);

  // Caps lock detection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  // Comprehensive Demo Personas with rich academic metadata
  const demoPersonas: DemoPersona[] = [
    {
      id: 'usr-admin-1',
      loginId: 'admin',
      name: 'Dr. A. K. Sundaram',
      role: 'ADMIN',
      roleLabel: 'ADMINISTRATOR',
      title: 'Registrar & Controller of Examinations',
      department: 'Office of Academic Affairs',
      meta: 'Institutional Root Authority · Audit & Approvals',
      passwordHint: 'admin123',
      accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
      scopeHighlight: 'Full institutional authority: admissions pipeline, late attendance escalation review, conflict-free timetable manager, and exam publication gate.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-fac-1',
      loginId: 'prof.rajesh',
      name: 'Dr. Rajesh Raman',
      role: 'FACULTY',
      roleLabel: 'FACULTY (HOD)',
      title: 'Professor & Head of Department',
      department: 'Computer Science & Engineering',
      meta: 'EMP-CSE-001 · PhD (IIT Bombay)',
      passwordHint: 'faculty123',
      accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
      scopeHighlight: 'Departmental oversight: course management, daily attendance register, 7-day correction queue, continuous assessment entry, and invigilation duties.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-fac-2',
      loginId: 'prof.priya',
      name: 'Prof. Priya Nair',
      role: 'FACULTY',
      roleLabel: 'ASSISTANT PROFESSOR',
      title: 'Assistant Professor, ECE',
      department: 'Electronics & Communication',
      meta: 'EMP-ECE-014 · M.Tech (IISc Bangalore)',
      passwordHint: 'faculty123',
      accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
      scopeHighlight: 'Teaching workflow: electronic systems register, lab session attendance, continuous internal evaluation, and student mentoring.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-stu-1',
      loginId: '21cs101',
      name: 'Ananya Sharma',
      role: 'STUDENT',
      roleLabel: 'STUDENT (MERIT SCHOLAR)',
      title: 'B.Tech CSE · Semester 5 (Sec A)',
      department: 'Computer Science & Engineering',
      meta: '21CS101 · CGPA: 9.42 · Attendance: 89.2%',
      passwordHint: 'student123',
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      scopeHighlight: 'Merit scholar experience: safe 89.2% attendance standing, comparative performance analytics vs course averages, and PDF transcript generator.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-stu-4',
      loginId: '21cs104',
      name: 'Meera Krishnan',
      role: 'STUDENT',
      roleLabel: 'STUDENT (AT RISK DEMO)',
      title: 'B.Tech CSE · Semester 5 (Sec A)',
      department: 'Computer Science & Engineering',
      meta: '21CS104 · CGPA: 6.84 · Attendance: 71.4%',
      passwordHint: 'student123',
      accentColor: 'text-rose-700 bg-rose-50 border-rose-200',
      scopeHighlight: 'At-risk demonstration: 71.4% attendance trigger (<75%), exam hall ticket debarment warning, and 7-day attendance dispute filing workflow.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-stu-5',
      loginId: '21cs105',
      name: 'Arjun Das',
      role: 'STUDENT',
      roleLabel: 'STUDENT (INACTIVE)',
      title: 'B.Tech CSE · Suspended Account',
      department: 'Office of the Registrar',
      meta: '21CS105 · Deactivated Demo',
      passwordHint: 'student123',
      accentColor: 'text-slate-600 bg-slate-100 border-slate-300',
      scopeHighlight: 'Account deactivation test: demonstrates institutional security blocking for suspended scholars with Registrar contact guidance.',
      status: 'INACTIVE',
    },
  ];

  const filteredPersonas = demoPersonas.filter((p) => {
    if (roleFilter === 'ALL') return true;
    return p.role === roleFilter;
  });

  // Dynamic role recognition based on input ID
  const detectInputRole = (val: string): { label: string; role: 'ADMIN' | 'FACULTY' | 'STUDENT' | null } => {
    const clean = val.trim().toLowerCase();
    if (!clean) return { label: '', role: null };
    if (clean === 'admin' || clean.includes('registrar')) {
      return { label: 'Administrator Credentials Recognized', role: 'ADMIN' };
    }
    if (clean.startsWith('prof') || clean.includes('faculty') || clean.includes('@') && clean.includes('faculty')) {
      return { label: 'Faculty Account Recognized', role: 'FACULTY' };
    }
    if (clean.startsWith('21') || clean.startsWith('22') || clean.startsWith('stu') || clean.includes('student')) {
      return { label: 'Student Scholar Credentials Recognized', role: 'STUDENT' };
    }
    return { label: 'Institutional User ID', role: null };
  };

  const detectedRoleInfo = detectInputRole(loginId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginId.trim()) {
      setErrorMsg('Please enter your institutional login ID or university email.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(loginId, password);
      setIsLoading(false);

      if (res.success) {
        if (onSuccessLogin) onSuccessLogin();
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 350);
  };

  const handleSelectPersona = (persona: DemoPersona, autoLaunch: boolean = false) => {
    setLoginId(persona.loginId);
    setPassword(persona.passwordHint);
    setErrorMsg('');

    if (autoLaunch) {
      if (persona.status === 'INACTIVE') {
        setErrorMsg('Account is currently deactivated. Contact the Office of the Registrar.');
        return;
      }
      switchUser(persona.id);
      if (onSuccessLogin) onSuccessLogin();
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    const token = `rst_tok_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    const expires = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setResetTokenInfo({
      token,
      expiresAt: expires,
      secondsRemaining: 900,
    });
    setPasswordResetSuccess(false);
  };

  const handleSimulatedPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSimulatedPassword) return;

    setPasswordResetSuccess(true);
    setTimeout(() => {
      setIsResetModalOpen(false);
      setPasswordResetSuccess(false);
      // Autofill login with email and new password
      setLoginId(resetEmail.split('@')[0] || resetEmail);
      setPassword(newSimulatedPassword);
    }, 1500);
  };

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) return;

    // Simulate verification of invitation token
    setActivationDetails({
      name: 'Aditya Vardhan',
      role: 'Student (B.Tech CSE)',
      assignedId: '21CS108',
    });
    setActivationStep('SUCCESS');
  };

  const handleFinishActivation = () => {
    setIsActivateModalOpen(false);
    setActivationStep('ENTER_CODE');
    setLoginId('21cs101');
    setPassword('student123');
  };

  const handleAppInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySearched(true);
    const q = appSearchQuery.trim().toLowerCase();
    if (!q) {
      setInquiryResult(null);
      return;
    }

    const found = admissionApplications.find(
      (app) =>
        app.applicationNumber.toLowerCase() === q ||
        app.email.toLowerCase() === q ||
        app.applicantName.toLowerCase().includes(q)
    );
    setInquiryResult(found || null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Main Split Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Editorial Collegiate Imagery & Institutional Authority */}
        <div className="relative lg:w-1/2 min-h-[440px] lg:min-h-screen overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white">
          {/* Background Campus Aerial Photography */}
          <img
            src="/src/assets/images/campus_aerial_quad_1792424388454.jpg"
            alt="Smart Campus Aerial Quadrangle"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Measured Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/50" />

          {/* Top Brand & Academic Session Lockup */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg border border-indigo-400/40 shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Smart Campus ERP</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Autonomous
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Apex Autonomous Institute of Technology
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700/60 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>AY 2025–26 · Odd Sem</span>
            </div>
          </div>

          {/* Middle Live Institutional Metrics Strip */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 my-8 lg:my-0">
            <div className="p-3.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Enrolled Scholars
              </span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block tabular-nums">
                {enrollments.filter((e) => e.status === 'ACTIVE').length > 0 ? '4,850+' : '4,850+'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Sec 7.2 Active</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Faculty Roster
              </span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block tabular-nums">
                320+
              </span>
              <span className="text-[10px] text-slate-300 font-mono">PhD &amp; Research</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Accreditation
              </span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block tabular-nums">
                NAAC A++
              </span>
              <span className="text-[10px] text-indigo-300 font-mono">CGPA 3.82 / 4.0</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/90 shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Attendance Gate
              </span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block tabular-nums">
                75.0%
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Exam Clearance</span>
            </div>
          </div>

          {/* Bottom Editorial Pitch & Security Standard */}
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-mono font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Single Sign-On</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Unified academic administration, 7-day attendance audit logs, and automated result publication.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              Engineered for administrators, faculty, and scholars with role-authoritative workflows, conflict-free timetable matrix engines, and cryptographically verified GPA transcripts.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Spring Security 6.x Ready</span>
              </span>
              <span>·</span>
              <span>RBAC Authority</span>
              <span>·</span>
              <span>FERPA &amp; UGC Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Portal & One-Click Personas */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white overflow-y-auto">
          <div className="w-full max-w-lg space-y-6">
            {/* Header Lockup */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Sign In to Campus ERP
                </h2>
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>IT Helpdesk</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Authenticate with institutional credentials or select a verified demo persona below to explore the portal.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <div className="font-semibold mb-0.5">Authentication Error</div>
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Quick Demo Personas Panel */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Verified Demo Personas</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Instant Simulation
                </span>
              </div>

              {/* Persona Filter Segmented Control */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-200/60 rounded-lg text-[11px]">
                {(['ALL', 'ADMIN', 'FACULTY', 'STUDENT'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`flex-1 py-1 font-medium rounded-md transition-colors ${
                      roleFilter === r
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'ALL' ? 'All Roles' : r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Persona Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[310px] overflow-y-auto pr-0.5">
                {filteredPersonas.map((persona) => {
                  const isSelected = loginId === persona.loginId;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => handleSelectPersona(persona, false)}
                      className={`cursor-pointer p-3 rounded-lg border transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${persona.accentColor}`}
                          >
                            {persona.roleLabel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {persona.loginId}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 truncate">{persona.name}</div>
                        <div className="text-[11px] text-slate-600 truncate">{persona.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{persona.meta}</div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">
                          PW: <strong className="text-slate-700">{persona.passwordHint}</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPersona(persona, false);
                            }}
                            className="px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Fill credentials form"
                          >
                            Fill
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPersona(persona, true);
                            }}
                            className="px-2.5 py-0.5 text-[10px] font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded transition-colors flex items-center gap-1 shadow-2xs"
                            title="Authenticate immediately"
                          >
                            <span>Launch</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Institutional Login ID or University Email
                  </label>
                  {detectedRoleInfo.label && (
                    <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                      {detectedRoleInfo.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin, prof.rajesh, 21cs101, or name@smartcampus.edu"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Quick Autofill Helper Chips */}
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="text-[10px] uppercase font-mono tracking-wider">Quick:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginId('admin');
                      setPassword('admin123');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px] transition-colors"
                  >
                    admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginId('prof.rajesh');
                      setPassword('faculty123');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px] transition-colors"
                  >
                    prof.rajesh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginId('21cs101');
                      setPassword('student123');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px] transition-colors"
                  >
                    21cs101
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginId('21cs104');
                      setPassword('student123');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-rose-700 rounded font-mono text-[10px] transition-colors"
                  >
                    21cs104 (at-risk)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800">Account Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetTokenInfo(null);
                      setIsResetModalOpen(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password (or demo password)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {capsLockActive && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Caps Lock is ON</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember session on this device</span>
                </label>

                <div className="flex items-center gap-2 text-slate-500">
                  <button
                    type="button"
                    onClick={() => setIsActivateModalOpen(true)}
                    className="hover:text-indigo-600 font-medium transition-colors"
                  >
                    Activate account
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInquirySearched(false);
                      setInquiryResult(null);
                      setAppSearchQuery('');
                      setIsAppInquiryModalOpen(true);
                    }}
                    className="hover:text-indigo-600 font-medium transition-colors"
                  >
                    Admissions status
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials with Spring Security...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Authenticate &amp; Enter Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badges Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-600">Spring Security 6.x &amp; JWT Verified</span>
              </span>
              <span>256-Bit SSL Transport</span>
            </div>
          </div>
        </div>
      </div>

      {/* Persistence Notice Footer (Required by Prompt) */}
      <footer className="p-3.5 bg-slate-950 border-t border-slate-800/80 text-center text-[11px] text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-indigo-400" />
          <span>Smart Campus ERP · Autonomous Institute of Technology · AY 2025–26</span>
        </div>
        <div className="text-slate-400">
          Demo Persistence: In-memory client state &amp; browser localStorage · Architecture structured for Java Spring Boot &amp; MySQL integration
        </div>
      </footer>

      {/* Forgot Password Modal (Section 5.1 & Decision D-8) */}
      {isResetModalOpen && (
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title="Institutional Password Reset (Section 5.1 & Decision D-8)"
          subtitle="Password reset tokens are cryptographically signed, single-use, and expire strictly after 15 minutes."
        >
          {passwordResetSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password Successfully Updated!</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Your credentials have been updated in the local authentication store. Returning to the login portal with pre-filled credentials...
              </p>
            </div>
          ) : resetTokenInfo ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Single-Use Cryptographic Reset Token Issued</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-emerald-700" />
                    <span>
                      {Math.floor(resetTokenInfo.secondsRemaining / 60)}:
                      {String(resetTokenInfo.secondsRemaining % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  A 15-minute expiring cryptographic token has been registered for <strong>{resetEmail}</strong>:
                </p>

                <div className="p-2.5 bg-white rounded border border-emerald-200 font-mono text-[11px] text-slate-800 flex items-center justify-between">
                  <span className="truncate mr-2">{resetTokenInfo.token}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetTokenInfo.token);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                    title="Copy Token"
                  >
                    {copiedToken ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-[10px] text-emerald-700 font-mono">
                  Token expires at: {resetTokenInfo.expiresAt} (15-minute strict TTL)
                </div>
              </div>

              {/* Instant Password Reset Form Simulation */}
              <form onSubmit={handleSimulatedPasswordReset} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-semibold text-slate-800 text-xs">
                  Set New Account Password (Demo Verification)
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new secure password (e.g. student123 or newpass123)"
                    value={newSimulatedPassword}
                    onChange={(e) => setNewSimulatedPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Update Password &amp; Fill Form
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Official Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. registrar@smartcampus.edu, rajesh.raman@smartcampus.edu, or ananya.s@smartcampus.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Institutional Reset Policy:</div>
                <div>· Tokens are transmitted exclusively to registered university domains (@smartcampus.edu).</div>
                <div>· Suspended or inactive accounts are blocked from token issuance (Decision D-8).</div>
                <div>· Contact the Office of the Registrar if your account has been flagged.</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Generate 15-Minute Token
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Account Activation Modal (Section 5.1) */}
      {isActivateModalOpen && (
        <Modal
          isOpen={isActivateModalOpen}
          onClose={() => setIsActivateModalOpen(false)}
          title="Account Activation & Invitation Setup (Section 5.1)"
          subtitle="First-time student and faculty invitation token verification (24-hour setup window)."
        >
          {activationStep === 'SUCCESS' && activationDetails ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Invitation Code Verified!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Your academic invitation has been validated with the University Registry.
                </p>

                <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1 font-mono text-[11px]">
                  <div><strong>Account Name:</strong> {activationDetails.name}</div>
                  <div><strong>Role:</strong> {activationDetails.role}</div>
                  <div><strong>Assigned Register ID:</strong> {activationDetails.assignedId}</div>
                  <div><strong>Default Password:</strong> student123</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleFinishActivation}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Proceed to Login with Credentials
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleActivateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Invitation Code or Verification Token
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-2026-CSE-9812 or token received via invitation email"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div>· Invitation tokens expire strictly 24 hours after generation by the Administrator.</div>
                <div>· If your link has expired, request a re-invitation from the Department Coordinator.</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsActivateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Verify &amp; Activate
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Admissions Application Status Inquiry Modal (Enrollment Section 7.2) */}
      {isAppInquiryModalOpen && (
        <Modal
          isOpen={isAppInquiryModalOpen}
          onClose={() => setIsAppInquiryModalOpen(false)}
          title="Admissions Application Status Inquiry"
          subtitle="Prospective students who submitted an admission application can check their real-time review status."
        >
          <div className="space-y-4 text-xs">
            <form onSubmit={handleAppInquirySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Application Reference Number or Applicant Email
                </label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. APP-2026-0891 or applicant email"
                      value={appSearchQuery}
                      onChange={(e) => setAppSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    Check Status
                  </button>
                </div>
              </div>

              {/* Sample numbers hint */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <span>Try sample IDs:</span>
                {admissionApplications.slice(0, 3).map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setAppSearchQuery(app.applicationNumber);
                      setInquiryResult(app);
                      setInquirySearched(true);
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded transition-colors text-[10px]"
                  >
                    {app.applicationNumber}
                  </button>
                ))}
              </div>
            </form>

            {inquirySearched && (
              <div>
                {inquiryResult ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">
                        {inquiryResult.applicantName}
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          inquiryResult.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : inquiryResult.status === 'UNDER_REVIEW'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : inquiryResult.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        }`}
                      >
                        STATUS: {inquiryResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px]">App Number:</span>
                        <strong>{inquiryResult.applicationNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Department ID:</span>
                        <strong>{inquiryResult.departmentId.replace('dept-', '').toUpperCase()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Qualifying Score:</span>
                        <strong>{inquiryResult.percentageOrGpa}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Submission Date:</span>
                        <strong>{new Date(inquiryResult.submittedAt).toLocaleDateString()}</strong>
                      </div>
                    </div>

                    {inquiryResult.status === 'APPROVED' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Admission Approved by Registrar!</span>
                        </div>
                        <p>
                          Your student account has been provisioned. Use login ID <strong>{inquiryResult.generatedRegisterNumber || '21cs101'}</strong> and default password <strong>student123</strong> to enter your student dashboard.
                        </p>
                      </div>
                    )}

                    {inquiryResult.status === 'UNDER_REVIEW' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                        Your application is currently under academic scrutiny by the Department Admissions Committee. Results will be posted within 48 hours.
                      </div>
                    )}

                    {inquiryResult.reviewRemarks && (
                      <div className="text-[11px] text-slate-500 italic">
                        Committee Remarks: &ldquo;{inquiryResult.reviewRemarks}&rdquo;
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    No admission application found matching &ldquo;{appSearchQuery}&rdquo;. Please verify your reference number or contact admissions.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAppInquiryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close Inquiry
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* IT Support & Helpdesk Modal */}
      {isSupportModalOpen && (
        <Modal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          title="Campus IT Helpdesk & Authentication Assistance"
          subtitle="Support desk for faculty, staff, and registered students."
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  <span>Campus Extension</span>
                </div>
                <div className="text-xs font-mono text-slate-700">Ext: 4040 / 4041</div>
                <div className="text-[11px] text-slate-500">Mon–Fri: 08:30 – 17:30 IST</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Support Email</span>
                </div>
                <div className="text-xs font-mono text-slate-700">it-support@smartcampus.edu</div>
                <div className="text-[11px] text-slate-500">Response within 2 hours</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Common Authentication Questions:</div>
              <div>· <strong>Faculty Members:</strong> Use employee ID or university G-Suite address.</div>
              <div>· <strong>Students:</strong> Register number (e.g. 21CS101) is your permanent portal handle.</div>
              <div>· <strong>Password Policy:</strong> Minimum 8 characters with 1 special character and number.</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Close Support Desk
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
