import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  Course,
  Subject,
  ClassGroup,
  FacultyAssignment,
  ClassSession,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceCorrectionRequest,
  CorrectionRequestStatus,
  AttendanceRiskSettings,
  StudentAttendanceSummary,
  AttendanceRiskLevel,
  Exam,
  StudentMark,
  MarksStatus,
  GradeRule,
  SemesterResult,
  ArrearRecord,
  Classroom,
  TimetableEntry,
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  Announcement,
  InAppNotification,
  NotificationCategory,
  AuditLog,
  StudentEnrollment,
  AdmissionApplication,
  EnrollmentStatus,
  ApplicationStatus,
} from '../types/erp';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_CLASS_GROUPS,
  INITIAL_SUBJECTS,
  INITIAL_FACULTY_PROFILES,
  INITIAL_STUDENT_PROFILES,
  INITIAL_FACULTY_ASSIGNMENTS,
  INITIAL_CLASSROOMS,
  INITIAL_TIMETABLE,
  INITIAL_CLASS_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_RISK_SETTINGS,
  INITIAL_GRADE_RULES,
  INITIAL_EXAMS,
  INITIAL_STUDENT_MARKS,
  INITIAL_SEMESTER_RESULTS,
  INITIAL_ARREAR_RECORDS,
  INITIAL_COMPLAINTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_STUDENT_ENROLLMENTS,
  INITIAL_ADMISSION_APPLICATIONS,
} from '../services/mockData';
import { ACADEMIC_CALENDAR } from '../lib/academicCalendar';

interface ERPContextType {
  // Enrollment Management (Section 7.2 student_enrollments)
  enrollments: StudentEnrollment[];
  admissionApplications: AdmissionApplication[];
  submitAdmissionApplication: (appData: Omit<AdmissionApplication, 'id' | 'applicationNumber' | 'status' | 'submittedAt'>) => string;
  reviewAdmissionApplication: (
    appId: string,
    status: ApplicationStatus,
    remarks: string,
    reviewerName: string,
    assignedClassGroupId?: string,
    academicYear?: string
  ) => { success: boolean; error?: string };
  promoteStudent: (
    studentId: string,
    nextSemester: number,
    nextClassGroupId: string,
    academicYear: string,
    adminName: string
  ) => { success: boolean; error?: string };
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentStatus, remarks: string, adminName: string) => void;
  // Master data
  departments: Department[];
  courses: Course[];
  classGroups: ClassGroup[];
  subjects: Subject[];
  facultyProfiles: FacultyProfile[];
  studentProfiles: StudentProfile[];
  facultyAssignments: FacultyAssignment[];
  classrooms: Classroom[];
  timetable: TimetableEntry[];
  users: User[];

  // Attendance
  classSessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  correctionRequests: AttendanceCorrectionRequest[];
  riskSettings: AttendanceRiskSettings;
  calculateStudentAttendance: (studentId: string) => StudentAttendanceSummary;
  recordAttendance: (
    sessionData: Omit<ClassSession, 'id' | 'markedAt'>,
    records: { studentId: string; status: AttendanceStatus; remarks?: string }[],
    actorName: string
  ) => string;
  submitAttendanceCorrection: (
    req: {
      studentId: string;
      sessionId: string;
      subjectId: string;
      sessionDate: string;
      originalStatus: AttendanceStatus;
      requestedStatus: AttendanceStatus;
      reason: string;
      evidenceNote?: string;
    }
  ) => void;
  reviewAttendanceCorrection: (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewRemarks: string,
    reviewerName: string,
    reviewerRole: 'FACULTY' | 'ADMIN'
  ) => void;

  // Exams & Marks
  exams: Exam[];
  studentMarks: StudentMark[];
  gradeRules: GradeRule[];
  semesterResults: SemesterResult[];
  arrearRecords: ArrearRecord[];
  updateStudentMark: (
    markId: string,
    marksObtained: number | undefined,
    status: MarksStatus,
    facultyId: string
  ) => { success: boolean; error?: string };
  checkExamPublicationEligibility: (examId: string) => {
    eligible: boolean;
    pendingCount: number;
    issues: string[];
    totalRecords: number;
  };
  publishExamResults: (examId: string, publisherName: string) => { success: boolean; error?: string };

  // Timetable
  checkTimetableClash: (
    entry: Omit<TimetableEntry, 'id'>,
    ignoreId?: string
  ) => { hasConflict: boolean; reason?: string };
  saveTimetableEntry: (entry: Omit<TimetableEntry, 'id'> & { id?: string }) => { success: boolean; error?: string };
  deleteTimetableEntry: (id: string) => void;

  // Complaints
  complaints: Complaint[];
  submitComplaint: (
    complaint: Omit<Complaint, 'id' | 'ticketNumber' | 'officialPriority' | 'status' | 'submittedAt' | 'updatedAt' | 'timeline'>
  ) => string;
  updateComplaintStatus: (
    complaintId: string,
    status: ComplaintStatus,
    changedBy: string,
    notes?: string,
    rejectionReason?: string
  ) => void;
  updateComplaintPriority: (complaintId: string, newPriority: ComplaintPriority, changedBy: string, notes?: string) => void;
  assignComplaint: (complaintId: string, facultyId: string, assignedByName: string) => void;

  // Accounts
  toggleUserStatus: (userId: string, adminName: string) => void;
  inviteUser: (role: 'FACULTY' | 'STUDENT', email: string, name: string, adminName: string) => { token: string };

  // Announcements & Notifications
  announcements: Announcement[];
  publishAnnouncement: (announcement: Omit<Announcement, 'id' | 'publishedAt'>) => void;
  notifications: InAppNotification[];
  addNotification: (
    recipientUserId: string,
    title: string,
    message: string,
    category: NotificationCategory,
    referenceId?: string
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;

  // Audit Logs & Settings
  auditLogs: AuditLog[];
  updateRiskSettings: (settings: AttendanceRiskSettings, adminName: string) => void;
  resetToDefaultData: () => void;
}

