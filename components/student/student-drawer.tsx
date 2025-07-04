import { X, FileText, Download } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { StudentDrawerProps, Subject, Assessment } from '@/lib/types';

export default function StudentDrawer({ student, studentDetails, onClose }: StudentDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!student || !mounted) return null;

  const portalTarget = typeof window !== 'undefined' && document.getElementById('drawer-portal');
  if (!portalTarget) return null;

  // Helper for progress bar
  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{
          width: `${value}%`,
          background: '#7372b7'
        }}
      ></div>
    </div>
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-40 bg-black backdrop-blur-sm transition-opacity duration-300 ease-in-out opacity-60"
        onClick={onClose}
      ></div>
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-xl z-50 overflow-y-auto flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
        >
          <X size={28} />
        </button>
        <div className="flex flex-col items-center pt-10 pb-6">
          <img
            src={student.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
            alt={student.name}
            className="w-28 h-28 rounded-full border-4 border-[#f7f6fd] object-cover"
          />
          <div className="mt-4 text-2xl font-bold text-gray-900">{student.name}</div>
          <div className="text-lg text-gray-500">{student.grade}</div>
        </div>

        {/* Personal Information */}
        <div className="bg-[#f7f6fd] rounded-2xl px-6 py-5 mb-5 mx-4">
          <div className="font-bold text-lg mb-3">Personal Information</div>
          <div className="flex justify-between text-base">
            <div>
              <div className="mb-2"><span className="font-semibold">Age:</span></div>
              <div className="mb-2"><span className="font-semibold">School:</span></div>
              <div><span className="font-semibold">City:</span></div>
            </div>
            <div className="text-right">
              <div className="mb-2">{studentDetails.age}</div>
              <div className="mb-2">{studentDetails.school}</div>
              <div>{studentDetails.city}</div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-[#f7f6fd] rounded-2xl px-6 py-5 mb-5 mx-4">
          <div className="font-bold text-lg mb-3">Contact Details</div>
          <div className="flex justify-between text-base">
            <div>
              <div className="mb-2"><span className="font-semibold">Email:</span></div>
              <div><span className="font-semibold">Phone:</span></div>
            </div>
            <div className="text-right">
              <div className="mb-2">{studentDetails.email}</div>
              <div>{studentDetails.phone}</div>
            </div>
          </div>
        </div>

        {/* Academic Progress */}
        <div className="bg-[#f7f6fd] rounded-2xl px-6 py-5 mb-5 mx-4">
          <div className="font-bold text-lg mb-3">Academic Progress</div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Overall Progress</span>
              <span className="text-sm">{studentDetails.overallProgress}%</span>
            </div>
            <ProgressBar value={studentDetails.overallProgress} />
          </div>
          {studentDetails.subjects.map((subject: Subject, idx: number) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{subject.name}</span>
                <span className="text-sm">{subject.progress}%</span>
              </div>
              <ProgressBar value={subject.progress} />
            </div>
          ))}
        </div>

        {/* Exercise & Assessment Results */}
        <div className="bg-[#f7f6fd] rounded-2xl px-6 py-5 mb-5 mx-4">
          <div className="font-bold text-lg mb-3">Exercise & Assessment Results</div>
          {studentDetails.assessments.map((assessment: Assessment, idx: number) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{assessment.subject}
                  <span className="font-normal text-xs ml-2 text-gray-500">Last Attempt: {assessment.date}</span>
                </span>
                <span className="text-sm">{assessment.score}%</span>
              </div>
              <ProgressBar value={assessment.score} />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 px-4 pb-8 pt-2 mt-auto">
          <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 border border-[#7372b7] rounded-xl text-[#7372b7] font-semibold bg-white hover:bg-[#f7f6fd] transition">
            <FileText size={18} />
            Send Weekly Report
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-[#7372b7] text-white rounded-xl font-semibold hover:bg-[#5e5ca1] transition">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>
    </>,
    portalTarget
  );
} 