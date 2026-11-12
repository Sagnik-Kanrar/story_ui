import React, { useState, useEffect } from 'react';
import { useStory } from '../context/StoryContext';
import { api } from '../services/api';
import { Character, CharacterRelationship } from '../types';
import { Polaroid } from '../components/common/Polaroid';
import { Stamp } from '../components/common/Stamp';
import { sound } from '../services/audioService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Share2, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Heart, 
  Target, 
  Key, 
  UserCheck,
  Network,
  X
} from 'lucide-react';

export const CharacterArchive: React.FC = () => {
  const { activeStory, addToast } = useStory();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dossier' | 'network'>('dossier');

  // Secrets revealed toggle
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  // Character Modal state (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<Partial<Character> | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchCharacters = async () => {
    if (!activeStory) return;
    try {
      setLoading(true);
      const data = await api.getStoryCharacters(activeStory.id);
      setCharacters(data);
      if (data.length > 0 && !selectedCharId) {
        setSelectedCharId(data[0].id);
      }
    } catch (e: any) {
      addToast("Failed to load dossiers", e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [activeStory]);

  const activeChar = characters.find(c => c.id === selectedCharId) || characters[0];

  const toggleSecret = (charId: string) => {
    sound.playPaperRustle();
    setRevealedSecrets(prev => ({ ...prev, [charId]: !prev[charId] }));
  };

  const handleGenerateAiCharacter = async (role: string = "Protagonist") => {
    if (!activeStory) return;
    try {
      setGeneratingAi(true);
      sound.playTypewriterKeystroke();
      const res = await api.generateAiCharacter({
        genre: activeStory.genre,
        role: role,
        theme: activeStory.theme,
      });

      const gen = res.character;

      // Realistic portrait based on genre & role
      const genrePortraits: Record<string, string[]> = {
        Mystery: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
        ],
        Fantasy: [
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
        ],
        Horror: [
          "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
        ],
        Romance: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
        ],
        SciFi: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
        ]
      };

      const pool = genrePortraits[activeStory.genre] || genrePortraits.Mystery;
      const randomPortrait = pool[Math.floor(Math.random() * pool.length)];

      const newChar: Partial<Character> = {
        name: gen.name || "Unknown Suspect",
        alias: gen.alias || "The Shadow",
        age: gen.age || "35",
        role: role,
        personality_traits: gen.personality_traits || ["Perceptive", "Guarded", "Tenacious", "Enigmatic"],
        backstory: gen.backstory || "Personal records remain largely redacted in local archives.",
        physical_description: gen.physical_description || "Tall, observant stance with dark weathered coat.",
        motivations: gen.motivations || "Seek restitution and uncover concealed family secrets.",
        goals: gen.goals || "Obtain the primary evidence before adversaries reach the site.",
        fears: gen.fears || "Betrayal from those trusted with key confidences.",
        secrets: gen.secrets || "Carries a concealed signet key to an unmapped subterranean chamber.",
        current_status: gen.current_status || "Alive",
        first_appearance: "Chapter 1",
        last_appearance: "Current",
        portrait_url: randomPortrait,
        relationships: [],
      };

      setEditingChar(newChar);
      setModalOpen(true);
      addToast("Dossier Synthesized", "AI drafted personality traits and motivations.", "success");
    } catch (e: any) {
      addToast("Generation Error", "Could not generate character profile.", "error");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSaveCharacter = async (charData: Partial<Character>) => {
    if (!activeStory || !charData.name?.trim()) return;
    try {
      if (charData.id) {
        await api.updateCharacter(charData.id, charData);
        addToast("Dossier Updated", `Case file for ${charData.name} updated.`, "success");
      } else {
        const created = await api.createCharacter(activeStory.id, charData);
        setSelectedCharId(created.id);
        addToast("Dossier Created", `${charData.name} entered into evidence.`, "success");
      }
      setModalOpen(false);
      setEditingChar(null);
      sound.playPaperRustle();
      await fetchCharacters();
    } catch (e: any) {
      addToast("Save Failed", e.message || "Failed to commit character dossier.", "error");
    }
  };

  const handleDeleteCharacter = async (charId: string, name: string) => {
    if (!window.confirm(`Permanently expunge character dossier '${name}'?`)) return;
    try {
      await api.deleteCharacter(charId);
      addToast("Dossier Expunged", `Dossier for ${name} removed.`, "info");
      await fetchCharacters();
    } catch (e: any) {
      addToast("Error", "Could not delete dossier.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C231B] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#C49A61]"></span>
            <span className="font-typewriter text-xs text-[#C49A61] font-bold tracking-[0.25em] uppercase">
              PERSONNEL CASE FILES & SUSPECT DOSSIERS
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#F2E8DC] mt-1">
            Character Archive
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#A69482] mt-1">
            Examine realistic personality dossiers, clandestine motivations, and psychological profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="bg-[#1C1713] p-1 rounded border border-[#382E25] flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-3 py-1.5 rounded font-typewriter text-xs uppercase transition-colors flex items-center space-x-1.5 ${
                activeTab === 'dossier'
                  ? 'bg-[#C49A61] text-[#16120E] font-bold shadow'
                  : 'text-[#9A8978] hover:text-[#D4C5B3]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dossiers</span>
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`px-3 py-1.5 rounded font-typewriter text-xs uppercase transition-colors flex items-center space-x-1.5 ${
                activeTab === 'network'
                  ? 'bg-[#C49A61] text-[#16120E] font-bold shadow'
                  : 'text-[#9A8978] hover:text-[#D4C5B3]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Relationship Web</span>
            </button>
          </div>

          {/* AI Generator Button */}
          <button
            onClick={() => handleGenerateAiCharacter("Protagonist")}
            disabled={generatingAi}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded bg-[#2A2016] hover:bg-[#3D2E20] text-[#E0B77D] border border-[#C49A61]/50 font-typewriter text-xs uppercase font-bold tracking-wider transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C49A61]" />
            <span>{generatingAi ? "Analyzing..." : "Generate AI Profile"}</span>
          </button>

          {/* New Character Button */}
          <button
            onClick={() => {
              setEditingChar({
                name: '',
                role: 'Protagonist',
                personality_traits: ['Methodical', 'Observant'],
                current_status: 'Alive',
                relationships: [],
              });
              setModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded bg-[#C49A61] hover:bg-[#D6AB72] text-[#16120E] font-typewriter text-xs uppercase font-bold tracking-wider shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'dossier' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Suspect File Binder / Character Roster */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2C241D] pb-2">
              <span className="font-typewriter text-xs font-bold text-[#C49A61] uppercase tracking-wider">
                DOSSIER INDEX ({characters.length})
              </span>
              <span className="font-typewriter text-[10px] text-[#7A6958]">SELECT FILE</span>
            </div>

            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {characters.map((char) => {
                const isSelected = char.id === selectedCharId;

                return (
                  <motion.div
                    key={char.id}
                    whileHover={{ x: 3 }}
                    onClick={() => {
                      sound.playPaperRustle();
                      setSelectedCharId(char.id);
                    }}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center space-x-3.5 ${
                      isSelected
                        ? 'bg-[#291F17] border-[#C49A61] shadow-lg shadow-black/60'
                        : 'bg-[#1C1713] hover:bg-[#231D18] border-[#382E24]'
                    }`}
                  >
                    {/* Small Round Thumbnail with Brass Rim */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#C49A61]/40 bg-black/60 shadow">
                      {char.portrait_url ? (
                        <img
                          src={char.portrait_url}
                          alt={char.name}
                          className="w-full h-full object-cover filter contrast-[1.05]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg text-[#C49A61]">👤</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-sm font-bold text-[#EFE7DC] truncate">
                          {char.name}
                        </h4>
                        <span className={`text-[9px] font-typewriter px-1.5 py-0.2 rounded uppercase ${
                          char.current_status === 'Alive'
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                            : 'bg-red-950/40 text-red-300 border border-red-800/40'
                        }`}>
                          {char.current_status}
                        </span>
                      </div>
                      <p className="font-typewriter text-[10px] text-[#A69380] truncate mt-0.5">
                        {char.role} {char.alias ? `• "${char.alias}"` : ''}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {char.personality_traits?.slice(0, 2).map((t, i) => (
                          <span key={i} className="text-[9px] font-typewriter px-1.5 py-0.2 rounded bg-[#16120F] text-[#8C7A68] border border-[#2E241C]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {characters.length === 0 && !loading && (
                <div className="p-8 text-center bg-[#1A1613] rounded border border-[#332A22]">
                  <p className="font-typewriter text-xs text-[#8C7A69]">
                    No suspect or investigator files recorded yet.
                  </p>
                  <button
                    onClick={() => handleGenerateAiCharacter("Protagonist")}
                    className="mt-3 px-3 py-1.5 rounded bg-[#C49A61] text-[#14100D] font-typewriter text-xs font-bold uppercase"
                  >
                    Generate Initial Suspect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Physical Investigation Dossier Folder */}
          <div className="lg:col-span-8">
            {activeChar ? (
              <motion.div
                key={activeChar.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-lg parchment-sheet p-6 sm:p-9 border-2 border-[#8C7456] shadow-clipboard"
              >
                {/* Red Classified Stamp */}
                <div className="absolute top-6 right-6">
                  <Stamp
                    label={activeChar.current_status === 'Alive' ? "VERIFIED ALIVE" : "CASE STATUS: MISSING"}
                    type={activeChar.current_status === 'Alive' ? "green" : "red"}
                    rotation={-2}
                    size="sm"
                  />
                </div>

                {/* Dossier Header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-[#524131]/40 pb-6 mb-6">
                  {/* Large Realistic Polaroid Portrait */}
                  <div className="shrink-0">
                    <Polaroid
                      imageUrl={activeChar.portrait_url}
                      caption={activeChar.name}
                      subcaption={activeChar.role}
                      rotation={-1.5}
                      pinned={true}
                      size="md"
                    />
                  </div>

                  {/* Character Meta Specifications */}
                  <div className="flex-1 space-y-3 font-typewriter text-xs text-[#2A2016]">
                    <div>
                      <span className="text-[10px] text-[#7A644E] uppercase tracking-widest block">CASE SUBJECT</span>
                      <h2 className="font-serif text-3xl font-extrabold text-[#1C150F]">
                        {activeChar.name}
                      </h2>
                      {activeChar.alias && (
                        <p className="font-typewriter text-xs text-[#7A362E] font-bold mt-0.5 tracking-wider">
                          KNOWN CODENAME: "{activeChar.alias}"
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div><strong className="text-[#695441]">Chronological Age:</strong> {activeChar.age || "Undisclosed"}</div>
                      <div><strong className="text-[#695441]">Narrative Role:</strong> {activeChar.role}</div>
                      <div><strong className="text-[#695441]">First Record:</strong> {activeChar.first_appearance || "Chapter 1"}</div>
                      <div><strong className="text-[#695441]">Latest Trace:</strong> {activeChar.last_appearance || "Active Scene"}</div>
                    </div>

                    {/* Personality Traits Tags */}
                    <div className="pt-2">
                      <span className="text-[10px] text-[#7A644E] uppercase tracking-wider block mb-1">
                        OBSERVED PSYCHOLOGICAL TRAITS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeChar.personality_traits?.map((trait, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[#D6C6A9] text-[#291F16] border border-[#8C7558] font-bold text-[11px]"
                          >
                            • {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Edit and Delete Controls */}
                    <div className="pt-3 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingChar(activeChar);
                          setModalOpen(true);
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#35281D] hover:bg-[#473729] text-[#E0B77D] font-typewriter text-[11px] font-bold uppercase transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Dossier</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCharacter(activeChar.id, activeChar.name)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded border border-[#8F332B]/50 text-[#8F332B] hover:bg-red-900/10 font-typewriter text-[11px] font-bold uppercase transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dossier Body Documents */}
                <div className="space-y-5">
                  
                  {/* Physical Description & Backstory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#D9CBB0] p-4 rounded border border-[#8F785C] shadow-inner space-y-1.5">
                      <span className="font-typewriter text-[10px] font-bold text-[#6B533E] uppercase tracking-wider flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#8F332B]" />
                        <span>PHYSICAL SPECIFICATION</span>
                      </span>
                      <p className="font-serif text-xs text-[#2A2016] leading-relaxed">
                        {activeChar.physical_description || "No distinct marks or gait notes catalogued."}
                      </p>
                    </div>

                    <div className="bg-[#D9CBB0] p-4 rounded border border-[#8F785C] shadow-inner space-y-1.5">
                      <span className="font-typewriter text-[10px] font-bold text-[#6B533E] uppercase tracking-wider flex items-center space-x-1">
                        <Target className="w-3.5 h-3.5 text-[#8F332B]" />
                        <span>OPERATIONAL MOTIVATION</span>
                      </span>
                      <p className="font-serif text-xs text-[#2A2016] leading-relaxed">
                        {activeChar.motivations || "Motives remain obscure."}
                      </p>
                    </div>
                  </div>

                  {/* Backstory */}
                  <div className="bg-[#D9CBB0] p-4 rounded border border-[#8F785C] shadow-inner space-y-1.5">
                    <span className="font-typewriter text-[10px] font-bold text-[#6B533E] uppercase tracking-wider block">
                      ARCHIVAL BIOGRAPHY & ORIGINS
                    </span>
                    <p className="font-serif text-xs sm:text-sm text-[#241A13] leading-relaxed">
                      {activeChar.backstory || "Personal background remains undocumented in county manifests."}
                    </p>
                  </div>

                  {/* Confidential Secrets & Fears (Hidden until toggled) */}
                  <div className="bg-[#CCAFA0]/30 p-4 rounded border-2 border-dashed border-[#A84A42]/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-[#A84A42]" />
                        <span className="font-typewriter text-xs font-bold text-[#7D2922] uppercase tracking-wider">
                          CONFIDENTIAL INVESTIGATIVE INTEL (SECRETS & FEARS)
                        </span>
                      </div>

                      <button
                        onClick={() => toggleSecret(activeChar.id)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#B4473E]/20 hover:bg-[#B4473E]/30 text-[#852C25] font-typewriter text-[10px] font-bold uppercase transition-colors"
                      >
                        {revealedSecrets[activeChar.id] ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Redact Intel</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Reveal Uncensored Intel</span>
                          </>
                        )}
                      </button>
                    </div>

                    {revealedSecrets[activeChar.id] ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 pt-2 border-t border-[#A84A42]/30 text-xs font-serif text-[#331B18]"
                      >
                        <p><strong>Primary Vulnerability / Phobia:</strong> {activeChar.fears || "None catalogued."}</p>
                        <p><strong>Concealed Secret / Ulterior Agenda:</strong> {activeChar.secrets || "No active secret logged."}</p>
                      </motion.div>
                    ) : (
                      <p className="font-typewriter text-[11px] text-[#7A5550] italic">
                        [REDACTED PURSUANT TO NARRATIVE SECRECY PROTOCOL. CLICK REVEAL TO ACCESS.]
                      </p>
                    )}
                  </div>

                  {/* Interpersonal Connections Table */}
                  <div className="space-y-2">
                    <span className="font-typewriter text-xs font-bold text-[#63503E] uppercase tracking-wider block">
                      NOTED INTERPERSONAL TIES ({activeChar.relationships?.length || 0})
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeChar.relationships?.map((rel, idx) => (
                        <div key={idx} className="p-3 rounded bg-[#D6C6A9] border border-[#8C7558] text-xs space-y-1">
                          <div className="flex items-center justify-between font-typewriter">
                            <span className="font-bold text-[#2A2016]">{rel.character_name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-[#C7B596] text-[#78332B] font-bold text-[10px] uppercase">
                              {rel.relation_type}
                            </span>
                          </div>
                          {rel.notes && (
                            <p className="font-serif text-[11px] text-[#4A3D31] italic">
                              "{rel.notes}"
                            </p>
                          )}
                        </div>
                      ))}

                      {(!activeChar.relationships || activeChar.relationships.length === 0) && (
                        <p className="font-typewriter text-xs text-[#7A6653] italic col-span-2">
                          No direct relationships mapped in dossier. Add connections via Edit Dossier.
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              <div className="rounded-lg bg-[#191512] p-12 text-center border border-[#332A22]">
                <p className="font-typewriter text-xs text-[#8C7A69]">
                  Select a character from the roster index to view full case notes.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* RELATIONSHIP NETWORK GRAPH VISUALIZER */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg bg-[#171310] p-6 sm:p-8 border border-[#3A2F25] shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Corkboard Background Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#292018_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

          <div className="relative z-10 flex items-center justify-between border-b border-[#2C241D] pb-4">
            <div>
              <span className="font-typewriter text-xs text-[#C49A61] font-bold uppercase tracking-widest">
                INVESTIGATIVE CRIME BOARD
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#E5DCce]">
                Character Interconnection Web
              </h3>
              <p className="font-typewriter text-xs text-[#8C7A68]">
                Visual evidence threads connecting suspects, informants, and allies.
              </p>
            </div>
            <Stamp label="EVIDENCE GRAPH" type="amber" rotation={2} size="sm" />
          </div>

          {/* Interactive Network Board with Pinned Polaroids and Evidence Yarn */}
          <div className="relative z-10 min-h-[500px] flex flex-wrap items-center justify-around gap-8 p-6 bg-[#130F0D] rounded border border-[#2D231B]">
            {characters.map((char, idx) => (
              <motion.div
                key={char.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSelectedCharId(char.id);
                  setActiveTab('dossier');
                }}
                className="cursor-pointer flex flex-col items-center relative group"
              >
                {/* Red pushpin on top */}
                <div className="pushpin"></div>

                <div className="w-28 p-2 pb-4 bg-[#F2EFE8] rounded shadow-polaroid border border-black/30 text-center">
                  <div className="w-full h-24 bg-[#1B1815] rounded-sm overflow-hidden mb-1.5 border border-black/20">
                    {char.portrait_url ? (
                      <img src={char.portrait_url} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                    )}
                  </div>
                  <p className="font-handwriting font-bold text-sm text-[#241C15] truncate">
                    {char.name}
                  </p>
                  <p className="font-typewriter text-[9px] text-[#7A6653] uppercase truncate">
                    {char.role}
                  </p>
                </div>

                {/* Stamped Red Yarn / Connections pill */}
                {char.relationships && char.relationships.length > 0 && (
                  <div className="mt-2 flex flex-col items-center">
                    <span className="w-0.5 h-3 bg-[#B4473E]"></span>
                    <span className="px-2 py-0.5 rounded bg-[#291715] text-[#E5A8A3] border border-[#B4473E]/40 font-typewriter text-[9px] tracking-wider uppercase">
                      {char.relationships.length} Evidence Link{char.relationships.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CHARACTER CREATE / EDIT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto parchment-sheet p-6 sm:p-8 rounded-lg border-2 border-[#8F7454] shadow-2xl text-[#2B2117]"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-[#5E4D3E] hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-[#6E5A44]/40 pb-3 mb-5">
                <span className="font-typewriter text-xs font-bold text-[#8A332B] uppercase tracking-wider">
                  CLASSIFIED FILE ENTRY
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1E1711]">
                  {editingChar?.id ? `Edit Dossier: ${editingChar.name}` : "Draft New Character Dossier"}
                </h3>
              </div>

              <div className="space-y-4 font-typewriter text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase mb-1">Full Legal / Known Name *</label>
                    <input
                      type="text"
                      value={editingChar?.name || ''}
                      onChange={(e) => setEditingChar(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] font-serif font-bold text-sm text-[#231A13]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Investigation Alias / Codename</label>
                    <input
                      type="text"
                      value={editingChar?.alias || ''}
                      onChange={(e) => setEditingChar(prev => ({ ...prev, alias: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold uppercase mb-1">Age</label>
                    <input
                      type="text"
                      value={editingChar?.age || ''}
                      onChange={(e) => setEditingChar(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Role in Story</label>
                    <input
                      type="text"
                      value={editingChar?.role || 'Protagonist'}
                      onChange={(e) => setEditingChar(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Status</label>
                    <select
                      value={editingChar?.current_status || 'Alive'}
                      onChange={(e) => setEditingChar(prev => ({ ...prev, current_status: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                    >
                      <option value="Alive">Alive</option>
                      <option value="Missing">Missing</option>
                      <option value="Deceased">Deceased</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Portrait Image URL</label>
                  <input
                    type="text"
                    value={editingChar?.portrait_url || ''}
                    onChange={(e) => setEditingChar(prev => ({ ...prev, portrait_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Personality Traits (Comma Separated)</label>
                  <input
                    type="text"
                    value={editingChar?.personality_traits?.join(', ') || ''}
                    onChange={(e) => setEditingChar(prev => ({
                      ...prev,
                      personality_traits: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="Methodical, Cynical, Observant, Guarded"
                    className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Backstory</label>
                  <textarea
                    rows={3}
                    value={editingChar?.backstory || ''}
                    onChange={(e) => setEditingChar(prev => ({ ...prev, backstory: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] font-serif text-xs text-[#231A13]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Physical Description</label>
                  <textarea
                    rows={2}
                    value={editingChar?.physical_description || ''}
                    onChange={(e) => setEditingChar(prev => ({ ...prev, physical_description: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] font-serif text-xs text-[#231A13]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase mb-1">Motivations & Driving Need</label>
                    <input
                      type="text"
                      value={editingChar?.motivations || ''}
                      onChange={(e) => setEditingChar(prev => ({ ...prev, motivations: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Primary Fear</label>
                    <input
                      type="text"
                      value={editingChar?.fears || ''}
                      onChange={(e) => setEditingChar(prev => ({ ...prev, fears: e.target.value }))}
                      className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Concealed Secret</label>
                  <input
                    type="text"
                    value={editingChar?.secrets || ''}
                    onChange={(e) => setEditingChar(prev => ({ ...prev, secrets: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-[#E4D9C3] border border-[#9A846A] text-[#231A13]"
                  />
                </div>

                <div className="pt-4 border-t border-[#7A644E]/40 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded border border-[#6B553E] text-[#2B2117] font-bold uppercase"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => editingChar && handleSaveCharacter(editingChar)}
                    className="px-6 py-2 rounded bg-[#2B2016] text-[#E0B77D] hover:bg-[#3D2D20] font-bold uppercase shadow"
                  >
                    Commit Dossier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
