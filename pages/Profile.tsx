import React from 'react';
import { Award, Zap, Clock, TrendingUp, ChevronRight, Settings, LogOut, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DATA = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 59 },
  { name: 'Wed', score: 80 },
  { name: 'Thu', score: 81 },
  { name: 'Fri', score: 76 },
  { name: 'Sat', score: 85 },
  { name: 'Sun', score: 90 },
];

const RECENT_WORDS = [
  { word: 'Serendipity', date: 'Today' },
  { word: 'Ephemeral', date: 'Yesterday' },
  { word: 'Resilient', date: '2 days ago' },
  { word: 'Eloquent', date: '3 days ago' },
];

const Profile: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-indigo-100 border-4 border-white shadow-md overflow-hidden relative">
              <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Alex Johnson</h1>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">Level B1 • Intermediate</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">PRO</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <Settings size={24} />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-100 transition-all">
          <div className="bg-orange-100 p-3 rounded-full mb-2 text-orange-500 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <span className="text-2xl font-bold text-slate-800">12</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Day Streak</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-100 transition-all">
          <div className="bg-blue-100 p-3 rounded-full mb-2 text-blue-500 group-hover:scale-110 transition-transform">
            <Award size={24} />
          </div>
          <span className="text-2xl font-bold text-slate-800">1,450</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">XP Points</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-100 transition-all">
          <div className="bg-purple-100 p-3 rounded-full mb-2 text-purple-500 group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          <span className="text-2xl font-bold text-slate-800">4.5h</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Practice</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-100 transition-all">
          <div className="bg-green-100 p-3 rounded-full mb-2 text-green-500 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <span className="text-2xl font-bold text-slate-800">42</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Words</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pronunciation Progress Chart */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Pronunciation Score</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recently Learned Words */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Recently Learned</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="flex-1 space-y-3">
            {RECENT_WORDS.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer">
                    <span className="font-semibold text-slate-700">{item.word}</span>
                    <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{item.date}</span>
                </div>
            ))}
            <button className="w-full mt-2 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-all">
              + Practice New Words
            </button>
          </div>
        </section>
      </div>

      {/* Settings / Menu */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left group">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Bell size={20} />
                    </div>
                    <span className="font-medium text-slate-700">Notifications</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left group">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Settings size={20} />
                    </div>
                    <span className="font-medium text-slate-700">Account Settings</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left group">
                <div className="flex items-center gap-3">
                    <div className="bg-red-50 text-red-500 p-2 rounded-lg group-hover:bg-red-100 transition-colors">
                        <LogOut size={20} />
                    </div>
                    <span className="font-medium text-red-600">Sign Out</span>
                </div>
            </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;