import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen } from 'lucide-react';
import { Lesson } from '../types';

const LESSONS: Lesson[] = [
  {
    id: 'u1',
    title: 'Unit 1: Introductions',
    description: 'Greetings, verb "to be", countries & nationalities, personal questions.',
    level: 'A1 Beginner',
    content: 'Focus on introducing yourself, asking where people are from, and filling out simple forms. Grammar: am/is/are, subject pronouns.',
    imageUrl: 'https://picsum.photos/seed/english_u1/800/400'
  },
  {
    id: 'u2',
    title: 'Unit 2: Daily Life',
    description: 'Present simple, Routines, Time, Days & months.',
    level: 'A1 Beginner',
    content: 'Discuss your daily schedule, habits, and making appointments using the Present Simple tense.',
    imageUrl: 'https://picsum.photos/seed/english_u2/800/400'
  },
  {
    id: 'u3',
    title: 'Unit 3: Family & Friends',
    description: 'Possessives, Jobs, Describing people.',
    level: 'A1 Beginner',
    content: 'Talk about family members, professions, and describing appearance and personality.',
    imageUrl: 'https://picsum.photos/seed/english_u3/800/400'
  },
  {
    id: 'u4',
    title: 'Unit 4: Home & Living',
    description: 'There is/there are, Furniture, Prepositions of place.',
    level: 'A1 Beginner',
    content: 'Describe your home, identify furniture, and say where things are located.',
    imageUrl: 'https://picsum.photos/seed/english_u4/800/400'
  },
  {
    id: 'u5',
    title: 'Unit 5: Food & Drinks',
    description: 'Countable/uncountable, Shopping phrases, Likes & dislikes.',
    level: 'A1 Beginner',
    content: 'Roleplay shopping for groceries, ordering food, and expressing preferences.',
    imageUrl: 'https://picsum.photos/seed/english_u5/800/400'
  },
  {
    id: 'u6',
    title: 'Unit 6: Activities',
    description: 'Can/can’t, Simple requests, Hobbies.',
    level: 'A1 Beginner',
    content: 'Discuss abilities (what you can do), hobbies, and making polite requests.',
    imageUrl: 'https://picsum.photos/seed/english_u6/800/400'
  },
  {
    id: 'u7',
    title: 'Unit 7: Town & Places',
    description: 'Asking for directions, Places in town, Imperatives.',
    level: 'A1 Beginner',
    content: 'Learn to navigate a city, ask for directions, and understand instructions.',
    imageUrl: 'https://picsum.photos/seed/english_u7/800/400'
  },
  {
    id: 'u8',
    title: 'Unit 8: Health',
    description: 'Body parts, Basic problems ("I have a...").',
    level: 'A1 Beginner',
    content: 'Vocabulary for body parts and describing common health issues to a doctor.',
    imageUrl: 'https://picsum.photos/seed/english_u8/800/400'
  },
  {
    id: 'u9',
    title: 'Unit 9: Weather',
    description: 'Adjectives, Seasons.',
    level: 'A1 Beginner',
    content: 'Talk about the weather, seasons, and use adjectives to describe the environment.',
    imageUrl: 'https://picsum.photos/seed/english_u9/800/400'
  },
  {
    id: 'u10',
    title: 'Unit 10: Travel',
    description: 'Transport, At the airport, Simple past (intro).',
    level: 'A1 Beginner',
    content: 'Airport vocabulary, modes of transport, and an introduction to talking about the past.',
    imageUrl: 'https://picsum.photos/seed/english_u10/800/400'
  },
  {
    id: 'u11',
    title: 'Unit 11: Work & Study',
    description: 'Schedules, Simple job tasks.',
    level: 'A1 Beginner',
    content: 'Talk about work schedules, study routines, and daily tasks.',
    imageUrl: 'https://picsum.photos/seed/english_u11/800/400'
  },
  {
    id: 'u12',
    title: 'Unit 12: Revision',
    description: 'Revision + Final Test.',
    level: 'A1 Beginner',
    content: 'Comprehensive review of all previous units and a final knowledge check.',
    imageUrl: 'https://picsum.photos/seed/english_u12/800/400'
  },
];

const Lessons: React.FC = () => {
  const navigate = useNavigate();

  const handleLessonClick = (lesson: Lesson) => {
    navigate('/roleplay', { state: { lesson: lesson } });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Course Curriculum</h1>
        <div className="flex items-center gap-2 text-slate-500 mt-1">
            <BookOpen size={18} />
            <span>A1 Beginner • 12 Units (48 Lessons)</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LESSONS.map((lesson) => (
          <div 
            key={lesson.id}
            onClick={() => handleLessonClick(lesson)}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="h-32 overflow-hidden relative">
              <img 
                src={lesson.imageUrl} 
                alt={lesson.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              <span className="absolute bottom-3 left-4 text-white font-bold text-shadow-sm">
                  {lesson.title.split(':')[0]}
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-3">
                 <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">
                    {lesson.title.split(':')[1]?.trim() || lesson.title}
                 </h3>
                 <p className="text-slate-500 text-sm line-clamp-3">
                    {lesson.description}
                 </p>
              </div>
              
              <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-50">
                <span className="text-xs px-2 py-1 rounded font-medium bg-green-100 text-green-700">
                  {lesson.level}
                </span>
                <div className="flex items-center gap-1 text-indigo-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
                  <span>Start Unit</span>
                  <Clock size={12} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lessons;