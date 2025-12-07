import React from 'react';
import { BoardMember } from '../types';
import { User } from 'lucide-react';

interface OrgChartProps {
  boardMembers: BoardMember[];
}

const OrgChart: React.FC<OrgChartProps> = ({ boardMembers }) => {
  // Skeleton positions to show when empty
  const renderSkeletonCard = (title: string, isRequired: boolean = true, index: number = 0) => (
    <div
      key={`${title}-${index}`}
      className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-4 flex flex-col items-center text-center"
    >
      {/* Photo Placeholder */}
      <div className="w-20 h-20 rounded-full mb-3 bg-slate-200 flex items-center justify-center">
        <User className="w-10 h-10 text-slate-400" />
      </div>

      {/* Empty Name */}
      <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>

      {/* Title Badge */}
      <div className="text-xs font-medium text-slate-500 px-3 py-1 rounded-full mb-2 bg-slate-200">
        {title}
      </div>

      {/* Status */}
      <p className="text-xs text-slate-400 italic">
        {isRequired ? 'Required' : 'Optional'}
      </p>
    </div>
  );

  if (boardMembers.length === 0) {
    return (
      <div className="space-y-8 p-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Board of Directors</h2>
          <p className="text-sm text-slate-500">Texas requires minimum 3 board members</p>
        </div>

        {/* Officers Row - Required */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Required Officers</h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">3 minimum</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderSkeletonCard('President', true)}
            {renderSkeletonCard('Secretary', true)}
            {renderSkeletonCard('Treasurer', false)}
          </div>
        </div>

        {/* Directors Row - Optional */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Additional Directors</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">Optional</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderSkeletonCard('Director', false, 0)}
            {renderSkeletonCard('Director', false, 1)}
            {renderSkeletonCard('Director', false, 2)}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-medium mb-1">💡 How it works:</p>
          <p>Tell Gemma the names and titles of your board members (e.g., "Make John Doe the President"). Their LinkedIn profiles will be automatically looked up and displayed here.</p>
        </div>
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
