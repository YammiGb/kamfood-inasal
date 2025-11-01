import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b-2 border-inasal-green/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 overflow-x-auto py-4 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-inasal-green text-white shadow-inasal'
                    : 'bg-white text-inasal-green border-2 border-inasal-green/30 hover:border-inasal-green hover:shadow-sm'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center ${c.icon ? 'space-x-2' : ''} whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-inasal-green text-white shadow-inasal'
                      : 'bg-white text-inasal-green border-2 border-inasal-green/30 hover:border-inasal-green hover:shadow-sm'
                  }`}
                >
                  {c.icon && <span className="text-lg">{c.icon}</span>}
                  <span>{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubNav;


