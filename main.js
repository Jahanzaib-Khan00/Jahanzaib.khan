
import { DEFAULT_RESUME_DATA } from './data.js';
import { polishResumeText } from './gemini.js';

// --- State Management ---
window.appData = JSON.parse(localStorage.getItem('resume_data')) || DEFAULT_RESUME_DATA;
window.isAdmin = false;
window.isEditing = false;
window.showLogin = false;

// Ensure local storage format safety
if (!window.appData.introVideoUrl && window.appData.introVideoUrl !== "") {
    window.appData = DEFAULT_RESUME_DATA;
}

// --- Helpers ---
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.updateData = (path, value) => {
    const parts = path.split('.');
    let current = window.appData;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    localStorage.setItem('resume_data', JSON.stringify(window.appData));
};

// structural updates require full DOM re-renders
function applyStructuralUpdate(updater) {
    updater();
    localStorage.setItem('resume_data', JSON.stringify(window.appData));
    render();
}

// --- AI Logic ---
window.handleAIPolish = async (path, context, inputId) => {
    const btn = document.getElementById(`btn-ai-${inputId}`);
    const input = document.getElementById(`input-${inputId}`);
    
    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    input.disabled = true;

    try {
        const result = await polishResumeText(input.value, context);
        input.value = result;
        window.updateData(path, result);
    } catch (e) {
        console.error(e);
    } finally {
        input.disabled = false;
        if(btn) btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i>';
    }
};

// --- Component Renderers ---
function editable(path, value, context, multiline = false, classes = "", placeholder = "") {
    const id = path.replace(/\./g, '-');
    if (!window.isEditing) {
        return `<div class="${classes} ${!value ? 'text-gray-400 italic' : ''}">${escapeHtml(value) || placeholder}</div>`;
    }

    const tag = multiline ? 'textarea' : 'input';
    const extra = multiline ? 'min-h-[100px]' : 'type="text"';

    return `
        <div class="relative group w-full">
            <${tag}
                id="input-${id}"
                class="w-full border-2 border-blue-400 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 ${classes} ${extra}"
                placeholder="${placeholder}"
                oninput="window.updateData('${path}', this.value)"
            >${multiline ? escapeHtml(value) : ''}</${tag}>
            ${!multiline ? `<script>document.getElementById('input-${id}').value = "${escapeHtml(value)}";</script>` : ''}
            <button
                id="btn-ai-${id}"
                onclick="window.handleAIPolish('${path}', '${context}', '${id}')"
                class="absolute top-0 -right-8 p-1 text-blue-500 hover:text-blue-700"
                title="AI Polish"
            >
                <i class="fas fa-wand-magic-sparkles"></i>
            </button>
        </div>
    `;
}

function renderVideo(url) {
    if (!url) return `<div class="aspect-video bg-gray-100 flex items-center justify-center rounded-2xl text-gray-400 italic text-sm">No video URL provided</div>`;
    
    const isEmbed = url.includes('embed') || url.includes('youtube.com/embed');
    if (isEmbed) {
        return `
            <div class="aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
                <iframe width="100%" height="100%" src="${escapeHtml(url)}" title="Video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `;
    }
    return `
        <div class="p-8 border-2 border-dashed border-blue-200 rounded-2xl text-center bg-blue-50/30">
            <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" class="text-blue-600 font-bold hover:underline break-all">
                <i class="fas fa-external-link-alt mr-2"></i> View Video Resource
            </a>
        </div>
    `;
}

// --- Specific Actions ---
window.login = () => {
    const pw = document.getElementById('admin-pw').value;
    if (pw === "k1h2a3n4") {
        window.isAdmin = true;
        window.showLogin = false;
        window.isEditing = true;
        render();
    } else {
        alert("Incorrect password.");
    }
};

window.logout = () => { window.isAdmin = false; window.isEditing = false; render(); };
window.toggleEdit = () => { window.isEditing = !window.isEditing; render(); };
window.openLogin = () => { window.showLogin = true; render(); };
window.closeLogin = () => { window.showLogin = false; render(); };

// Arrays Actions
window.addExperience = () => applyStructuralUpdate(() => window.appData.experience.unshift({
    id: Date.now().toString(), title: "New Job Title", company: "New Company", logo: "https://picsum.photos/seed/job/100/100", period: "2024 - Present", duration: "0 Months", bullets: ["Description of what you did..."]
}));
window.removeExperience = (idx) => applyStructuralUpdate(() => window.appData.experience.splice(idx, 1));
window.addBullet = (idx) => applyStructuralUpdate(() => window.appData.experience[idx].bullets.push(""));
window.removeBullet = (expIdx, bIdx) => applyStructuralUpdate(() => window.appData.experience[expIdx].bullets.splice(bIdx, 1));

