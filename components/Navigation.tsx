import React from 'react';
import { Section } from '../types';

interface NavigationProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate }) => {
  const navItems = [
    { id: Section.HOME, label: 'HOME' },
    { id: Section.WORK, label: 'WORK' },
    { id: Section.ABOUT, label: 'ABOUT' },
    { id: Section.CONTACT, label: 'CONTACT' },
  ];

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-12 md:w-16 z-[100] flex flex-col bg-brand-black">
      <div className="flex-1 flex flex-col">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              relative flex-1 w-full flex items-center justify-center
              group transition-colors duration-300
              ${currentSection === item.id ? 'bg-brand-red' : 'hover:bg-white/5'}
            `}
          >
            {/* Vertical Text */}
            <span 
              className={`
                block transform -rotate-90 whitespace-nowrap text-xs md:text-sm font-bold tracking-[0.2em] font-sans
                ${currentSection === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}
              `}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;