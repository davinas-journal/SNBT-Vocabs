import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

import Layout from './components/Layout';
import Flashcard from './components/Flashcard';
import Button from './components/Button';

import { VocabWord, ReviewAction, ReviewSessionSummary, DailyStats } from './types';
import { generateVocabData } from './services/geminiService';
import { calculateNextReview, isDue } from './utils/srs';
import { MOTIVATIONAL_MESSAGES, SAMPLE_DATA_SEED } from './constants';

const App = () => {
  // State
  const [activeTab, setActiveTab] = useState<'home' | 'add' | 'progress' | 'settings'>('home');
  const [words, setWords] = useState<VocabWord[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats>({ date: new Date().toISOString().split('T')[0], mastered: 0, reviewed: 0 });

  // Add Word State
  const [inputWord, setInputWord] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Review State
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<ReviewSessionSummary | null>(null);

  // Load Initial Data
  useEffect(() => {
    const savedWords = localStorage.getItem('pv_words');
    const savedStats = localStorage.getItem('pv_stats');
    
    if (savedWords) {
      setWords(JSON.parse(savedWords));
    } else {
        // Load seed data for first time users
        setWords(SAMPLE_DATA_SEED);
    }

    if (savedStats) {
      const parsedStats: DailyStats = JSON.parse(savedStats);
      if (parsedStats.date === new Date().toISOString().split('T')[0]) {
        setTodayStats(parsedStats);
      }
    }
  }, []);

  // Save Data on Change
  useEffect(() => {
    localStorage.setItem('pv_words', JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    localStorage.setItem('pv_stats', JSON.stringify(todayStats));
  }, [todayStats]);

  // Derived State
  // We strictly filter for words that are due NOW or in the past
  const dueWords = useMemo(() => {
    return words.filter(w => isDue(w.nextReviewDate)).sort((a, b) => a.nextReviewDate - b.nextReviewDate);
  }, [words]);

  // Progress calculation for the top bar
  // We estimate 'total session' as current due words + what we've already done today
  const estimatedTotalSession = dueWords.length + todayStats.reviewed;
  const progressPercent = estimatedTotalSession > 0 
    ? Math.min(100, Math.round((todayStats.reviewed / estimatedTotalSession) * 100)) 
    : 100;

  const currentReviewWord = dueWords[currentReviewIndex];

  // --- Handlers ---

  const handleAddWord = async () => {
    if (!inputWord.trim()) return;
    setIsGenerating(true);

    // Check if exists
    if (words.some(w => w.word.toLowerCase() === inputWord.toLowerCase())) {
        toast.error('Word already exists in your library!');
        setIsGenerating(false);
        return;
    }

    try {
      const data = await generateVocabData(inputWord);
      
      const newWord: VocabWord = {
        id: crypto.randomUUID(),
        word: inputWord.charAt(0).toUpperCase() + inputWord.slice(1).toLowerCase(),
        ...data,
        level: 0, // Start at Level 0
        nextReviewDate: Date.now(), // Due immediately
        createdAt: Date.now()
      };

      setWords(prev => [newWord, ...prev]);
      setInputWord('');
      toast.success('Word added successfully!');
      setActiveTab('home'); // Go to review
    } catch (error) {
      toast.error('Failed to generate word data. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewAction = (action: ReviewAction) => {
    if (!currentReviewWord) return;

    // Vibration feedback
    if (navigator.vibrate) navigator.vibrate(50);

    const { level: newLevel, nextDate } = calculateNextReview(currentReviewWord.level, action);

    // Update word in the main list
    const updatedWords = words.map(w => {
      if (w.id === currentReviewWord.id) {
        return { ...w, level: newLevel, nextReviewDate: nextDate };
      }
      return w;
    });

    setWords(updatedWords);

    // Update daily stats
    setTodayStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      mastered: newLevel === 5 && currentReviewWord.level < 5 ? prev.mastered + 1 : prev.mastered
    }));

    setIsCardFlipped(false);

    // Check if session is complete
    // Note: Since we updated 'words', 'dueWords' will re-calculate and the current word will vanish from it.
    // If that was the last word, dueWords.length will be 0 (after re-render).
    // We check current state. If dueWords has 1 item left, it's about to be 0.
    if (dueWords.length <= 1) {
       const summary: ReviewSessionSummary = {
           totalReviewed: todayStats.reviewed + 1,
           masteredCount: todayStats.mastered + (newLevel === 5 && currentReviewWord.level < 5 ? 1 : 0),
           hardCount: 0, 
           message: MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
       };
       setSessionSummary(summary);
    } else {
        // We stay at index 0 because the array shifts (the just-reviewed word is removed from dueWords)
        setCurrentReviewIndex(0);
    }
  };

  const resetSession = () => {
    setSessionSummary(null);
    setCurrentReviewIndex(0);
  };

  const deleteWord = (id: string) => {
      if(confirm('Are you sure you want to delete this word?')) {
          setWords(prev => prev.filter(w => w.id !== id));
          toast.success("Deleted");
      }
  }

  // --- Render Functions ---

  const renderHome = () => {
    if (sessionSummary) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
                <div className="w-24 h-24 bg-pastel-yellow rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce-slight">
                    <Sparkles size={48} className="text-orange-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Session Complete!</h2>
                <p className="text-gray-500 mb-8">{sessionSummary.message}</p>
                
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs uppercase font-bold">Reviewed Today</p>
                        <p className="text-2xl font-bold text-pastel-dark">{sessionSummary.totalReviewed}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs uppercase font-bold">Mastered</p>
                        <p className="text-2xl font-bold text-pastel-green">{sessionSummary.masteredCount}</p>
                    </div>
                </div>

                <Button onClick={resetSession} className="w-full">Continue</Button>
            </div>
        )
    }

    if (dueWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
                 <div className="mb-6 relative">
                    <div className="w-32 h-32 bg-pastel-green/30 rounded-full blur-xl absolute top-0 left-0"></div>
                    <CheckCircle2 size={80} className="text-pastel-green relative z-10" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h2>
                 <p className="text-gray-500 mb-8">You have no words to review right now. Come back later or add new vocabulary.</p>
                 <Button onClick={() => setActiveTab('add')}>Add New Word</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full px-6 py-6 max-w-md mx-auto">
            {/* Header / Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <h1 className="text-2xl font-bold text-gray-800">Today's Review</h1>
                    <span className="text-sm font-semibold text-pastel-orange">{dueWords.length} left</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-pastel-orange to-pastel-pink transition-all duration-500"
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="flex-1 flex items-center justify-center mb-6 relative">
                <Flashcard 
                    wordData={currentReviewWord} 
                    isFlipped={isCardFlipped} 
                    setIsFlipped={setIsCardFlipped}
                />
            </div>

            {/* Controls */}
            {isCardFlipped ? (
                <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in">
                    <Button variant="hard" onClick={() => handleReviewAction(ReviewAction.HARD)}>
                        Hard
                    </Button>
                    <Button variant="good" onClick={() => handleReviewAction(ReviewAction.GOOD)}>
                        Good
                    </Button>
                    <Button variant="easy" onClick={() => handleReviewAction(ReviewAction.EASY)}>
                        Easy
                    </Button>
                </div>
            ) : (
                <div className="mb-4">
                     <Button className="w-full h-16 bg-gray-800 text-white shadow-lg" onClick={() => setIsCardFlipped(true)}>
                        Show Answer
                     </Button>
                </div>
            )}
        </div>
    );
  };

  const renderAdd = () => (
    <div className="p-6 h-full flex flex-col justify-center animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Vocabulary</h2>
        <p className="text-gray-500 mb-8">Type a word and let AI generate the magic.</p>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-pastel-orange/20 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">English Word</label>
            <input 
                type="text" 
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                placeholder="e.g., Serendipity"
                className="w-full px-4 py-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-orange outline-none transition-all text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            />
        </div>

        <Button 
            onClick={handleAddWord} 
            isLoading={isGenerating} 
            className="w-full h-14 text-lg shadow-lg shadow-pastel-orange/30"
            disabled={!inputWord.trim()}
        >
            {isGenerating ? 'Generating...' : 'Generate & Save'}
        </Button>
    </div>
  );

  const renderProgress = () => {
      const levelCounts = [0, 0, 0, 0, 0, 0];
      words.forEach(w => levelCounts[w.level]++);

      const pieData = [
          { name: 'New', value: levelCounts[0], color: '#E5E7EB' },
          { name: 'Learning', value: levelCounts[1] + levelCounts[2], color: '#FFD4A3' }, // Orange
          { name: 'Reviewing', value: levelCounts[3] + levelCounts[4], color: '#FFF3A7' }, // Yellow
          { name: 'Mastered', value: levelCounts[5], color: '#C8F7C5' }, // Green
      ].filter(d => d.value > 0);

      const totalWords = words.length;

      return (
        <div className="p-6 pb-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Progress</h2>

            {/* Main Stats Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">Total Words</p>
                    <p className="text-4xl font-bold text-gray-800">{totalWords}</p>
                </div>
                <div className="h-24 w-24">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={40}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-pastel-green/20 p-4 rounded-2xl">
                     <p className="text-sm text-gray-600 font-bold mb-1">Mastered</p>
                     <p className="text-2xl font-bold text-green-700">{levelCounts[5]}</p>
                 </div>
                 <div className="bg-pastel-pink/20 p-4 rounded-2xl">
                     <p className="text-sm text-gray-600 font-bold mb-1">Pending</p>
                     <p className="text-2xl font-bold text-pink-700">{dueWords.length}</p>
                 </div>
            </div>

            <h3 className="font-bold text-gray-700 mb-4">Mastery Distribution</h3>
            <div className="space-y-3 mb-8">
                {[5, 4, 3, 2, 1, 0].map(lvl => (
                    <div key={lvl} className="flex items-center gap-3">
                        <span className="w-4 text-xs font-bold text-gray-400">{lvl}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-pastel-orange" 
                                style={{ width: `${totalWords > 0 ? (levelCounts[lvl] / totalWords) * 100 : 0}%` }} 
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-500 w-6 text-right">{levelCounts[lvl]}</span>
                    </div>
                ))}
            </div>
            
            <h3 className="font-bold text-gray-700 mb-4">Library</h3>
             <div className="space-y-2">
                {words.length === 0 && <p className="text-gray-400 text-sm">No words yet.</p>}
                {words.slice(0, 10).map(word => (
                    <div key={word.id} className="bg-white p-3 rounded-xl flex justify-between items-center border border-gray-50">
                        <div>
                            <p className="font-bold text-gray-800">{word.word}</p>
                            <p className="text-xs text-gray-400">{word.translation}</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <span className="text-xs bg-gray-100 px-2 py-1 rounded">Lvl {word.level}</span>
                             <button onClick={() => deleteWord(word.id)} className="text-red-300 hover:text-red-500">
                                <Trash2 size={16} />
                             </button>
                        </div>
                    </div>
                ))}
                {words.length > 10 && <p className="text-center text-xs text-gray-400 mt-2">and {words.length - 10} more...</p>}
            </div>

        </div>
      );
  };

  const renderSettings = () => (
    <div className="p-6 h-full animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        
        <div className="space-y-4">
             <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <span className="font-medium text-gray-700">Theme</span>
                <span className="text-sm text-pastel-orange font-bold">Pastel (Default)</span>
             </div>

             <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <span className="font-medium text-gray-700">Audio Speed</span>
                <span className="text-sm text-gray-400">Normal</span>
             </div>

             <div className="bg-white p-4 rounded-2xl shadow-sm">
                <p className="font-medium text-gray-700 mb-2">Data Management</p>
                <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 text-sm py-2" onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href",     dataStr);
                        downloadAnchorNode.setAttribute("download", "vocab_backup.json");
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                    }}>Export JSON</Button>
                    <Button variant="ghost" className="flex-1 text-sm py-2 text-red-400 hover:bg-red-50 hover:text-red-500" onClick={() => {
                        if(confirm("Clear all data?")) {
                            setWords([]);
                            localStorage.removeItem('pv_words');
                            localStorage.removeItem('pv_stats');
                            toast.success("Reset complete");
                        }
                    }}>Reset App</Button>
                </div>
             </div>
             
             <div className="mt-8 text-center">
                 <p className="text-xs text-gray-300">PastelVocab v1.0</p>
                 <p className="text-xs text-gray-300 mt-1">Spaced Repetition System</p>
             </div>
        </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} onNavigate={setActiveTab}>
      <Toaster position="top-center" toastOptions={{
          style: {
              background: '#333',
              color: '#fff',
              borderRadius: '20px',
          }
      }} />
      
      {activeTab === 'home' && renderHome()}
      {activeTab === 'add' && renderAdd()}
      {activeTab === 'progress' && renderProgress()}
      {activeTab === 'settings' && renderSettings()}

    </Layout>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<App />);

export default App;
