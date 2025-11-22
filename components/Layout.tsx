import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pb-20 md:pb-0 md:pl-20 max-w-4xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
