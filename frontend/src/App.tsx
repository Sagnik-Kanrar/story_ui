import React, { useState } from 'react';
import { StoryProvider, useStory } from './context/StoryContext';
import { Navbar, NavTab } from './components/common/Navbar';
import { HomeDesk } from './pages/HomeDesk';
import { MyStories } from './pages/MyStories';
import { StoryArchitect } from './pages/StoryArchitect';
import { CharacterArchive } from './pages/CharacterArchive';
import { StoryTimeline } from './pages/StoryTimeline';
import { WritingStudio } from './pages/WritingStudio';
import { UniverseMemory } from './pages/UniverseMemory';
import { PlotHoleDetector } from './pages/PlotHoleDetector';
import { IntelligenceDashboard } from './pages/IntelligenceDashboard';
import { ToastContainer } from './components/common/ToastContainer';
import { SettingsModal } from './components/common/SettingsModal';
import { motion, AnimatePresence } from 'framer-motion';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  useStory();

  return (
    <div className="min-h-screen bg-[#11100F] text-[#E0D7C7] flex flex-col font-sans selection:bg-[#C49A61]/30 selection:text-white">
      {/* Top Investigator Journal Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Investigation Stage */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === 'home' && <HomeDesk onNavigate={setCurrentTab} />}
            {currentTab === 'stories' && <MyStories onNavigate={setCurrentTab} />}
            {currentTab === 'architect' && <StoryArchitect onNavigate={setCurrentTab} />}
            {currentTab === 'characters' && <CharacterArchive />}
            {currentTab === 'timeline' && <StoryTimeline onNavigate={setCurrentTab} />}
            {currentTab === 'studio' && <WritingStudio />}
            {currentTab === 'memory' && <UniverseMemory />}
            {currentTab === 'plotholes' && <PlotHoleDetector onNavigate={setCurrentTab} />}
            {currentTab === 'intelligence' && <IntelligenceDashboard onNavigate={setCurrentTab} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* System Toast Alerts */}
      <ToastContainer />

      {/* Settings / Telemetry Diagnostics Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoryProvider>
      <MainContent />
    </StoryProvider>
  );
}
