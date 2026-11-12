import React, { useState, useEffect } from 'react';
import { useStory } from '../context/StoryContext';
import { api } from '../services/api';
import { NavTab } from '../components/common/Navbar';
import { Polaroid } from '../components/common/Polaroid';
import { Stamp } from '../components/common/Stamp';
import { sound } from '../services/audioService';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Feather, 
  GitBranch, 
  Users, 
  AlertTriangle, 
  PenTool, 
  Brain, 
  Compass, 
  Clock, 
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Chapter, Character, TimelineEvent, Memory, PlotHole } from '../types';

interface HomeDeskProps {
  onNavigate: (tab: NavTab) => void;
}

export const HomeDesk: React.FC<HomeDeskProps> = ({ onNavigate }) => {
  const { activeStory, stories, genreAesthetics } = useStory();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [plotholes, setPlotholes] = useState<PlotHole[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeStory) return;
    const fetchUniverseData = async () => {
      try {
        setLoading(true);
        const [chaps, chars, evts, mems, holes] = await Promise.all([
          api.getStoryChapters(activeStory.id).catch(() => []),
          api.getStoryCharacters(activeStory.id).catch(() => []),
          api.getStoryTimeline(activeStory.id).catch(() => []),
          api.getStoryMemories(activeStory.id).catch(() => []),
          api.getStoryPlotHoles(activeStory.id).catch(() => []),
        ]);
        setChapters(chaps);
        setCharacters(chars);
        setEvents(evts);
        setMemories(mems);
        setPlotholes(holes);
      } catch (e) {
        console.error("Failed to load desk data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUniverseData();
  }, [activeStory]);

  const completedChapters = chapters.filter(c => c.status === 'completed').length;
  const progressPercent = chapters.length > 0 
    ? Math.round((completedChapters / chapters.length) * 100) 
    : 0;

  const openPlotHoles = plotholes.filter(p => p.status === 'open');

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-16 pt-6 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Background Desk Aesthetic: Grain and Subtle Atmospheric Lighting */}
      <div className="pointer-events-none fixed inset-0 bg-desk-radial opacity-90 z-0"></div>

      <div className="relative z-10 space-y-8">
        
        {/* A. Welcome Banner: Investigator's Briefing */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-lg bg-gradient-to-r from-[#1C1713] via-[#241E18] to-[#1C1713] p-6 sm:p-8 border border-[#3A3026] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C49A61] animate-ping"></span>
              <span className="font-typewriter text-xs text-[#C49A61] font-bold tracking-[0.25em] uppercase">
                THE WRITER'S DESK • CASE DISPATCH
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#F0E6D8] tracking-tight">
              Welcome back, Storyteller.
            </h1>
            <p className="font-typewriter text-sm sm:text-base text-[#AA9986] max-w-2xl">
              Your universe is waiting to be continued. The ink is fresh, the records are open, and new leads await your quill.
            </p>
          </div>

          {/* Quick Desk Seal */}
          <div className="flex items-center space-x-3 bg-[#14100D] px-4 py-3 rounded-md border border-[#352B22] shadow-inner shrink-0">
            <Compass className="w-8 h-8 text-[#C49A61]" />
            <div>
              <p className="font-cinzel text-xs font-bold text-[#E0B77D]">CHRONICLE STATUS</p>
              <p className="font-typewriter text-[11px] text-[#8C7A68]">
                {activeStory ? `${activeStory.genre} • ${activeStory.mood}` : 'Ready for New Case'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Top Grid: Continue Writing Card & Universe Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* B. Continue Writing: The Open Case Dossier */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 relative rounded-lg parchment-sheet p-6 sm:p-8 border border-[#8C7456] shadow-clipboard"
          >
            {/* Top Tape Strip */}
            <div className="absolute -top-3 left-10 w-28 h-6 tape-strip rotate-1"></div>
            
            <div className="flex items-start justify-between gap-4 border-b border-[#524233]/40 pb-4 mb-5">
              <div>
                <span className="font-typewriter text-xs font-bold uppercase tracking-widest text-[#785E47]">
                  PRIMARY DOSSIER IN PROGRESS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#231A14] mt-0.5">
                  {activeStory?.title || "No Active Story Case"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-typewriter font-bold bg-[#2A2016] text-[#E0B77D] tracking-wider uppercase">
                    {activeStory?.genre || "Genre"}
                  </span>
                  {activeStory?.subgenre && (
                    <span className="font-typewriter text-xs text-[#524233] italic">
                      • {activeStory.subgenre}
                    </span>
                  )}
                  <span className="font-typewriter text-xs text-[#735D49]">
                    • Last updated: {new Date(activeStory?.updated_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Stamp label="CASE ACTIVE" type="red" rotation={-2} size="sm" />
            </div>

            {/* Story Visual & Premise Summary */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 my-4">
              <div className="shrink-0">
                <Polaroid
                  imageUrl={activeStory?.cover_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop"}
                  caption={activeStory?.setting || "Scene Evidence"}
                  subcaption={activeStory?.time_period || "Case Location"}
                  rotation={-2}
                  pinned={true}
                  size="sm"
                />
              </div>

              <div className="flex-1 space-y-4">
                <p className="font-serif text-sm sm:text-base text-[#382E25] leading-relaxed italic border-l-2 border-[#8F7454] pl-3">
                  "{activeStory?.description || "Select a story dossier to begin examining the narrative threads."}"
                </p>

                {/* Chapter Progress Bar */}
                <div className="bg-[#B8A78A] p-3 rounded border border-[#968266] shadow-inner space-y-1.5">
                  <div className="flex items-center justify-between font-typewriter text-xs text-[#2A2016] font-bold">
                    <span>CHAPTER PROGRESSION</span>
                    <span>{completedChapters} of {chapters.length || activeStory?.chapter_count || 6} Chapters ({progressPercent}%)</span>
                  </div>
                  <div className="w-full bg-[#8A7558] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#2B2016] h-full transition-all duration-700 rounded-full"
                      style={{ width: `${Math.max(10, progressPercent)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      sound.playPaperRustle();
                      onNavigate('studio');
                    }}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded bg-[#291E16] hover:bg-[#3D2D21] text-[#F3EAD9] font-typewriter text-xs font-bold uppercase tracking-wider shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    <PenTool className="w-4 h-4 text-[#C49A61]" />
                    <span>Continue Writing Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      sound.playPaperRustle();
                      onNavigate('timeline');
                    }}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded border border-[#6B553E] hover:bg-[#B8A689] text-[#2C2117] font-typewriter text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>Open Story Timeline</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* C. Your Universe: Statistics & Lore Capacity */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-5 flex flex-col justify-between rounded-lg bg-[#1B1612] p-6 border border-[#382D22] shadow-2xl space-y-5"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#2C231B] pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-[#C49A61]" />
                  <h3 className="font-cinzel text-lg font-bold text-[#E5DCce]">
                    YOUR UNIVERSE METRICS
                  </h3>
                </div>
                <span className="font-typewriter text-[10px] text-[#A69584] uppercase tracking-wider">
                  PERSISTENT CODEX
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div 
                  onClick={() => onNavigate('stories')}
                  className="bg-[#241D17] hover:bg-[#2C231B] p-3.5 rounded border border-[#3D3125] cursor-pointer transition-all hover:border-[#C49A61]/50 group"
                >
                  <p className="font-typewriter text-[10px] text-[#9E8B79] uppercase tracking-wider">Total Stories</p>
                  <p className="font-serif text-2xl font-black text-[#F3ECE1] group-hover:text-[#E0B77D] transition-colors">
                    {stories.length}
                  </p>
                  <span className="font-typewriter text-[9px] text-[#786655] mt-1 block">Active Case Files</span>
                </div>

                <div 
                  onClick={() => onNavigate('studio')}
                  className="bg-[#241D17] hover:bg-[#2C231B] p-3.5 rounded border border-[#3D3125] cursor-pointer transition-all hover:border-[#C49A61]/50 group"
                >
                  <p className="font-typewriter text-[10px] text-[#9E8B79] uppercase tracking-wider">Chapters Written</p>
                  <p className="font-serif text-2xl font-black text-[#F3ECE1] group-hover:text-[#E0B77D] transition-colors">
                    {chapters.length}
                  </p>
                  <span className="font-typewriter text-[9px] text-[#786655] mt-1 block">
                    {chapters.reduce((acc, c) => acc + (c.word_count || 0), 0)} Total Words
                  </span>
                </div>

                <div 
                  onClick={() => onNavigate('characters')}
                  className="bg-[#241D17] hover:bg-[#2C231B] p-3.5 rounded border border-[#3D3125] cursor-pointer transition-all hover:border-[#C49A61]/50 group"
                >
                  <p className="font-typewriter text-[10px] text-[#9E8B79] uppercase tracking-wider">Characters</p>
                  <p className="font-serif text-2xl font-black text-[#F3ECE1] group-hover:text-[#E0B77D] transition-colors">
                    {characters.length}
                  </p>
                  <span className="font-typewriter text-[9px] text-[#786655] mt-1 block">Realistic Dossiers</span>
                </div>

                <div 
                  onClick={() => onNavigate('timeline')}
                  className="bg-[#241D17] hover:bg-[#2C231B] p-3.5 rounded border border-[#3D3125] cursor-pointer transition-all hover:border-[#C49A61]/50 group"
                >
                  <p className="font-typewriter text-[10px] text-[#9E8B79] uppercase tracking-wider">Events Recorded</p>
                  <p className="font-serif text-2xl font-black text-[#F3ECE1] group-hover:text-[#E0B77D] transition-colors">
                    {events.length}
                  </p>
                  <span className="font-typewriter text-[9px] text-[#786655] mt-1 block">Evidence Connected</span>
                </div>
              </div>

              {/* Memory & Vector Storage Card */}
              <div 
                onClick={() => onNavigate('memory')}
                className="mt-4 p-3.5 rounded bg-gradient-to-r from-[#241C16] to-[#1C1611] border border-[#48392B] hover:border-[#C49A61]/60 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-typewriter text-[10px] text-[#C49A61] uppercase tracking-widest font-bold">
                      SEMANTIC VECTOR STORAGE
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#EFE7DC] group-hover:text-[#E0B77D] transition-colors">
                      {memories.length} Universe Memories Injected
                    </h4>
                  </div>
                  <span className="text-xl">🧬</span>
                </div>
                <p className="font-typewriter text-[10px] text-[#8C7A68] mt-1">
                  ChromaDB & MiniLM semantic context engine ensures zero AI hallucinations across chapters.
                </p>
              </div>
            </div>

            {/* Plot Hole Alert Box */}
            <div className="bg-[#2B1B19] p-3.5 rounded border border-[#6E2B25] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-[#B4473E] shrink-0 animate-bounce" />
                <div>
                  <p className="font-typewriter text-xs font-bold text-[#E5A8A3]">
                    {openPlotHoles.length > 0 
                      ? `${openPlotHoles.length} Consistency Issues Detected` 
                      : "No Continuity Contradictions"}
                  </p>
                  <p className="font-typewriter text-[10px] text-[#A87974]">
                    {openPlotHoles.length > 0 
                      ? "Conflicting evidence flagged by plot hole detector" 
                      : "Universe timeline is historically verified"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('plotholes')}
                className="px-2.5 py-1 rounded bg-[#B4473E]/20 hover:bg-[#B4473E]/30 text-[#E5A8A3] border border-[#B4473E]/40 font-typewriter text-[10px] uppercase font-bold tracking-wider transition-colors"
              >
                Audit Case
              </button>
            </div>
          </motion.div>
        </div>

        {/* D. Quick Actions: Investigation Desk Tools */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="font-typewriter text-xs font-bold uppercase tracking-[0.2em] text-[#C49A61]">
              DESK SHORTCUTS & CASE COMMANDS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <button
              onClick={() => {
                sound.playPaperRustle();
                onNavigate('architect');
              }}
              className="p-4 rounded-lg bg-[#1B1612] hover:bg-[#251E18] border border-[#3A2F24] hover:border-[#C49A61]/60 text-left transition-all group shadow-md"
            >
              <div className="w-8 h-8 rounded bg-[#2D231A] flex items-center justify-center text-[#C49A61] mb-2.5 group-hover:scale-110 transition-transform">
                <Feather className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-sm font-bold text-[#E5DCce] group-hover:text-[#E0B77D] transition-colors">
                Create New Story
              </h4>
              <p className="font-typewriter text-[10px] text-[#8A7969] mt-1 leading-snug">
                Architect new genre universe & outline
              </p>
            </button>

            <button
              onClick={() => {
                sound.playPaperRustle();
                onNavigate('studio');
              }}
              className="p-4 rounded-lg bg-[#1B1612] hover:bg-[#251E18] border border-[#3A2F24] hover:border-[#C49A61]/60 text-left transition-all group shadow-md"
            >
              <div className="w-8 h-8 rounded bg-[#2D231A] flex items-center justify-center text-[#C49A61] mb-2.5 group-hover:scale-110 transition-transform">
                <PenTool className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-sm font-bold text-[#E5DCce] group-hover:text-[#E0B77D] transition-colors">
                Continue Writing
              </h4>
              <p className="font-typewriter text-[10px] text-[#8A7969] mt-1 leading-snug">
                Distraction-free AI writing studio
              </p>
            </button>

            <button
              onClick={() => {
                sound.playPaperRustle();
                onNavigate('timeline');
              }}
              className="p-4 rounded-lg bg-[#1B1612] hover:bg-[#251E18] border border-[#3A2F24] hover:border-[#C49A61]/60 text-left transition-all group shadow-md"
            >
              <div className="w-8 h-8 rounded bg-[#2D231A] flex items-center justify-center text-[#C49A61] mb-2.5 group-hover:scale-110 transition-transform">
                <GitBranch className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-sm font-bold text-[#E5DCce] group-hover:text-[#E0B77D] transition-colors">
                Story Timeline
              </h4>
              <p className="font-typewriter text-[10px] text-[#8A7969] mt-1 leading-snug">
                Inspect connected evidence clipboard
              </p>
            </button>

            <button
              onClick={() => {
                sound.playPaperRustle();
                onNavigate('characters');
              }}
              className="p-4 rounded-lg bg-[#1B1612] hover:bg-[#251E18] border border-[#3A2F24] hover:border-[#C49A61]/60 text-left transition-all group shadow-md"
            >
              <div className="w-8 h-8 rounded bg-[#2D231A] flex items-center justify-center text-[#C49A61] mb-2.5 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-sm font-bold text-[#E5DCce] group-hover:text-[#E0B77D] transition-colors">
                Explore Characters
              </h4>
              <p className="font-typewriter text-[10px] text-[#8A7969] mt-1 leading-snug">
                Realistic dossiers & relationship graph
              </p>
            </button>

            <button
              onClick={() => {
                sound.playPaperRustle();
                onNavigate('plotholes');
              }}
              className="p-4 rounded-lg bg-[#1B1612] hover:bg-[#251E18] border border-[#3A2F24] hover:border-[#C49A61]/60 text-left transition-all group shadow-md col-span-2 sm:col-span-1"
            >
              <div className="w-8 h-8 rounded bg-[#2D231A] flex items-center justify-center text-[#B4473E] mb-2.5 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-sm font-bold text-[#E5DCce] group-hover:text-[#E0B77D] transition-colors">
                Check Consistency
              </h4>
              <p className="font-typewriter text-[10px] text-[#8A7969] mt-1 leading-snug">
                Plot hole detector & timeline audit
              </p>
            </button>
          </div>
        </div>

        {/* E. Recent Activity & Case Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Recent Chapters in Active Story */}
          <div className="rounded-lg bg-[#1C1713] p-5 border border-[#382E25] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C241D] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#C49A61]" />
                <h3 className="font-cinzel text-base font-bold text-[#E5DCce]">
                  RECENT CHAPTER DRAFTS
                </h3>
              </div>
              <span className="font-typewriter text-[10px] text-[#8C7A69]">
                {chapters.length} Records
              </span>
            </div>

            <div className="space-y-2.5">
              {chapters.slice(0, 3).map((chap) => (
                <div
                  key={chap.id}
                  onClick={() => {
                    sound.playPaperRustle();
                    onNavigate('studio');
                  }}
                  className="p-3 rounded bg-[#241E18] hover:bg-[#2C241E] border border-[#382E24] cursor-pointer transition-all flex items-start justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-typewriter text-[10px] font-bold text-[#C49A61]">
                        CH. {chap.chapter_number}
                      </span>
                      <h5 className="font-serif text-xs font-bold text-[#E5DCce] group-hover:text-[#E0B77D] transition-colors">
                        {chap.title}
                      </h5>
                    </div>
                    <p className="font-sans text-[11px] text-[#9A8978] mt-1 line-clamp-1">
                      {chap.summary || chap.content.substring(0, 80) + '...'}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-typewriter uppercase shrink-0 ${
                    chap.status === 'completed'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                  }`}>
                    {chap.status}
                  </span>
                </div>
              ))}

              {chapters.length === 0 && (
                <p className="font-typewriter text-xs text-[#8C7A69] text-center py-4">
                  No chapters penned yet in this case file. Open the writing studio to begin.
                </p>
              )}
            </div>
          </div>

          {/* Character Dossiers Quick Peek */}
          <div className="rounded-lg bg-[#1C1713] p-5 border border-[#382E25] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C241D] pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#C49A61]" />
                <h3 className="font-cinzel text-base font-bold text-[#E5DCce]">
                  KEY SUSPECTS & ALLIES
                </h3>
              </div>
              <button
                onClick={() => onNavigate('characters')}
                className="font-typewriter text-[10px] text-[#C49A61] hover:underline"
              >
                View All Dossiers
              </button>
            </div>

            <div className="space-y-2.5">
              {characters.slice(0, 3).map((char) => (
                <div
                  key={char.id}
                  onClick={() => onNavigate('characters')}
                  className="p-3 rounded bg-[#241E18] hover:bg-[#2C241E] border border-[#382E24] cursor-pointer transition-all flex items-center space-x-3 group"
                >
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#16120F] border border-black/40">
                    {char.portrait_url ? (
                      <img src={char.portrait_url} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif text-xs font-bold text-[#E5DCce] group-hover:text-[#E0B77D] truncate">
                        {char.name}
                      </h5>
                      <span className="font-typewriter text-[9px] text-[#A69380]">
                        {char.role}
                      </span>
                    </div>
                    <p className="font-typewriter text-[10px] text-[#8C7A68] truncate">
                      {char.alias ? `"${char.alias}" • ` : ''}{char.personality_traits?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
              ))}

              {characters.length === 0 && (
                <p className="font-typewriter text-xs text-[#8C7A69] text-center py-4">
                  No character dossiers created yet. Visit the Character Archive.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
