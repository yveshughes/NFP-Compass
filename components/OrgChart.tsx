import React from 'react';
import { BoardMember } from '../types';
import { User } from 'lucide-react';

interface OrgChartProps {
  boardMembers: BoardMember[];
}

const OrgChart: React.FC<OrgChartProps> = ({ boardMembers }) => {
  if (boardMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
        <User className="w-16 h-16 mb-4 opacity-30" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Board Members Yet</h3>
        <p className="max-w-xs mx-auto text-sm">
          Tell Gemma the names of your board members and their titles, and they'll appear here with their LinkedIn profiles.
        </p>
      </div>
    );
  }

  // Organize by hierarchy
  const president = boardMembers.find(m => m.title === 'President');
  const secretary = boardMembers.find(m => m.title === 'Secretary');
  const treasurer = boardMembers.find(m => m.title === 'Treasurer');
  const directors = boardMembers.filter(m => m.title === 'Director');

  const renderMemberCard = (member: BoardMember) => (
    <div
      key={member.name}
      className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
    >
      {/* Photo */}
      <div className="w-20 h-20 rounded-full mb-3 overflow-hidden bg-slate-100 flex items-center justify-center">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-10 h-10 text-slate-400" />
        )}
      </div>

      {/* Name */}
      <h4 className="font-semibold text-slate-900 mb-1">{member.name}</h4>

      {/* Title */}
      <div className="text-xs font-medium text-white px-3 py-1 rounded-full mb-2" style={{ backgroundColor: 'var(--theme-primary)' }}>
        {member.title}
      </div>

      {/* Headline */}
      {member.headline && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{member.headline}</p>
      )}

      {/* LinkedIn Link */}
      {member.linkedInUrl && (
        <a
          href={member.linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          View LinkedIn
        </a>
      )}
    </div>
  );

  return (
    <div className="space-y-8 p-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Board of Directors</h2>
        <p className="text-sm text-slate-500">Your nonprofit leadership team</p>
      </div>

      {/* Officers Row */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Officers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {president && renderMemberCard(president)}
          {secretary && renderMemberCard(secretary)}
          {treasurer && renderMemberCard(treasurer)}
        </div>
      </div>

      {/* Directors Row */}
      {directors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Directors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {directors.map(renderMemberCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChart;