const STORAGE_PREFIX = 'smart_campus_erp_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.warn(`Failed to parse storage key: ${key}`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save storage key: ${key}`, e);
  }
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with persistence
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>(() => loadFromStorage('students', INITIAL_STUDENT_PROFILES));
  const [facultyProfiles] = useState<FacultyProfile[]>(() => loadFromStorage('faculty', INITIAL_FACULTY_PROFILES));
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [courses] = useState<Course[]>(INITIAL_COURSES);
  const [classGroups] = useState<ClassGroup[]>(INITIAL_CLASS_GROUPS);
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [facultyAssignments] = useState<FacultyAssignment[]>(INITIAL_FACULTY_ASSIGNMENTS);
  const [classrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => loadFromStorage('timetable', INITIAL_TIMETABLE));

  const [classSessions, setClassSessions] = useState<ClassSession[]>(() => loadFromStorage('class_sessions', INITIAL_CLASS_SESSIONS));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadFromStorage('attendance_records', INITIAL_ATTENDANCE_RECORDS));
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>(() => loadFromStorage('correction_requests', INITIAL_CORRECTION_REQUESTS));
  const [riskSettings, setRiskSettings] = useState<AttendanceRiskSettings>(() => loadFromStorage('risk_settings', INITIAL_RISK_SETTINGS));

  const [exams, setExams] = useState<Exam[]>(() => loadFromStorage('exams', INITIAL_EXAMS));
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>(() => loadFromStorage('student_marks', INITIAL_STUDENT_MARKS));
  const [gradeRules] = useState<GradeRule[]>(INITIAL_GRADE_RULES);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>(() => loadFromStorage('semester_results', INITIAL_SEMESTER_RESULTS));
  const [arrearRecords] = useState<ArrearRecord[]>(INITIAL_ARREAR_RECORDS);

  const [complaints, setComplaints] = useState<Complaint[]>(() => loadFromStorage('complaints', INITIAL_COMPLAINTS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('announcements', INITIAL_ANNOUNCEMENTS));
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS));
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>(() => loadFromStorage('enrollments', INITIAL_STUDENT_ENROLLMENTS));
  const [admissionApplications, setAdmissionApplications] = useState<AdmissionApplication[]>(() => loadFromStorage('admission_applications', INITIAL_ADMISSION_APPLICATIONS));

  // Sync state changes to storage
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('students', studentProfiles), [studentProfiles]);
  useEffect(() => saveToStorage('timetable', timetable), [timetable]);
  useEffect(() => saveToStorage('class_sessions', classSessions), [classSessions]);
  useEffect(() => saveToStorage('attendance_records', attendanceRecords), [attendanceRecords]);
  useEffect(() => saveToStorage('correction_requests', correctionRequests), [correctionRequests]);
  useEffect(() => saveToStorage('risk_settings', riskSettings), [riskSettings]);
  useEffect(() => saveToStorage('exams', exams), [exams]);
  useEffect(() => saveToStorage('student_marks', studentMarks), [studentMarks]);
  useEffect(() => saveToStorage('semester_results', semesterResults), [semesterResults]);
  useEffect(() => saveToStorage('complaints', complaints), [complaints]);
  useEffect(() => saveToStorage('announcements', announcements), [announcements]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('enrollments', enrollments), [enrollments]);
  useEffect(() => saveToStorage('admission_applications', admissionApplications), [admissionApplications]);

  // Helper: Log audit action
  const addAuditLog = (
    actorName: string,
    actorRole: 'ADMIN' | 'FACULTY' | 'STUDENT',
    action: string,
    entityType: 'ATTENDANCE' | 'MARKS' | 'EXAM' | 'USER_ACCOUNT' | 'TIMETABLE' | 'COMPLAINT' | 'SETTINGS' | 'ENROLLMENT',
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorUserId: 'system',
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper: Send persistent notification (with duplicate prevention)
  const addNotification = (
    recipientUserId: string,
    title: string,
    message: string,
    category: InAppNotification['category'],
    referenceId?: string
  ) => {
    // Duplicate check within 5 minutes for identical reference
    setNotifications((prev) => {
      const exists = prev.some(
        (n) =>
          n.recipientUserId === recipientUserId &&
          n.category === category &&
          n.referenceId === referenceId &&
          Date.now() - new Date(n.createdAt).getTime() < 300000
      );
      if (exists) return prev;

      const newNotif: InAppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        recipientUserId,
        title,
        message,
        category,
        referenceId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      return [newNotif, ...prev];
    });
  };

  // 1. ATTENDANCE CALCULATION & RISK ENGINE
  const calculateStudentAttendance = (studentId: string): StudentAttendanceSummary => {
    // Find all attendance records for this student
    const studentRecords = attendanceRecords.filter((r) => r.studentId === studentId);
    const sessionMap = new Map<string, ClassSession>(classSessions.map((s) => [s.id, s]));

    let totalClasses = 0;
    let attendedClasses = 0;
    let recentAbsenceCount = 0;

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - riskSettings.recentAbsenceTrendDays);

    const subjectStats = new Map<
      string,
      { total: number; attended: number; subjectCode: string; subjectName: string }
    >();

    // Initialize subjects for this semester (Sem 5)
    subjects
      .filter((s) => s.semester === 5)
      .forEach((s) => {
        subjectStats.set(s.id, { total: 0, attended: 0, subjectCode: s.code, subjectName: s.name });
      });

    studentRecords.forEach((rec) => {
      const session = sessionMap.get(rec.sessionId);
      if (!session) return;

      totalClasses += 1;
      const isAttended = rec.status === 'PRESENT' || rec.status === 'LATE' || rec.status === 'ON_DUTY';
      if (isAttended) {
        attendedClasses += 1;
      }

      // Check recent absence trend
      const sessionDate = new Date(session.date);
      if (sessionDate >= fourteenDaysAgo && rec.status === 'ABSENT') {
        recentAbsenceCount += 1;
      }

      // Update subject-wise
      const current = subjectStats.get(session.subjectId) || {
        total: 0,
        attended: 0,
        subjectCode: session.subjectId,
        subjectName: session.subjectId,
      };
      current.total += 1;
      if (isAttended) current.attended += 1;
      subjectStats.set(session.subjectId, current);
    });

    const overallPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 1000) / 10 : 100;

    // Risk level classification based on configurable rules (D-6)
    let riskLevel: AttendanceRiskLevel = 'LOW';
    if (overallPercentage < riskSettings.highRiskThreshold || recentAbsenceCount >= riskSettings.warningConsecutiveAbsences) {
      riskLevel = 'HIGH';
    } else if (overallPercentage < riskSettings.mediumRiskThreshold || recentAbsenceCount >= 2) {
      riskLevel = 'MEDIUM';
    }

    const subjectWise = Array.from(subjectStats.entries()).map(([subId, stat]) => {
      const pct = stat.total > 0 ? Math.round((stat.attended / stat.total) * 1000) / 10 : 100;
      let subRisk: AttendanceRiskLevel = 'LOW';
      if (pct < riskSettings.highRiskThreshold) subRisk = 'HIGH';
      else if (pct < riskSettings.mediumRiskThreshold) subRisk = 'MEDIUM';

      return {
        subjectId: subId,
        subjectCode: stat.subjectCode,
        subjectName: stat.subjectName,
        total: stat.total,
        attended: stat.attended,
        percentage: pct,
        riskLevel: subRisk,
      };
    });

    return {
      studentId,
      overallPercentage,
      totalClasses,
      attendedClasses,
      riskLevel,
      recentAbsenceCount,
      subjectWise,
    };
  };

  // 2. RECORD ATTENDANCE
  const recordAttendance = (
    sessionData: Omit<ClassSession, 'id' | 'markedAt'>,
    records: { studentId: string; status: AttendanceStatus; remarks?: string }[],
    actorName: string
  ): string => {
    const sessionId = `sess-${Date.now()}`;
    const newSession: ClassSession = {
      ...sessionData,
      id: sessionId,
      markedAt: new Date().toISOString(),
    };

    const newRecords: AttendanceRecord[] = records.map((r, i) => ({
      id: `att-${Date.now()}-${i}`,
      sessionId,
      studentId: r.studentId,
      status: r.status,
      remarks: r.remarks,
    }));

    setClassSessions((prev) => [newSession, ...prev]);
    setAttendanceRecords((prev) => [...prev, ...newRecords]);

    const subject = subjects.find((s) => s.id === sessionData.subjectId);
    addAuditLog(
      actorName,
      'FACULTY',
      'RECORD_ATTENDANCE',
      'ATTENDANCE',
      sessionId,
      `Recorded attendance for ${subject?.name || sessionData.subjectId} (${records.length} students).`
    );

    // Notify any student marked absent
    records.forEach((r) => {
      if (r.status === 'ABSENT') {
        const student = studentProfiles.find((s) => s.id === r.studentId);
        if (student) {
          addNotification(
            student.userId,
            'Marked Absent in Class',
            `You were recorded absent for ${subject?.code || 'class'} on ${sessionData.date}. Check portal if you require a correction.`,
            'ATTENDANCE_WARNING',
            sessionId
          );
        }
      }
    });

    return sessionId;
  };

  // 3. ATTENDANCE CORRECTION REQUESTS (7-day rule, D-1)
  const submitAttendanceCorrection = (req: {
    studentId: string;
    sessionId: string;
    subjectId: string;
    sessionDate: string;
    originalStatus: AttendanceStatus;
    requestedStatus: AttendanceStatus;
    reason: string;
    evidenceNote?: string;
  }) => {
    // 7-day window rule based on class session date (Decision D-1)
    const sessionDate = new Date(req.sessionDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - sessionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isEligibleForFaculty = diffDays <= 7;

    const newReq: AttendanceCorrectionRequest = {
      id: `req-att-${Date.now()}`,
      ...req,
      status: isEligibleForFaculty ? 'PENDING_FACULTY' : 'PENDING_ADMIN',
      isEligibleForFaculty,
      submittedAt: new Date().toISOString(),
    };

    setCorrectionRequests((prev) => [newReq, ...prev]);

    const student = studentProfiles.find((s) => s.id === req.studentId);
    const studentUser = users.find((u) => u.id === student?.userId);

    // Notify reviewer
    if (isEligibleForFaculty) {
      // Find faculty assigned to this subject
      const assignment = facultyAssignments.find((fa) => fa.subjectId === req.subjectId);
      const faculty = facultyProfiles.find((f) => f.id === assignment?.facultyId);
      if (faculty) {
        addNotification(
          faculty.userId,
          'New Attendance Correction Request',
          `${student?.fullName} (${student?.registerNumber}) requested correction for session on ${req.sessionDate} within the 7-day window.`,
          'CORRECTION_STATUS',
          newReq.id
        );
      }
    } else {
      // Route to admin
      const admin = users.find((u) => u.role === 'ADMIN');
      if (admin) {
        addNotification(
          admin.id,
          'Late Attendance Correction Escalation',
          `${student?.fullName} submitted a late correction request (>7 days) for session on ${req.sessionDate}. Requires Administrator review.`,
          'CORRECTION_STATUS',
          newReq.id
        );
      }
    }

    addAuditLog(
      student?.fullName || 'Student',
      'STUDENT',
      'SUBMIT_CORRECTION_REQUEST',
      'ATTENDANCE',
      newReq.id,
      `Submitted correction for ${req.sessionDate} (${isEligibleForFaculty ? 'Faculty 7-Day Window' : 'Escalated to Admin'}).`
    );
  };

  const reviewAttendanceCorrection = (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewRemarks: string,
    reviewerName: string,
    reviewerRole: 'FACULTY' | 'ADMIN'
  ) => {
    const target = correctionRequests.find((r) => r.id === requestId);
    if (!target) return;

    setCorrectionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              reviewedBy: reviewerName,
              reviewerRole,
              reviewedAt: new Date().toISOString(),
              reviewRemarks,
            }
          : r
      )
    );

    // If approved, update official attendance record
    if (status === 'APPROVED') {
      setAttendanceRecords((prev) =>
        prev.map((ar) =>
          ar.sessionId === target.sessionId && ar.studentId === target.studentId
            ? { ...ar, status: target.requestedStatus, remarks: `Corrected: ${reviewRemarks}` }
            : ar
        )
      );
    }

    // Notify student
    const student = studentProfiles.find((s) => s.id === target.studentId);
    if (student) {
      addNotification(
        student.userId,
        status === 'APPROVED' ? 'Attendance Correction Approved' : 'Attendance Correction Rejected',
        `Your request for ${target.sessionDate} was ${status.toLowerCase()} by ${reviewerName}. Note: ${reviewRemarks}`,
        'CORRECTION_STATUS',
        target.id
      );
    }

    addAuditLog(
      reviewerName,
      reviewerRole,
      status === 'APPROVED' ? 'APPROVE_ATTENDANCE_CORRECTION' : 'REJECT_ATTENDANCE_CORRECTION',
      'ATTENDANCE',
      target.id,
      `${status} attendance correction for ${student?.fullName || target.studentId}. Reason: ${reviewRemarks}`
    );
  };

  // 4. EXAMINATION & MARKS ENTRY
  const updateStudentMark = (
    markId: string,
    marksObtained: number | undefined,
    status: MarksStatus,
    facultyId: string
  ): { success: boolean; error?: string } => {
    const existing = studentMarks.find((m) => m.id === markId);
    if (!existing) return { success: false, error: 'Mark entry not found' };

    const subject = subjects.find((s) => s.id === existing.subjectId);
    const maxMarks = subject?.maxMarks || 100;
    const passMarks = subject?.passMarks || 45;

    if (marksObtained !== undefined) {
      if (marksObtained < 0 || marksObtained > maxMarks) {
        return { success: false, error: `Marks must be between 0 and ${maxMarks}` };
      }
    }

    let grade: string | undefined = undefined;
    let gradePoint: number | undefined = undefined;
    let isPassed = false;

    if (status === 'MARKS_ENTERED' && marksObtained !== undefined) {
      const percentage = (marksObtained / maxMarks) * 100;
      const matchedRule = gradeRules.find((r) => percentage >= r.minPercentage && percentage <= r.maxPercentage);
      if (matchedRule) {
        grade = matchedRule.grade;
        gradePoint = matchedRule.gradePoint;
        isPassed = marksObtained >= passMarks && matchedRule.grade !== 'RA';
      }
    } else if (status === 'ABSENT' || status === 'MEDICAL_ABSENCE') {
      grade = 'RA';
      gradePoint = 0;
      isPassed = false;
    }

    setStudentMarks((prev) =>
      prev.map((m) =>
        m.id === markId
          ? {
              ...m,
              marksObtained: status === 'MARKS_ENTERED' ? marksObtained : undefined,
              status,
              grade,
              gradePoint,
              isPassed,
              lastUpdated: new Date().toISOString(),
            }
          : m
      )
    );

    const faculty = facultyProfiles.find((f) => f.id === facultyId);
    addAuditLog(
      faculty?.fullName || 'Faculty',
      'FACULTY',
      'UPDATE_MARKS',
      'MARKS',
      markId,
      `Updated mark status to ${status} (Score: ${marksObtained ?? 'N/A'}) for subject ${subject?.code}.`
    );

    return { success: true };
  };

  // 5. RESULT PUBLICATION CHECK & PUBLICATION (Strict requirements)
  const checkExamPublicationEligibility = (
    examId: string
  ): { eligible: boolean; pendingCount: number; issues: string[]; totalRecords: number } => {
    const records = studentMarks.filter((m) => m.examId === examId);
    const issues: string[] = [];

    if (records.length === 0) {
      return { eligible: false, pendingCount: 0, issues: ['No marks recorded for this examination.'], totalRecords: 0 };
    }

    const pending = records.filter((m) => m.status === 'MARKS_PENDING');
    if (pending.length > 0) {
      issues.push(`${pending.length} student mark(s) are in 'MARKS_PENDING' status. All records must have an explicit resolved status.`);
    }

    const unenteredWithNoStatus = records.filter(
      (m) => m.status === 'MARKS_ENTERED' && m.marksObtained === undefined
    );
    if (unenteredWithNoStatus.length > 0) {
      issues.push(`${unenteredWithNoStatus.length} mark(s) marked as 'MARKS_ENTERED' have missing numerical scores.`);
    }

    return {
      eligible: issues.length === 0,
      pendingCount: pending.length,
      issues,
      totalRecords: records.length,
    };
  };

  const publishExamResults = (examId: string, publisherName: string): { success: boolean; error?: string } => {
    const eligibility = checkExamPublicationEligibility(examId);
    if (!eligibility.eligible) {
      return { success: false, error: eligibility.issues.join(' ') };
    }

    const exam = exams.find((e) => e.id === examId);
    if (!exam) return { success: false, error: 'Exam not found' };

    // Compute semester GPA and CGPA for each student in this exam
    const marksForExam = studentMarks.filter((m) => m.examId === examId);
    const studentIds = Array.from(new Set(marksForExam.map((m) => m.studentId)));

    const newResults: SemesterResult[] = studentIds.map((stuId) => {
      const studentSubMarks = marksForExam.filter((m) => m.studentId === stuId);
      let totalCredits = 0;
      let earnedCredits = 0;
      let totalWeightedPoints = 0;
      let hasArrear = false;

      const subjectResults = studentSubMarks.map((sm) => {
        const sub = subjects.find((s) => s.id === sm.subjectId);
        const credits = sub?.credits || 3;
        totalCredits += credits;

        if (sm.isPassed && sm.gradePoint !== undefined) {
          earnedCredits += credits;
          totalWeightedPoints += credits * sm.gradePoint;
        } else {
          hasArrear = true;
        }

        return {
          subjectId: sm.subjectId,
          subjectCode: sub?.code || 'SUB',
          subjectName: sub?.name || 'Subject',
          credits,
          maxMarks: sub?.maxMarks || 100,
          marksObtained: sm.marksObtained,
          status: sm.status,
          grade: sm.grade,
          gradePoint: sm.gradePoint,
          isPassed: !!sm.isPassed,
        };
      });

      const gpa = totalCredits > 0 ? Math.round((totalWeightedPoints / totalCredits) * 100) / 100 : 0;
      const prevResult = semesterResults.find((r) => r.studentId === stuId);
      const overallCGPA = prevResult ? Math.round(((prevResult.overallCGPA + gpa) / 2) * 100) / 100 : gpa;

      return {
        studentId: stuId,
        examId,
        semester: exam.semester,
        academicYear: exam.academicYear,
        subjectResults,
        totalCredits,
        earnedCredits,
        semesterGPA: gpa,
        overallCGPA,
        overallResult: hasArrear ? 'ARREAR' : 'PASS',
        publishedAt: new Date().toISOString(),
      };
    });

    // Update exam status
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? { ...e, status: 'PUBLISHED', publishedAt: new Date().toISOString(), publishedBy: publisherName }
          : e
      )
    );

    // Replace or add semester results
    setSemesterResults((prev) => {
      const filtered = prev.filter((r) => r.examId !== examId);
      return [...filtered, ...newResults];
    });

    // Notify all students
    studentIds.forEach((stuId) => {
      const student = studentProfiles.find((s) => s.id === stuId);
      if (student) {
        addNotification(
          student.userId,
          'Examination Results Published',
          `Official results for ${exam.name} have been published. Download your verified transcript from the portal.`,
          'RESULT_PUBLISHED',
          examId
        );
      }
    });

    addAuditLog(
      publisherName,
      'ADMIN',
      'PUBLISH_RESULTS',
      'EXAM',
      examId,
      `Published official results for ${exam.name} (${studentIds.length} students processed).`
    );

    return { success: true };
  };

  // 6. TIMETABLE CONFLICT CHECKING ENGINE
  const checkTimetableClash = (
    entry: Omit<TimetableEntry, 'id'>,
    ignoreId?: string
  ): { hasConflict: boolean; reason?: string } => {
    for (const item of timetable) {
      if (ignoreId && item.id === ignoreId) continue;
      if (item.dayOfWeek !== entry.dayOfWeek || item.period !== entry.period) continue;

      // Check faculty clash
      if (item.facultyId === entry.facultyId) {
        const fac = facultyProfiles.find((f) => f.id === entry.facultyId);
        return {
          hasConflict: true,
          reason: `Faculty Conflict: ${fac?.fullName || 'Faculty'} is already scheduled to teach in Period ${entry.period} on ${entry.dayOfWeek}.`,
        };
      }

      // Check classroom clash
      if (item.classroomId === entry.classroomId) {
        const room = classrooms.find((r) => r.id === entry.classroomId);
        return {
          hasConflict: true,
          reason: `Classroom Conflict: Room ${room?.roomNumber || 'Room'} is already booked for another session in Period ${entry.period} on ${entry.dayOfWeek}.`,
        };
      }

      // Check class group clash
      if (item.classGroupId === entry.classGroupId) {
        const cg = classGroups.find((g) => g.id === entry.classGroupId);
        return {
          hasConflict: true,
          reason: `Student Group Clash: ${cg?.name || 'Class Group'} already has a scheduled class in Period ${entry.period} on ${entry.dayOfWeek}.`,
        };
      }
    }

    return { hasConflict: false };
  };

  const saveTimetableEntry = (
    entry: Omit<TimetableEntry, 'id'> & { id?: string }
  ): { success: boolean; error?: string } => {
    const clash = checkTimetableClash(entry, entry.id);
    if (clash.hasConflict) {
      return { success: false, error: clash.reason };
    }

    if (entry.id) {
      setTimetable((prev) => prev.map((t) => (t.id === entry.id ? { ...entry, id: entry.id! } : t)));
    } else {
      const newEntry: TimetableEntry = {
        ...entry,
        id: `tt-${Date.now()}`,
      };
      setTimetable((prev) => [...prev, newEntry]);
    }

    addAuditLog('Administrator', 'ADMIN', 'MODIFY_TIMETABLE', 'TIMETABLE', entry.id || 'new', `Updated timetable slot for ${entry.dayOfWeek} Period ${entry.period}.`);

    return { success: true };
  };

  const deleteTimetableEntry = (id: string) => {
    setTimetable((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('Administrator', 'ADMIN', 'DELETE_TIMETABLE_SLOT', 'TIMETABLE', id, 'Removed scheduled session from timetable.');
  };

  // 7. COMPLAINTS WORKFLOW
  const submitComplaint = (
    compData: Omit<Complaint, 'id' | 'ticketNumber' | 'officialPriority' | 'status' | 'submittedAt' | 'updatedAt' | 'timeline'>
  ): string => {
    const ticketNumber = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const compId = `cmp-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newComplaint: Complaint = {
      ...compData,
      id: compId,
      ticketNumber,
      officialPriority: compData.requestedPriority, // Initially matches requested until Admin confirms/changes (D-2/D-5)
      status: 'SUBMITTED',
      submittedAt: timestamp,
      updatedAt: timestamp,
      timeline: [{ status: 'SUBMITTED', timestamp, changedBy: compData.submitterName, notes: 'Complaint registered in system.' }],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Notify submitter of confirmation
    addNotification(
      compData.submittedByUserId,
      'Complaint Registered Successfully',
      `Your ticket ${ticketNumber} (${compData.category}) has been submitted and assigned to administrative review.`,
      'COMPLAINT_UPDATE',
      compId
    );

    addAuditLog(compData.submitterName, compData.submitterRole, 'SUBMIT_COMPLAINT', 'COMPLAINT', compId, `Filed complaint ${ticketNumber} with priority ${compData.requestedPriority}.`);

    return compId;
  };

  const updateComplaintStatus = (
    complaintId: string,
    status: ComplaintStatus,
    changedBy: string,
    notes?: string,
    rejectionReason?: string
  ) => {
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const timestamp = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status,
          updatedAt: timestamp,
          resolutionNotes: status === 'RESOLVED' ? notes : c.resolutionNotes,
          rejectionReason: status === 'REJECTED' ? rejectionReason : c.rejectionReason,
          timeline: [
            ...c.timeline,
            { status, timestamp, changedBy, notes: status === 'REJECTED' ? rejectionReason : notes },
          ],
        };
      })
    );

    addNotification(
      target.submittedByUserId,
      `Complaint ${target.ticketNumber} Updated: ${status.replace('_', ' ')}`,
      status === 'REJECTED'
        ? `Reason: ${rejectionReason || 'Does not meet criteria'}`
        : notes || `Status changed to ${status}`,
      'COMPLAINT_UPDATE',
      complaintId
    );

    addAuditLog(changedBy, 'ADMIN', 'UPDATE_COMPLAINT_STATUS', 'COMPLAINT', complaintId, `Changed ticket ${target.ticketNumber} status to ${status}.`);
  };

  const updateComplaintPriority = (complaintId: string, newPriority: ComplaintPriority, changedBy: string, notes?: string) => {
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, officialPriority: newPriority, updatedAt: new Date().toISOString() } : c))
    );

    addAuditLog(changedBy, 'ADMIN', 'UPDATE_COMPLAINT_PRIORITY', 'COMPLAINT', complaintId, `Adjusted ticket ${target.ticketNumber} priority to ${newPriority}. Note: ${notes || 'Administrative review'}`);
  };

  const assignComplaint = (complaintId: string, facultyId: string, assignedByName: string) => {
    const target = complaints.find((c) => c.id === complaintId);
    const faculty = facultyProfiles.find((f) => f.id === facultyId);
    if (!target || !faculty) return;

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              assignedToFacultyId: facultyId,
              assignedFacultyName: faculty.fullName,
              status: c.status === 'SUBMITTED' ? 'UNDER_REVIEW' : c.status,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...c.timeline,
                {
                  status: 'UNDER_REVIEW',
                  timestamp: new Date().toISOString(),
                  changedBy: assignedByName,
                  notes: `Assigned to ${faculty.fullName} (${faculty.designation})`,
                },
              ],
            }
          : c
      )
    );

    // Notify assigned faculty
    addNotification(
      faculty.userId,
      'Complaint Ticket Assigned to You',
      `Ticket ${target.ticketNumber} (${target.title}) has been assigned for your investigation.`,
      'COMPLAINT_UPDATE',
      complaintId
    );

    addAuditLog(assignedByName, 'ADMIN', 'ASSIGN_COMPLAINT', 'COMPLAINT', complaintId, `Assigned ticket ${target.ticketNumber} to ${faculty.fullName}.`);
  };

  // 8. USER ACCOUNTS & INVITATIONS
  const toggleUserStatus = (userId: string, adminName: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        addAuditLog(adminName, 'ADMIN', 'TOGGLE_USER_STATUS', 'USER_ACCOUNT', userId, `Changed account status to ${newStatus}. Academic records preserved.`);
        return { ...u, status: newStatus };
      })
    );
  };

  const inviteUser = (role: 'FACULTY' | 'STUDENT', email: string, name: string, adminName: string): { token: string } => {
    const token = `inv-tok-${Math.random().toString(36).substring(2, 10)}`;
    const newUserId = `usr-${role.toLowerCase()}-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      loginId: email.split('@')[0],
      email,
      role,
      status: 'PENDING_SETUP',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    addAuditLog(adminName, 'ADMIN', 'INVITE_USER', 'USER_ACCOUNT', newUserId, `Sent single-use activation invitation token to ${email} for role ${role}.`);

    return { token };
  };

  // 9. ANNOUNCEMENTS
  const publishAnnouncement = (annData: Omit<Announcement, 'id' | 'publishedAt'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `anc-${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    // Dispatch in-app notification according to scope
    users.forEach((u) => {
      addNotification(
        u.id,
        `New Announcement: ${annData.title}`,
        annData.content.substring(0, 120) + '...',
        'GENERAL_ANNOUNCEMENT',
        newAnn.id
      );
    });

    addAuditLog(annData.authorName, 'ADMIN', 'PUBLISH_ANNOUNCEMENT', 'SETTINGS', newAnn.id, `Published ${annData.scope} announcement: ${annData.title}`);
  };

  // 10. NOTIFICATIONS READ/UNREAD
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = (userId: string) => {
    setNotifications((prev) => prev.map((n) => (n.recipientUserId === userId ? { ...n, isRead: true } : n)));
  };

  // 11. RISK SETTINGS
  const updateRiskSettings = (settings: AttendanceRiskSettings, adminName: string) => {
    setRiskSettings(settings);
    addAuditLog(adminName, 'ADMIN', 'UPDATE_RISK_SETTINGS', 'SETTINGS', 'risk_settings', `Updated thresholds: High Risk <${settings.highRiskThreshold}%, Medium <${settings.mediumRiskThreshold}%.`);
  };

  // 12. ENROLLMENT & ADMISSIONS WORKFLOW (Section 7.2 student_enrollments)
  const submitAdmissionApplication = (
    appData: Omit<AdmissionApplication, 'id' | 'applicationNumber' | 'status' | 'submittedAt'>
  ): string => {
    const appId = `app-${Date.now()}`;
    const applicationNumber = `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: AdmissionApplication = {
      ...appData,
      id: appId,
      applicationNumber,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    };

    setAdmissionApplications((prev) => [newApp, ...prev]);

    // Notify Administrator of new registration
    const admin = users.find((u) => u.role === 'ADMIN');
    if (admin) {
      addNotification(
        admin.id,
        'New Admission Application Received',
        `Candidate ${appData.applicantName} submitted admission application (${applicationNumber}) for ${appData.academicYear}.`,
        'GENERAL_ANNOUNCEMENT',
        appId
      );
    }

    addAuditLog(
      'Applicant Online Portal',
      'STUDENT',
      'SUBMIT_ADMISSION_APPLICATION',
      'ENROLLMENT',
      appId,
      `Submitted application ${applicationNumber} for ${appData.applicantName} (${appData.previousQualification}).`
    );

    return appId;
  };

  const reviewAdmissionApplication = (
    appId: string,
    status: ApplicationStatus,
    remarks: string,
    reviewerName: string,
    assignedClassGroupId?: string,
    academicYear?: string
  ): { success: boolean; error?: string } => {
    const app = admissionApplications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application record not found.' };

    let generatedRegisterNumber: string | undefined = undefined;

    if (status === 'APPROVED') {
      if (!assignedClassGroupId) {
        return { success: false, error: 'Assigning a class section is required upon approving admission.' };
      }

      // Generate next register number
      const nextNum = 100 + studentProfiles.length + 1;
      const dept = departments.find((d) => d.id === app.departmentId);
      const deptCode = dept?.code || 'CS';
      generatedRegisterNumber = `22${deptCode}${nextNum}`;

      // Create new user account for student
      const newUserId = `usr-stu-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        loginId: generatedRegisterNumber.toLowerCase(),
        email: app.email,
        role: 'STUDENT',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      // Create student profile
      const newStudentProfile: StudentProfile = {
        id: `stu-${Date.now()}`,
        userId: newUserId,
        registerNumber: generatedRegisterNumber,
        fullName: app.applicantName,
        departmentId: app.departmentId,
        courseId: app.courseId,
        currentSemester: app.appliedSemester || 1,
        academicYear: academicYear || app.academicYear || ACADEMIC_CALENDAR.academicYear,
        email: app.email,
        phone: app.phone,
        dateOfBirth: app.dateOfBirth,
        classGroupId: assignedClassGroupId,
      };

      // Create official active enrollment record
      const crs = courses.find((c) => c.id === app.courseId);
      const grp = classGroups.find((g) => g.id === assignedClassGroupId);

      const newEnrollment: StudentEnrollment = {
        id: `enr-${Date.now()}`,
        studentId: newStudentProfile.id,
        registerNumber: generatedRegisterNumber,
        studentName: app.applicantName,
        courseId: app.courseId,
        courseName: crs?.name || 'Undergraduate Programme',
        departmentId: app.departmentId,
        departmentCode: deptCode,
        academicYear: academicYear || app.academicYear || ACADEMIC_CALENDAR.academicYear,
        semester: app.appliedSemester || 1,
        classGroupId: assignedClassGroupId,
        classGroupName: grp?.name || 'Class Section A',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        creditsRegistered: 18,
        remarks: `Admitted via Application ${app.applicationNumber}`,
      };

      setUsers((prev) => [...prev, newUser]);
      setStudentProfiles((prev) => [...prev, newStudentProfile]);
      setEnrollments((prev) => [newEnrollment, ...prev]);

      addNotification(
        newUserId,
        'Welcome to Smart Campus - Enrolment Confirmed',
        `Your admission has been approved with Register Number ${generatedRegisterNumber} in class group ${grp?.name}.`,
        'GENERAL_ANNOUNCEMENT',
        newEnrollment.id
      );

      addAuditLog(
        reviewerName,
        'ADMIN',
        'APPROVE_ADMISSION_ENROLLMENT',
        'ENROLLMENT',
        appId,
        `Approved admission for ${app.applicantName}. Registered ${generatedRegisterNumber} in ${grp?.name}.`
      );
    } else {
      addAuditLog(
        reviewerName,
        'ADMIN',
        status === 'REJECTED' ? 'REJECT_ADMISSION_APPLICATION' : 'REVIEW_ADMISSION_APPLICATION',
        'ENROLLMENT',
        appId,
        `Updated application ${app.applicationNumber} to ${status}. Remarks: ${remarks}`
      );
    }

    setAdmissionApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status,
              reviewRemarks: remarks,
              reviewedBy: reviewerName,
              reviewedAt: new Date().toISOString(),
              assignedClassGroupId: assignedClassGroupId || a.assignedClassGroupId,
              generatedRegisterNumber: generatedRegisterNumber || a.generatedRegisterNumber,
            }
          : a
      )
    );

    return { success: true };
  };

  const promoteStudent = (
    studentId: string,
    nextSemester: number,
    nextClassGroupId: string,
    academicYear: string,
    adminName: string
  ): { success: boolean; error?: string } => {
    const student = studentProfiles.find((s) => s.id === studentId);
    if (!student) return { success: false, error: 'Student profile not found.' };

    const crs = courses.find((c) => c.id === student.courseId);
    const dept = departments.find((d) => d.id === student.departmentId);
    const nextGroup = classGroups.find((g) => g.id === nextClassGroupId);

    // 1. Mark existing active enrollment as PROMOTED
    setEnrollments((prev) =>
      prev.map((enr) =>
        enr.studentId === studentId && enr.status === 'ACTIVE'
          ? { ...enr, status: 'PROMOTED', remarks: `Promoted to Semester ${nextSemester} on ${new Date().toLocaleDateString()}` }
          : enr
      )
    );

    // 2. Create new active enrollment record for next term
    const newEnrollment: StudentEnrollment = {
      id: `enr-${Date.now()}`,
      studentId,
      registerNumber: student.registerNumber,
      studentName: student.fullName,
      courseId: student.courseId,
      courseName: crs?.name || 'Degree Programme',
      departmentId: student.departmentId,
      departmentCode: dept?.code || 'CS',
      academicYear,
      semester: nextSemester,
      classGroupId: nextClassGroupId,
      classGroupName: nextGroup?.name || `Semester ${nextSemester}`,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      creditsRegistered: 18,
      remarks: `Promoted from Semester ${student.currentSemester}`,
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);

    // 3. Update student profile current semester and class group
    setStudentProfiles((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              currentSemester: nextSemester,
              academicYear,
              classGroupId: nextClassGroupId,
            }
          : s
      )
    );

    addNotification(
      student.userId,
      `Semester Progression: Promoted to Semester ${nextSemester}`,
      `You have been officially enrolled into Semester ${nextSemester} (${nextGroup?.name}) for AY ${academicYear}.`,
      'GENERAL_ANNOUNCEMENT',
      newEnrollment.id
    );

    addAuditLog(
      adminName,
      'ADMIN',
      'SEMESTER_PROGRESSION_PROMOTION',
      'ENROLLMENT',
      studentId,
      `Promoted ${student.fullName} (${student.registerNumber}) to Semester ${nextSemester} in ${nextGroup?.name}.`
    );

    return { success: true };
  };

  const updateEnrollmentStatus = (
    enrollmentId: string,
    status: EnrollmentStatus,
    remarks: string,
    adminName: string
  ) => {
    setEnrollments((prev) =>
      prev.map((enr) => (enr.id === enrollmentId ? { ...enr, status, remarks: remarks || enr.remarks } : enr))
    );

    addAuditLog(
      adminName,
      'ADMIN',
      'UPDATE_ENROLLMENT_STATUS',
      'ENROLLMENT',
      enrollmentId,
      `Updated enrollment status to ${status}. Remarks: ${remarks}`
    );
  };

  // 13. RESET DEMO DATA
  const resetToDefaultData = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <ERPContext.Provider
      value={{
        departments,
        courses,
        classGroups,
        subjects,
        facultyProfiles,
        studentProfiles,
        facultyAssignments,
        classrooms,
        timetable,
        users,

        enrollments,
        admissionApplications,
        submitAdmissionApplication,
        reviewAdmissionApplication,
        promoteStudent,
        updateEnrollmentStatus,

        classSessions,
        attendanceRecords,
        correctionRequests,
        riskSettings,
        calculateStudentAttendance,
        recordAttendance,
        submitAttendanceCorrection,
        reviewAttendanceCorrection,

        exams,
        studentMarks,
        gradeRules,
        semesterResults,
        arrearRecords,
        updateStudentMark,
        checkExamPublicationEligibility,
        publishExamResults,

        checkTimetableClash,
        saveTimetableEntry,
        deleteTimetableEntry,

        complaints,
        submitComplaint,
        updateComplaintStatus,
        updateComplaintPriority,
        assignComplaint,

        toggleUserStatus,
        inviteUser,

        announcements,
        publishAnnouncement,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        auditLogs,
        updateRiskSettings,
        resetToDefaultData,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
