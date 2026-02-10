
import React, { useState, useEffect } from 'react';
import { ResumeData, Experience, MediaItem } from './types';
import { DEFAULT_RESUME_DATA } from './constants';
import { EditableText } from './components/EditableText';
import { ExperienceItem } from './components/ExperienceItem';

const App: React.FC = () => {
  const [data, setData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resume_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.introVideoUrl) return DEFAULT_RESUME_DATA;
        return parsed;
      } catch (e) {
        return DEFAULT_RESUME_DATA;
      }
    }
    return DEFAULT_RESUME_DATA;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    localStorage.setItem('resume_data', JSON.stringify(data));
  }, [data]);

  const handleLogin = () => {
    if (passwordInput === "k1h2a3n4") {
      setIsAdmin(true);
      setShowLogin(false);
      setIsEditing(true);
    } else {
      alert("Incorrect password.");
    }
  };

  const handleUpdate = (updater: (prev: ResumeData) => ResumeData) => {
    setData(prev => updater(prev));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: "New Job Title",
      company: "New Company",
      logo: "https://picsum.photos/seed/job/100/100",
      period: "2024 - Present",
      duration: "0 Months",
      bullets: ["Description of what you did..."]
    };
    handleUpdate(prev => ({ ...prev, experience: [newExp, ...prev.experience] }));
  };

  const addProjectVideo = () => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      title: "New Application Video",
      url: ""
    };
    handleUpdate(prev => ({ ...prev, projectVideos: [...prev.projectVideos, newItem] }));
  };

  const logout = () => {
    setIsAdmin(false);
    setIsEditing(false);
    setPasswordInput("");
  };

  const renderVideo = (url: string) => {
    if (!url) return <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-2xl text-gray-400 italic text-sm">No video URL provided</div>;
    
    const isEmbed = url.includes('embed') || url.includes('youtube.com/embed');
    
    if (isEmbed) {
      return (
        <div className="aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
          <iframe 
            width="100%" 
            height="100%" 
            src={url} 
            title="Video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    
    return (
      <div className="p-8 border-2 border-dashed border-blue-200 rounded-2xl text-center bg-blue-50/30">
        <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline break-all">
          <i className="fas fa-external-link-alt mr-2"></i> View Video Resource
        </a>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative font-['Inter']">
      
      {/* Admin Controls - Positioned carefully for mobile */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {!isAdmin ? (
          <button 
            onClick={() => setShowLogin(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform active:scale-95"
          >
            <i className="fas fa-lock text-xl"></i>
          </button>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`${isEditing ? 'bg-green-600' : 'bg-gray-600'} text-white p-4 rounded-full shadow-xl font-bold flex items-center justify-center`}
            >
              <i className={`fas ${isEditing ? 'fa-save' : 'fa-edit'} text-xl`}></i>
            </button>
            <button onClick={logout} className="bg-red-600 text-white p-4 rounded-full shadow-xl hover:bg-red-700">
              <i className="fas fa-sign-out-alt text-xl"></i>
            </button>
          </>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-center text-blue-900">Admin Login</h2>
            <input 
              type="password" 
              placeholder="Enter Password"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 outline-none focus:border-blue-500"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowLogin(false)} className="flex-1 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleLogin} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Optimized for Mobile */}
      <header className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-12 md:py-24 mb-8 md:mb-12 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0 L100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="shrink-0 relative">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 md:border-8 border-white/20 shadow-2xl mx-auto">
                {isEditing ? (
                  <div className="w-full h-full bg-blue-800 p-4 flex flex-col justify-center gap-2">
                    <p className="text-[10px] uppercase font-bold text-blue-200">Pic URL:</p>
                    <input 
                      type="text" 
                      className="bg-white/10 text-[10px] w-full p-2 rounded text-white" 
                      value={data.personalInfo.profilePic}
                      onChange={(e) => handleUpdate(p => ({...p, personalInfo: {...p.personalInfo, profilePic: e.target.value}}))}
                    />
                  </div>
                ) : (
                  <img src={data.personalInfo.profilePic} alt={data.personalInfo.name} className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="mb-4 inline-block bg-white/10 px-4 py-1 rounded-full text-blue-200 text-xs font-semibold tracking-widest uppercase">
                Available for hire
              </div>
              <EditableText
                isEditing={isEditing}
                value={data.personalInfo.name}
                onSave={(v) => handleUpdate(p => ({...p, personalInfo: {...p.personalInfo, name: v}}))}
                className="text-4xl md:text-7xl font-black mb-6 tracking-tight"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-blue-100 opacity-90 font-medium text-sm md:text-base">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <i className="fas fa-map-marker-alt text-blue-400 shrink-0"></i>
                  <EditableText isEditing={isEditing} value={data.personalInfo.address} onSave={(v) => handleUpdate(p => ({...p, personalInfo: {...p.personalInfo, address: v}}))} />
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <i className="fas fa-phone-alt text-blue-400 shrink-0"></i>
                  <EditableText isEditing={isEditing} value={data.personalInfo.phone} onSave={(v) => handleUpdate(p => ({...p, personalInfo: {...p.personalInfo, phone: v}}))} />
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <i className="fas fa-envelope text-blue-400 shrink-0"></i>
                  <EditableText isEditing={isEditing} value={data.personalInfo.email} onSave={(v) => handleUpdate(p => ({...p, personalInfo: {...p.personalInfo, email: v}}))} />
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <i className="fab fa-linkedin text-blue-400 shrink-0"></i>
                  <EditableText isEditing={isEditing} value={data.personalInfo.linkedin} onSave={(v) => handleUpdate(p => ({...p, personalInfo: {...p.personalInfo, linkedin: v}}))} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            
            {/* Introduction Video */}
            <section className="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5">
              <h3 className="text-xl md:text-2xl font-black text-blue-900 mb-6 md:mb-8 flex items-center gap-4">
                <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0"><i className="fas fa-play-circle"></i></span>
                Introduction Video
              </h3>
              <div className="space-y-4">
                {isEditing && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Video URL (Embed):</p>
                    <input 
                      type="text" 
                      className="w-full border-2 border-blue-100 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm"
                      value={data.introVideoUrl}
                      onChange={(e) => handleUpdate(p => ({...p, introVideoUrl: e.target.value}))}
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                )}
                {renderVideo(data.introVideoUrl)}
              </div>
            </section>

            {/* Work Experience */}
            <section className="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5">
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <h3 className="text-xl md:text-2xl font-black text-blue-900 flex items-center gap-4">
                  <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0"><i className="fas fa-briefcase"></i></span>
                  Work Experience
                </h3>
                {isEditing && (
                  <button onClick={addExperience} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg font-bold text-xs md:text-sm">
                    <i className="fas fa-plus mr-1 md:mr-2"></i> Add
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {data.experience.map((exp) => (
                  <ExperienceItem 
                    key={exp.id} 
                    item={exp} 
                    isEditing={isEditing} 
                    onUpdate={(upd) => handleUpdate(p => ({...p, experience: p.experience.map(e => e.id === upd.id ? upd : e)}))}
                    onRemove={() => handleUpdate(p => ({...p, experience: p.experience.filter(e => e.id !== exp.id)}))}
                  />
                ))}
              </div>
            </section>

            {/* Project Videos Section */}
            <section className="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5">
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <h3 className="text-xl md:text-2xl font-black text-blue-900 flex items-center gap-4">
                  <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0"><i className="fas fa-rocket"></i></span>
                  Application Demos
                </h3>
                {isEditing && (
                  <button onClick={addProjectVideo} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg font-bold text-xs md:text-sm">
                    <i className="fas fa-plus mr-1 md:mr-2"></i> Add
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {data.projectVideos.map(item => (
                  <div key={item.id} className="group relative">
                    {isEditing && (
                      <div className="absolute top-2 right-2 z-20">
                         <button 
                          onClick={() => handleUpdate(p => ({...p, projectVideos: p.projectVideos.filter(m => m.id !== item.id)}))}
                          className="bg-red-500 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                        ><i className="fas fa-times text-sm"></i></button>
                      </div>
                    )}
                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg">
                      <EditableText 
                        isEditing={isEditing} 
                        value={item.title} 
                        onSave={(v) => handleUpdate(p => ({...p, projectVideos: p.projectVideos.map(m => m.id === item.id ? {...m, title: v} : m)}))}
                        className="font-black text-blue-900 mb-4 text-base md:text-lg"
                        placeholder="Project Title"
                      />
                      {isEditing && (
                        <input 
                          className="w-full text-xs p-2 border-2 border-blue-100 rounded-lg mb-4 outline-none focus:border-blue-400" 
                          value={item.url} 
                          placeholder="Project Video URL" 
                          onChange={(e) => handleUpdate(p => ({...p, projectVideos: p.projectVideos.map(m => m.id === item.id ? {...m, url: e.target.value} : m)}))}
                        />
                      )}
                      {renderVideo(item.url)}
                    </div>
                  </div>
                ))}
                {data.projectVideos.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    No application videos added yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area - Optimised for Mobile (Stacks naturally) */}
          <div className="lg:col-span-4 space-y-8 md:space-y-12">
            
            {/* Professional Summary */}
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5">
              <h3 className="text-lg md:text-xl font-black text-blue-900 mb-4 md:mb-6 border-b pb-3 border-blue-50">Summary</h3>
              <EditableText
                isEditing={isEditing}
                value={data.summary}
                onSave={(v) => handleUpdate(p => ({...p, summary: v}))}
                multiline
                className="text-slate-600 leading-relaxed font-medium text-sm md:text-base"
                aiContext="Professional summary for Jahanzaib Khan"
              />
            </section>

            {/* Skills */}
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5">
              <h3 className="text-lg md:text-xl font-black text-blue-900 mb-6 border-b pb-3 border-blue-50">Key Skills</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {data.skills.key.map((skill, idx) => (
                  <div key={idx} className="group relative">
                    <div className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold shadow-md">
                      <EditableText
                        isEditing={isEditing}
                        value={skill}
                        onSave={(v) => {
                          const newSkills = [...data.skills.key];
                          newSkills[idx] = v;
                          handleUpdate(p => ({...p, skills: {...p.skills, key: newSkills}}));
                        }}
                      />
                    </div>
                    {isEditing && (
                      <button 
                        onClick={() => handleUpdate(p => ({...p, skills: {...p.skills, key: p.skills.key.filter((_, i) => i !== idx)}}))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-lg"
                      >x</button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button onClick={() => handleUpdate(p => ({...p, skills: {...p.skills, key: [...p.skills.key, "New Skill"]}}))} className="border-2 border-dashed border-blue-200 text-blue-400 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors">+</button>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-black text-blue-900 mb-4 md:mb-6 border-b pb-3 border-blue-50">Technical</h3>
              <ul className="space-y-3 md:space-y-4">
                {data.skills.technical.map((skill, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                    <EditableText
                      isEditing={isEditing}
                      value={skill}
                      onSave={(v) => {
                        const newTech = [...data.skills.technical];
                        newTech[idx] = v;
                        handleUpdate(p => ({...p, skills: {...p.skills, technical: newTech}}));
                      }}
                      className="font-semibold text-slate-700 text-sm md:text-base"
                    />
                  </li>
                ))}
              </ul>
            </section>

            {/* Achievements */}
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5">
              <h3 className="text-lg md:text-xl font-black text-blue-900 mb-4 md:mb-6 border-b pb-3 border-blue-50">Achievements</h3>
              <ul className="space-y-4">
                {data.achievements.map((ach, idx) => (
                  <li key={idx} className="relative group flex items-start gap-3">
                    <i className="fas fa-award text-yellow-500 mt-1 shrink-0"></i>
                    <EditableText
                      isEditing={isEditing}
                      value={ach}
                      onSave={(v) => {
                        const newAch = [...data.achievements];
                        newAch[idx] = v;
                        handleUpdate(p => ({...p, achievements: newAch}));
                      }}
                      className="text-sm font-medium text-slate-700 leading-snug"
                    />
                    {isEditing && (
                      <button onClick={() => handleUpdate(p => ({...p, achievements: p.achievements.filter((_, i) => i !== idx)}))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-minus-circle text-xs"></i></button>
                    )}
                  </li>
                ))}
                {isEditing && (
                  <button onClick={() => handleUpdate(p => ({...p, achievements: [...p.achievements, "New Achievement"]}))} className="text-blue-500 text-xs font-bold hover:underline">+ Add Achievement</button>
                )}
              </ul>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 md:mt-24 border-t border-slate-200 pt-8 md:pt-12 text-center text-slate-400 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-sm md:text-base font-medium mb-4">Designed for Jahanzaib Khan</p>
          <div className="flex justify-center gap-8 md:gap-12">
            <a href={`mailto:${data.personalInfo.email}`} className="text-slate-400 hover:text-blue-600 transition-colors"><i className="fas fa-envelope text-2xl md:text-3xl"></i></a>
            <a href={`https://${data.personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors"><i className="fab fa-linkedin text-2xl md:text-3xl"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
