import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Target, Calendar, Star, MessageCircle } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, Alex!</h1>
          <p className="text-slate-500">Ready to practice your English today?</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium text-sm">
          <Star size={16} className="fill-orange-500 text-orange-500" />
          <span>12 Day Streak</span>
        </div>
      </header>

      {/* Quick Action - Start Conversation */}
      <button 
        onClick={() => navigate('/roleplay')}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-[0.98] flex items-center justify-center gap-3 font-bold text-lg"
      >
        <MessageCircle className="fill-white/20" size={24} />
        Start New Conversation
      </button>

      {/* Daily Goal Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="text-indigo-500" size={20} />
            Daily Goal
          </h2>
          <span className="text-sm text-slate-500">2/3 Tasks</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4">
          <div className="bg-indigo-500 h-full w-2/3 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => navigate('/roleplay')}
            className="cursor-pointer group p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Play size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Roleplay: Ordering Coffee</h3>
                <p className="text-xs text-slate-500">5 min practice</p>
              </div>
            </div>
          </div>
          <div 
            onClick={() => navigate('/pronunciation')}
            className="cursor-pointer group p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                <Play size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Pronunciation Drill</h3>
                <p className="text-xs text-slate-500">Quick check</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Lesson */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Recommended for you</h2>
        <div className="relative overflow-hidden rounded-2xl shadow-md group cursor-pointer" onClick={() => navigate('/lessons')}>
          <img 
            src="https://picsum.photos/800/300?grayscale" 
            alt="Business Meeting" 
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
            <div>
              <span className="inline-block px-2 py-1 bg-indigo-600 text-white text-xs rounded mb-2">Intermediate</span>
              <h3 className="text-white text-xl font-bold">Business Meetings 101</h3>
              <p className="text-white/80 text-sm">Learn key phrases for confident introductions.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA for Classes */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Need a professional teacher?</h3>
            <p className="text-indigo-100 text-sm">Book a 1-on-1 live session with an expert.</p>
          </div>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); alert("Redirecting to booking page..."); }}
            className="bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            Book Class
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;