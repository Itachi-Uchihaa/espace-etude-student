import StatusBadge from './status-badge';
import { Eye } from 'lucide-react';

export default function StudentRow({ student, onViewStudent, isEven }: { student: any, onViewStudent: any, isEven: boolean }) {
  return (
    <div className={`grid grid-cols-8 gap-4 items-center px-6 py-3 ${isEven ? 'bg-gray-50' : ''}`}>
      <div className="text-sm font-medium text-gray-900">{student.id}</div>
      <div className="flex items-center gap-2">
        <img src={student.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'} alt={student.name} className="w-8 h-8 rounded-full" />
        <span className="text-sm font-medium text-gray-900">{student.name}</span>
      </div>
      <div className="text-sm text-gray-600">{student.email}</div>
      <div className="text-sm text-gray-600">{student.grade}</div>
      <div className="text-sm text-gray-600">{student.city}</div>
      <div className="text-sm text-gray-600">{student.lastActive}</div>
      <div>
        <StatusBadge status={student.status} />
      </div>
      <div>
        <button onClick={() => onViewStudent(student)} className="p-2 rounded hover:bg-[#e5e4f3]">
          <Eye className="w-5 h-5 text-[#7372b7]" />
        </button>
      </div>
    </div>
  );
} 