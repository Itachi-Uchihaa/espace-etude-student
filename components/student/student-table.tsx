'use client'
import { useEffect, useState } from 'react';
import StatusBadge from './status-badge';
import { Search, FileText, Download, Eye } from 'lucide-react';

export default function StudentTable({ students, onViewStudent }: { students: any, onViewStudent: any }) {
  const [isClient, setIsClient] = useState(false);

    useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Table Controls */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <select className="rounded-lg border border-gray-200 px-2 py-1 text-sm">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>
        <div className="flex-1 flex items-center mx-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none"
            />
          </div>
        </div>
        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option>Grade Level</option>
        </select>
        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option>City</option>
        </select>
        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option>Status</option>
        </select>
        <button className="ml-auto flex items-center gap-2 bg-[#7372b7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#5e5ca1]">
          <FileText className="w-4 h-4" />
          Send Weekly Report
        </button>
        <button className="flex items-center gap-2 bg-gray-100 text-[#7372b7] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e5e4f3]">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm text-left text-gray-700">
          {/* Table Head */}
          <thead className="bg-gray-50 font-semibold border-b text-xs sm:text-sm">
            <tr>
              <th className="px-3 py-3 sm:px-4 md:px-5 whitespace-nowrap">Student ID</th>
              <th className="px-3 py-3 sm:px-4 md:px-5 whitespace-nowrap">Name</th>
              <th className="px-3 py-3 sm:px-4 md:px-5 whitespace-nowrap">Email</th>
              <th className="px-3 py-3 sm:px-4 md:px-5 whitespace-nowrap">Grade</th>
              <th className="px-3 py-3 sm:px-4 md:px-5 whitespace-nowrap">City</th>
              <th className="px-3 py-3 sm:px-4 md:px-5 whitespace-nowrap">Last Active</th>
              <th className="px-3 py-3 sm:px-4 md:px-5 whitespace-nowrap">Status</th>
              <th className="px-3 py-3 sm:px-4 md:px-5 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {students.map((student:any, idx:any) => (
              <tr key={student.id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="px-3 py-2 sm:px-4 md:px-5 text-sm font-medium text-gray-900">{student.id}</td>
                <td className="px-3 py-2 sm:px-4 md:px-5">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <img
                      src={student.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                      alt={student.name}
                      className="w-7 h-7 rounded-full shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-900 truncate">{student.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 sm:px-4 md:px-5 text-sm text-gray-600 truncate max-w-[180px]">
                  {student.email}
                </td>
                <td className="px-3 py-2 sm:px-4 md:px-5 text-sm text-gray-600">{student.grade}</td>
                <td className="px-3 py-2 sm:px-4 md:px-5 text-sm text-gray-600">{student.city}</td>
                <td className="px-3 py-2 sm:px-4 md:px-5 text-sm text-gray-600">{student.lastActive}</td>
                <td className="px-3 py-2 sm:px-4 md:px-5">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-3 py-2 sm:px-4 md:px-5">
                  <button
                    onClick={() => onViewStudent(student)}
                    className="p-2 rounded hover:bg-[#e5e4f3]"
                  >
                    <Eye className="w-5 h-5 text-[#7372b7]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t text-sm text-gray-500 bg-gray-50">
        <span>Previous</span>
        <div className="flex gap-1">
          <button className="w-8 h-8 rounded bg-[#7372b7] text-white">1</button>
          <button className="w-8 h-8 rounded bg-gray-200 text-gray-700">2</button>
          <button className="w-8 h-8 rounded bg-gray-200 text-gray-700">3</button>
        </div>
        <span>Next</span>
      </div>
    </div>
  );
} 