
export interface PersonalInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  linkedin: string;
  profilePic: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  logo: string;
  period: string;
  duration: string;
  bullets: string[];
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: {
    key: string[];
    technical: string[];
  };
  experience: Experience[];
  achievements: string[];
  introVideoUrl: string;
  projectVideos: MediaItem[];
}
