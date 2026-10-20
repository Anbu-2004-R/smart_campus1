import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Send,
  Lock,
  Unlock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Exam } from '../../types/erp';

export const ExamPublication: React.FC = () => {
  const {
    exams,
    studentMarks,
    subjects,
    studentProfiles,
    checkExamPublicationEligibility,
    publishExamResults,
  } = useERP();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [integrityReport, setIntegrityReport] = useState<{
    eligible: boolean;
    pendingCount: number;
    issues: string[];
    totalRecords: number;
  } | null>(null);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const marksForExam = studentMarks.filter((m) => m.examId === selectedExamId);

  // Run integrity check
  const handleRunIntegrityCheck = () => {
    const report = checkExamPublicationEligibility(selectedExamId);
    setIntegrityReport(report);
  };

  const handlePublish = () => {
    const res = publishExamResults(selectedExamId, 'Dr. A. K. Sundaram (Registrar)');
    if (res.success) {
      setPublishSuccessMessage(`Official results for "${selectedExam.name}" have been verified, calculated, and published to student portals.`);
      setIntegrityReport(null);
      setIsConfirmModalOpen(false);
    } else {
      alert(`Publication blocked: ${res.error}`);
    }
  };

  // Group marks by student
  const studentRows = studentProfiles.map((stu) => {
    const records = marksForExam.filter((m) => m.studentId === stu.id);
    const hasPending = records.some((m) => m.status === 'MARKS_PENDING');
    const absentCount = records.filter((m) => m.status === 'ABSENT' || m.status === 'MEDICAL_ABSENCE').length;

    return {
      student: stu,
      records,
      hasPending,
      absentCount,
      totalEntered: records.filter((m) => m.status === 'MARKS_ENTERED').length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Examination Marks & Result Publication Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-publication validation gatekeeper. Enforces the strict rule that unresolved pending marks cannot be published or zeroed out.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setIntegrityReport(null);
              setPublishSuccessMessage(null);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} ({exam.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Banner if published */}
      {publishSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-medium">{publishSuccessMessage}</div>
        </div>
      )}

      {/* Exam Status & Publication Gate Controller */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{selectedExam.name}</span>
              <StatusBadge status={selectedExam.status} />
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Code: {selectedExam.code} · AY {selectedExam.academicYear} · Semester {selectedExam.semester}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunIntegrityCheck}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span>Run Integrity Check</span>
            </button>

            {selectedExam.status !== 'PUBLISHED' && (
              <button
                onClick={() => {
                  const report = checkExamPublicationEligibility(selectedExamId);
                  setIntegrityReport(report);
                  if (report.eligible) {
                    setIsConfirmModalOpen(true);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Publish Official Results</span>
              </button>
            )}
          </div>
        </div>

        {/* Integrity Check Results Box */}
        {integrityReport && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
              integrityReport.eligible
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {integrityReport.eligible ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Validation Passed: All {integrityReport.totalRecords} records resolved. Publication is permitted.</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Publication Blocked: Unresolved records detected.</span>
                </>
              )}
            </div>

            {!integrityReport.eligible && (
              <ul className="list-disc list-inside mt-2 space-y-1 text-rose-800 text-[11px]">
                {integrityReport.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Students cannot view results until official publication is executed by Registrar.</span>
          </div>
          <span className="font-mono text-slate-400">Institutional Governance Enforced</span>
        </div>
      </div>

      {/* Marks Sheet Table by Student */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Enrolled Student Marks Verification Matrix
            </h3>
            <p className="text-[11px] text-slate-500">Subject-wise marks and status entries</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {marksForExam.length} Total Marks Records Loaded
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Register No. & Student</th>
                <th className="px-4 py-3">CS501 (OS)</th>
                <th className="px-4 py-3">CS502 (DBMS)</th>
                <th className="px-4 py-3">CS503 (CN)</th>
                <th className="px-4 py-3">CS504 (DAA)</th>
                <th className="px-4 py-3">CS505 (Lab)</th>
                <th className="px-4 py-3 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentRows.map(({ student, records, hasPending }) => {
                const getMarkForSubject = (subId: string) => {
                  const m = records.find((r) => r.subjectId === subId);
                  if (!m) return <span className="text-slate-300 font-mono">-</span>;
                  if (m.status === 'MARKS_PENDING') {
                    return <span className="text-amber-600 font-semibold font-mono">Pending</span>;
                  }
                  if (m.status === 'ABSENT') {
                    return <span className="text-rose-600 font-medium font-mono">Absent</span>;
                  }
                  if (m.status === 'MEDICAL_ABSENCE') {
                    return <span className="text-sky-600 font-medium font-mono">Med. Abs</span>;
                  }
                  return (
                    <div className="font-mono">
                      <span className="font-semibold text-slate-900">{m.marksObtained}</span>
                      <span className="text-slate-400 text-[10px] ml-1">({m.grade})</span>
                    </div>
                  );
                };

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{student.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.registerNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs501')}</td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs502')}</td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs503')}</td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs504')}</td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs505')}</td>
                    <td className="px-4 py-3.5 text-right">
                      {hasPending ? (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Pending Resolution
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Resolved & Valid
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Publication Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Official Result Publication"
        subtitle="This action will compute semester GPAs and publish results to all student transcripts."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900">
            <span className="font-semibold block mb-1">Administrative Declaration</span>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              All marks entries have been resolved and cross-validated. Upon publishing:
            </p>
            <ul className="list-disc list-inside mt-2 text-[11px] space-y-1">
              <li>Semester GPA and Cumulative CGPA will be computed for all candidates.</li>
              <li>Official results will become visible on student and faculty portals.</li>
              <li>In-app notifications will be delivered to enrolled students.</li>
              <li>Post-publication mark corrections will require an official administrative approval workflow.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Confirm & Publish Results
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
