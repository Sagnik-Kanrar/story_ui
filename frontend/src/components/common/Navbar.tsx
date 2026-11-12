import React, { useState, useEffect } from 'react';
import { useStory } from '../../context/StoryContext';
import { sound } from '../../services/audioService';
import { 
  Compass, 
  BookOpen, 
  Feather, 
  Users, 
  GitBranch, 
  Brain, 
  AlertTriangle, 
  PenTool, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  FolderCheck,
  Activity,
  Plus
} from 'lucide-react';

export type NavTab = 
  | 'home'
  | 'stories'
  | 'architect'
  | 'characters'
  | 'timeline'
  | 'memory'
  | 'plotholes'
  | 'studio'
  | 'intelligence';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
}) => {
  const { stories, activeStory, setActiveStoryId, genreAesthetics } = useStory();
  const [isAudioMuted, setIsAudioMuted] = useState(sound.getMuted());
  const [storyDropdownOpen, setStoryDropdownOpen] = useState(false);

  useEffect(() => {
    return sound.subscribe((muted) => {
      setIsAudioMuted(muted);
    });
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsAudioMuted(muted);
    sound.playPaperRustle();
  };

  const navItems = [
    { id: 'home', label: 'Writer Desk', icon: Compass, badge: null },
    { id: 'stories', label: 'Case Archives', icon: BookOpen, badge: stories.length },
    { id: 'architect', label: 'Story Architect', icon: Feather, badge: null },
    { id: 'characters', label: 'Dossiers', icon: Users, badge: null },
    { id: 'timeline', label: 'Story Timeline', icon: GitBranch, badge: 'KEY' },
    { id: 'memory', label: 'Universe Memory', icon: Brain, badge: null },
    { id: 'plotholes', label: 'Plot Hole Audit', icon: AlertTriangle, badge: null },
    { id: 'studio', label: 'Writing Studio', icon: PenTool, badge: null },
    { id: 'intelligence', label: 'Intelligence', icon: Activity, badge: null },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#161311] border-b border-[#2E2721] shadow-2xl backdrop-blur-md">
      {/* Top Investigator Status Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 border-b border-[#231E19]">
        {/* Brand & Active Dossier Switcher */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#C49A61] to-[#7A5A2B] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#161311] rounded flex items-center justify-center">
                <span className="font-cinzel text-base font-black text-[#E0B77D] group-hover:scale-110 transition-transform">
                  SW
                </span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <span className="font-cinzel font-black tracking-widest text-sm text-[#E5DCce]">
                  STORYWEAVE
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-typewriter tracking-widest bg-[#C49A61]/20 text-[#E0B77D] rounded border border-[#C49A61]/30">
                  STUDIO
                </span>
              </div>
              <p className="font-typewriter text-[9px] tracking-wider text-[#8A7969] uppercase -mt-0.5">
                INVESTIGATION JOURNAL & CO-WRITER
              </p>
            </div>
          </div>

          {/* Active Story Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setStoryDropdownOpen(!storyDropdownOpen)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded bg-[#1D1814] hover:bg-[#25201A] border border-[#3D332A] transition-all text-left max-w-[200px] sm:max-w-xs"
            >
              <div className="w-2 h-2 rounded-full bg-[#C49A61] shrink-0 animate-pulse"></div>
              <div className="truncate">
                <span className="block font-serif text-xs font-semibold text-[#E6DECF] truncate">
                  {activeStory?.title || "No Case Selected"}
                </span>
                <span className="block font-typewriter text-[9px] text-[#9E8B79] uppercase">
                  {activeStory?.genre || "Archive"} • {activeStory?.chapter_count || 0} Ch.
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7B6B] shrink-0 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {storyDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-md bg-[#1C1713] border border-[#3E342B] shadow-2xl z-50 p-2 text-xs">
                <div className="font-typewriter text-[10px] text-[#8C7A69] uppercase px-2 py-1 tracking-wider border-b border-[#2C241D] flex justify-between items-center">
                  <span>ACTIVE CASE DOSSIERS</span>
                  <span className="text-[#C49A61]">{stories.length} Open</span>
                </div>
                <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                  {stories.map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveStoryId(s.id);
                        setStoryDropdownOpen(false);
                      }}
                      className={`px-2.5 py-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                        activeStory?.id === s.id
                          ? 'bg-[#C49A61]/20 text-[#E0B77D] border border-[#C49A61]/40'
                          : 'hover:bg-[#28211A] text-[#C4B7A5]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-serif font-bold text-xs truncate">{s.title}</p>
                        <p className="font-typewriter text-[9px] opacity-75">{s.genre} • {s.mood}</p>
                      </div>
                      <span className="font-typewriter text-[9px] text-[#A6937E] shrink-0">
                        {s.chapter_count || 6} ch
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#2C241D] pt-1.5 mt-1">
                  <button
                    onClick={() => {
                      setStoryDropdownOpen(false);
                      onSelectTab('architect');
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded bg-[#C49A61]/25 hover:bg-[#C49A61]/35 text-[#E0B77D] border border-[#C49A61]/40 font-typewriter text-[11px] transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Open New Story Dossier</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Ambient Audio, Diagnostic, User Badge */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Ambient Sound Switch */}
          <button
            onClick={toggleSound}
            title={isAudioMuted ? "Turn on rain & desk ambient sound" : "Mute ambient sound"}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition-all text-xs font-typewriter ${
              !isAudioMuted
                ? 'bg-[#C49A61]/20 border-[#C49A61] text-[#E0B77D]'
                : 'bg-[#1D1814] border-[#382E25] text-[#8C7B6B] hover:text-[#C4B7A5]'
            }`}
          >
            {!isAudioMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#C49A61] animate-pulse" />
                <span className="hidden md:inline text-[10px] tracking-wider">AMBIENT RAIN</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#6D5E51]" />
                <span className="hidden md:inline text-[10px] tracking-wider">AUDIO MUTED</span>
              </>
            )}
          </button>

          {/* Settings / Diagnostics Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1 rounded bg-[#1D1814] border border-[#382E25] hover:border-[#C49A61]/50 text-[#A69584] hover:text-[#E0B77D] transition-all font-typewriter text-xs"
            title="System Diagnostics & Engine Status"
          >
            <span className="hidden sm:inline">SETTINGS</span>
            <span className="sm:hidden">⚙️</span>
          </button>

          {/* User Badge */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#2E261F]">
            <div className="w-7 h-7 rounded-full bg-[#29221C] border border-[#C49A61]/50 flex items-center justify-center shadow-inner">
              <span className="font-serif text-xs font-bold text-[#E0B77D]">ST</span>
            </div>
            <div className="hidden lg:block">
              <p className="font-serif text-[11px] font-bold text-[#D8CEBE] leading-none">Storyteller</p>
              <p className="font-typewriter text-[8px] text-[#8C7A68] uppercase leading-none mt-0.5">Senior Investigator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Journal Navigation Tabs (Folder Divider Tabs) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 overflow-x-auto scrollbar-none flex items-center space-x-1 sm:space-x-1.5 pt-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playPaperRustle();
                onSelectTab(item.id as NavTab);
              }}
              className={`group relative px-3 sm:px-4 py-2 rounded-t-md transition-all font-typewriter text-xs whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                isActive
                  ? 'bg-[#C9B99B] text-[#241C15] font-bold shadow-lg border-t-2 border-x border-[#8F7C63]'
                  : 'bg-[#1C1713] text-[#9A8775] hover:bg-[#251E18] hover:text-[#CBBCA9] border-t border-x border-[#332920]'
              }`}
            >
              {/* Tab realistic rivet/cutout */}
              <Icon className={`w-3.5 h-3.5 transition-colors ${
                isActive ? 'text-[#3B2D20]' : 'text-[#7D6B5A] group-hover:text-[#C49A61]'
              }`} />
              <span className="tracking-wider">{item.label}</span>

              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-[#8F332B] text-white'
                    : 'bg-[#31271F] text-[#C49A61] border border-[#C49A61]/30'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Active Tab Indicator Glow */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9B99B]"></div>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
