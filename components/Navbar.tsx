import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Mic, Book, User, BookOpen, Zap } from 'lucide-react';

const Navbar: React.FC = () => {
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
      isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:top-0 md:bottom-auto md:h-screen md:w-20 md:flex-col md:border-r md:border-t-0 z-50">
      <div className="flex justify-around md:flex-col md:justify-start md:gap-8 md:pt-8 h-16 md:h-full">
        <NavLink to="/" className={navItemClass}>
          <Home size={24} />
          <span className="text-xs mt-1 md:hidden">Home</span>
        </NavLink>
        <NavLink to="/roleplay" className={navItemClass}>
          <MessageCircle size={24} />
          <span className="text-xs mt-1 md:hidden">Chat</span>
        </NavLink>
        <NavLink to="/live" className={navItemClass}>
          {({ isActive }) => (
            <>
              <Zap size={24} className={isActive ? "fill-indigo-600" : ""} />
              <span className="text-xs mt-1 md:hidden">Live</span>
            </>
          )}
        </NavLink>
        <NavLink to="/pronunciation" className={navItemClass}>
          <Mic size={24} />
          <span className="text-xs mt-1 md:hidden">Speak</span>
        </NavLink>
        <NavLink to="/vocabulary" className={navItemClass}>
          <Book size={24} />
          <span className="text-xs mt-1 md:hidden">Vocab</span>
        </NavLink>
        <NavLink to="/lessons" className={navItemClass}>
          <BookOpen size={24} />
          <span className="text-xs mt-1 md:hidden">Lessons</span>
        </NavLink>
        <NavLink to="/profile" className={navItemClass}>
          <User size={24} />
          <span className="text-xs mt-1 md:hidden">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;