window.addProject = () => applyStructuralUpdate(() => window.appData.projectVideos.push({ id: Date.now().toString(), title: "New Application Video", url: "" }));
window.removeProject = (idx) => applyStructuralUpdate(() => window.appData.projectVideos.splice(idx, 1));

window.addSkill = (type) => applyStructuralUpdate(() => window.appData.skills[type].push("New Skill"));
window.removeSkill = (type, idx) => applyStructuralUpdate(() => window.appData.skills[type].splice(idx, 1));

window.addAchievement = () => applyStructuralUpdate(() => window.appData.achievements.push("New Achievement"));
window.removeAchievement = (idx) => applyStructuralUpdate(() => window.appData.achievements.splice(idx, 1));


// --- Main Render Function ---
function render() {
    const data = window.appData;
    const appHTML = `
    <div class="min-h-screen bg-slate-50 text-slate-900 pb-20 relative font-['Inter']">
        
        <!-- Controls -->
        <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            ${!window.isAdmin ? `
                <button onclick="window.openLogin()" class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform active:scale-95">
                    <i class="fas fa-lock text-xl"></i>
                </button>
            ` : `
                <button onclick="window.toggleEdit()" class="${window.isEditing ? 'bg-green-600' : 'bg-gray-600'} text-white p-4 rounded-full shadow-xl font-bold flex items-center justify-center">
                    <i class="fas ${window.isEditing ? 'fa-save' : 'fa-edit'} text-xl"></i>
                </button>
                <button onclick="window.logout()" class="bg-red-600 text-white p-4 rounded-full shadow-xl hover:bg-red-700">
                    <i class="fas fa-sign-out-alt text-xl"></i>
                </button>
            `}
        </div>

        <!-- Login Modal -->
        ${window.showLogin ? `
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md">
                <h2 class="text-xl md:text-2xl font-black mb-4 text-center text-blue-900">Admin Login</h2>
                <input id="admin-pw" type="password" placeholder="Enter Password" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 outline-none focus:border-blue-500" onkeydown="if(event.key === 'Enter') window.login()">
                <div class="flex gap-3">
                    <button onclick="window.closeLogin()" class="flex-1 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button onclick="window.login()" class="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">Login</button>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Hero -->
        <header class="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-12 md:py-24 mb-8 md:mb-12 shadow-2xl overflow-hidden">
            <div class="container mx-auto px-4 md:px-6 relative z-10">
                <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div class="shrink-0 relative">
                        <div class="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 md:border-8 border-white/20 shadow-2xl mx-auto bg-blue-900">
                            ${window.isEditing ? `
                                <div class="w-full h-full p-4 flex flex-col justify-center gap-2">
                                    <p class="text-[10px] uppercase font-bold text-blue-200">Pic URL:</p>
                                    <input type="text" class="bg-white/10 text-[10px] w-full p-2 rounded text-white" value="${escapeHtml(data.personalInfo.profilePic)}" oninput="window.updateData('personalInfo.profilePic', this.value)">
                                </div>
                            ` : `<img src="${escapeHtml(data.personalInfo.profilePic)}" class="w-full h-full object-cover">`}
                        </div>
                    </div>
                    <div class="flex-1 text-center md:text-left">
                        <div class="mb-4 inline-block bg-white/10 px-4 py-1 rounded-full text-blue-200 text-xs font-semibold tracking-widest uppercase">Available for hire</div>
                        ${editable('personalInfo.name', data.personalInfo.name, '', false, 'text-4xl md:text-7xl font-black mb-6 tracking-tight text-white')}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-blue-100 opacity-90 font-medium text-sm md:text-base mt-2">
                            <div class="flex items-center justify-center md:justify-start gap-3"><i class="fas fa-map-marker-alt text-blue-400"></i> ${editable('personalInfo.address', data.personalInfo.address, '', false, 'text-white')}</div>
                            <div class="flex items-center justify-center md:justify-start gap-3"><i class="fas fa-phone-alt text-blue-400"></i> ${editable('personalInfo.phone', data.personalInfo.phone, '', false, 'text-white')}</div>
                            <div class="flex items-center justify-center md:justify-start gap-3"><i class="fas fa-envelope text-blue-400"></i> ${editable('personalInfo.email', data.personalInfo.email, '', false, 'text-white')}</div>
                            <div class="flex items-center justify-center md:justify-start gap-3"><i class="fab fa-linkedin text-blue-400"></i> ${editable('personalInfo.linkedin', data.personalInfo.linkedin, '', false, 'text-white')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main class="container mx-auto px-4 md:px-6 max-w-6xl">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                
                <!-- Left Column -->
                <div class="lg:col-span-8 space-y-8 md:space-y-12">
                    
                    <!-- Intro Video -->
                    <section class="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5">
                        <h3 class="text-xl md:text-2xl font-black text-blue-900 mb-6 flex items-center gap-4">
                            <span class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><i class="fas fa-play-circle"></i></span> Introduction Video
                        </h3>
                        ${window.isEditing ? `
                            <div class="mb-4">
                                <p class="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Video URL (Embed):</p>
                                <input type="text" class="w-full border-2 border-blue-100 rounded-xl px-4 py-2" value="${escapeHtml(data.introVideoUrl)}" oninput="window.updateData('introVideoUrl', this.value)" placeholder="https://www.youtube.com/embed/...">
                            </div>
                        ` : ''}
                        ${renderVideo(data.introVideoUrl)}
                    </section>

                    <!-- Experience -->
                    <section class="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-xl md:text-2xl font-black text-blue-900 flex items-center gap-4">
                                <span class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><i class="fas fa-briefcase"></i></span> Work Experience
                            </h3>
                            ${window.isEditing ? `<button onclick="window.addExperience()" class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs"><i class="fas fa-plus"></i> Add</button>` : ''}
                        </div>
                        <div class="space-y-2">
                            ${data.experience.map((exp, i) => `
                                <div class="mb-8 relative border-l-4 border-blue-600 pl-4 py-2 hover:bg-blue-50/30 rounded-r-xl">
                                    ${window.isEditing ? `<button onclick="window.removeExperience(${i})" class="absolute -top-2 -right-2 bg-red-100 text-red-600 w-8 h-8 rounded-full"><i class="fas fa-trash text-xs"></i></button>` : ''}
                                    <div class="flex gap-4 mb-4">
                                        <div class="shrink-0">
                                            ${window.isEditing ? `<input type="text" class="text-[8px] w-16 p-1 border" value="${escapeHtml(exp.logo)}" oninput="window.updateData('experience.${i}.logo', this.value)">` : `<img src="${escapeHtml(exp.logo)}" class="w-16 h-16 object-contain rounded-lg bg-white shadow-sm p-1">`}
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex justify-between gap-1 mb-2">
                                                ${editable(`experience.${i}.title`, exp.title, '', false, 'text-xl font-black text-blue-900', 'Title')}
                                                <div class="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">${editable(`experience.${i}.period`, exp.period, '', false, '', 'Period')}</div>
                                            </div>
                                            <div class="flex gap-2 text-sm mb-3">
                                                ${editable(`experience.${i}.company`, exp.company, '', false, 'font-bold text-slate-700')} <span class="text-gray-300">|</span> ${editable(`experience.${i}.duration`, exp.duration, '', false, 'text-slate-500 italic')}
                                            </div>
                                        </div>
                                    </div>
                                    <ul class="list-disc space-y-2 ml-4 text-sm">
                                        ${exp.bullets.map((b, bIdx) => `
                                            <li class="group relative pl-1">
                                                ${editable(`experience.${i}.bullets.${bIdx}`, b, `${exp.title} at ${exp.company}`, false, 'leading-relaxed')}
                                                ${window.isEditing ? `<button onclick="window.removeBullet(${i}, ${bIdx})" class="absolute -left-8 text-red-400 hover:text-red-600"><i class="fas fa-minus-circle"></i></button>` : ''}
                                            </li>
                                        `).join('')}
                                    </ul>
                                    ${window.isEditing ? `<button onclick="window.addBullet(${i})" class="text-blue-500 text-xs font-bold mt-2"><i class="fas fa-plus-circle"></i> Add Point</button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <!-- Projects -->
                    <section class="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-xl md:text-2xl font-black text-blue-900 flex items-center gap-4">
                                <span class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><i class="fas fa-rocket"></i></span> Application Demos
                            </h3>
                            ${window.isEditing ? `<button onclick="window.addProject()" class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs"><i class="fas fa-plus"></i> Add</button>` : ''}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            ${data.projectVideos.map((proj, i) => `
                                <div class="relative bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    ${window.isEditing ? `<button onclick="window.removeProject(${i})" class="absolute top-2 right-2 z-20 bg-red-500 text-white w-8 h-8 rounded-full"><i class="fas fa-times text-sm"></i></button>` : ''}
                                    ${editable(`projectVideos.${i}.title`, proj.title, '', false, 'font-black text-blue-900 mb-4 text-lg')}
                                    ${window.isEditing ? `<input class="w-full text-xs p-2 border border-blue-100 rounded-lg mb-4" value="${escapeHtml(proj.url)}" oninput="window.updateData('projectVideos.${i}.url', this.value)" placeholder="Video URL">` : ''}
                                    ${renderVideo(proj.url)}
                                </div>
                            `).join('')}
                            ${data.projectVideos.length === 0 ? `<div class="col-span-full py-12 text-center text-gray-400 italic">No application videos added.</div>` : ''}
                        </div>
                    </section>
                </div>

                <!-- Right Column (Sidebar) -->
                <div class="lg:col-span-4 space-y-8 md:space-y-12">
                    
                    <section class="bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5">
                        <h3 class="text-lg font-black text-blue-900 mb-4 border-b pb-3 border-blue-50">Summary</h3>
                        ${editable('summary', data.summary, 'Professional summary for Jahanzaib Khan', true, 'text-slate-600 leading-relaxed text-sm')}
                    </section>

                    <section class="bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5">
                        <h3 class="text-lg font-black text-blue-900 mb-6 border-b pb-3 border-blue-50">Key Skills</h3>
                        <div class="flex flex-wrap gap-2 mb-8">
                            ${data.skills.key.map((s, i) => `
                                <div class="relative bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md">
                                    ${editable(`skills.key.${i}`, s, '', false, 'text-white')}
                                    ${window.isEditing ? `<button onclick="window.removeSkill('key', ${i})" class="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">x</button>` : ''}
                                </div>
                            `).join('')}
                            ${window.isEditing ? `<button onclick="window.addSkill('key')" class="border-2 border-dashed border-blue-200 text-blue-400 px-3 py-1 rounded-xl text-xs font-bold">+</button>` : ''}
                        </div>

                        <h3 class="text-lg font-black text-blue-900 mb-4 border-b pb-3 border-blue-50">Technical</h3>
                        <ul class="space-y-3">
                            ${data.skills.technical.map((s, i) => `
                                <li class="flex items-center gap-3">
                                    <span class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                    ${editable(`skills.technical.${i}`, s, '', false, 'font-semibold text-slate-700 text-sm')}
                                    ${window.isEditing ? `<button onclick="window.removeSkill('technical', ${i})" class="text-red-400 ml-2"><i class="fas fa-times"></i></button>` : ''}
                                </li>
                            `).join('')}
                            ${window.isEditing ? `<li><button onclick="window.addSkill('technical')" class="text-blue-500 text-xs font-bold">+ Add Tech Skill</button></li>` : ''}
                        </ul>
                    </section>

                    <section class="bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5">
                        <h3 class="text-lg font-black text-blue-900 mb-4 border-b pb-3 border-blue-50">Achievements</h3>
                        <ul class="space-y-4">
                            ${data.achievements.map((ach, i) => `
                                <li class="group flex items-start gap-3 relative">
                                    <i class="fas fa-award text-yellow-500 mt-1"></i>
                                    ${editable(`achievements.${i}`, ach, '', false, 'text-sm font-medium text-slate-700')}
                                    ${window.isEditing ? `<button onclick="window.removeAchievement(${i})" class="absolute -left-4 text-red-400"><i class="fas fa-minus-circle"></i></button>` : ''}
                                </li>
                            `).join('')}
                            ${window.isEditing ? `<li><button onclick="window.addAchievement()" class="text-blue-500 text-xs font-bold">+ Add Achievement</button></li>` : ''}
                        </ul>
                    </section>

                </div>
            </div>
        </main>
        
        <!-- Footer -->
        <footer class="mt-16 md:mt-24 border-t border-slate-200 pt-8 text-center text-slate-400 pb-12">
            <p class="text-sm font-medium mb-4">Designed for ${escapeHtml(data.personalInfo.name)}</p>
        </footer>
    </div>
    `;

    // Inject without scripts
    document.getElementById('root').innerHTML = appHTML;

    // Execute scripts manually for inputs value assigning
    const scripts = document.getElementById('root').getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        eval(scripts[i].innerText);
    }
}

// Initial Render
render();
