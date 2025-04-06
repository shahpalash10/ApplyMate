'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../components/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ProfilePreferences {
  jobTypes: string[];
  remote: boolean;
  relocate: boolean;
  salary: string;
}

interface Profile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  preferences: ProfilePreferences;
}

export default function ProfilePage() {
  const { isDark } = useTheme();
  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    skills: [],
    experience: '',
    education: '',
    preferences: {
      jobTypes: [],
      remote: false,
      relocate: false,
      salary: '',
    },
  });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        // Ensure all profile fields have proper defaults to avoid undefined values
        setProfile({
          fullName: parsedProfile.fullName || '',
          email: parsedProfile.email || '',
          phone: parsedProfile.phone || '',
          location: parsedProfile.location || '',
          title: parsedProfile.title || '',
          bio: parsedProfile.bio || '',
          skills: Array.isArray(parsedProfile.skills) ? parsedProfile.skills : [],
          experience: parsedProfile.experience || '',
          education: parsedProfile.education || '',
          preferences: {
            jobTypes: Array.isArray(parsedProfile.preferences?.jobTypes) 
              ? parsedProfile.preferences.jobTypes 
              : [],
            remote: parsedProfile.preferences?.remote ?? false,
            relocate: parsedProfile.preferences?.relocate ?? false,
            salary: parsedProfile.preferences?.salary || '',
          },
        });
      } catch (e) {
        console.error('Error parsing saved profile', e);
        // Keep default state in case of parsing error
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'preferences') {
        setProfile(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            [child]: value
          }
        }));
      }
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'preferences') {
        setProfile(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            [child]: checked
          }
        }));
      }
    }
  };

  const handleJobTypeToggle = (jobType: string) => {
    setProfile(prev => {
      const currentJobTypes = prev.preferences.jobTypes;
      const updatedJobTypes = currentJobTypes.includes(jobType)
        ? currentJobTypes.filter(type => type !== jobType)
        : [...currentJobTypes, jobType];
      
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          jobTypes: updatedJobTypes
        }
      };
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Complete your profile to improve job matches and enable auto-apply features
          </p>
        </div>

        <Card variant={isDark ? "glass" : "default"} className="p-6">
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap -mb-px">
              <button
                className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'personal' 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Information
              </button>
              <button
                className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'career' 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
                onClick={() => setActiveTab('career')}
              >
                Career Details
              </button>
              <button
                className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences' 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                Job Preferences
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      className={`w-full rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                      } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className={`w-full rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                      } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className={`w-full rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                      } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      placeholder="City, State, Country"
                      className={`w-full rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                      } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Career Details Tab */}
            {activeTab === 'career' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={profile.title}
                    onChange={handleChange}
                    placeholder="e.g. Machine Learning Engineer"
                    className={`w-full rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                    } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1">
                    Professional Summary
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                    } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Skills
                  </label>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g. Python, TensorFlow)"
                      className={`flex-grow rounded-l-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                      } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className={`px-4 rounded-r-lg ${
                        isDark 
                          ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill) => (
                      <span 
                        key={skill} 
                        className={`px-3 py-1 rounded-full text-sm flex items-center ${
                          isDark 
                            ? 'bg-gray-700 text-gray-200' 
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label={`Remove ${skill} skill`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium mb-1">
                    Work Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={profile.experience}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Briefly describe your work experience"
                    className={`w-full rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                    } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-medium mb-1">
                    Education
                  </label>
                  <textarea
                    id="education"
                    name="education"
                    value={profile.education}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Briefly describe your educational background"
                    className={`w-full rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                    } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                  />
                </div>
              </div>
            )}

            {/* Job Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleJobTypeToggle(type)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          profile.preferences.jobTypes.includes(type)
                            ? 'bg-primary-600 text-white'
                            : isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } transition-colors`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remote"
                      name="preferences.remote"
                      checked={profile.preferences.remote}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remote" className="ml-2 block text-sm">
                      Open to remote work
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="relocate"
                      name="preferences.relocate"
                      checked={profile.preferences.relocate}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="relocate" className="ml-2 block text-sm">
                      Willing to relocate
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-medium mb-1">
                    Expected Salary Range
                  </label>
                  <select
                    id="salary"
                    name="preferences.salary"
                    value={profile.preferences.salary}
                    onChange={handleChange}
                    className={`w-full rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                    } border p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                  >
                    <option value="">Select a range</option>
                    <option value="$50,000 - $70,000">$50,000 - $70,000</option>
                    <option value="$70,000 - $90,000">$70,000 - $90,000</option>
                    <option value="$90,000 - $120,000">$90,000 - $120,000</option>
                    <option value="$120,000 - $150,000">$120,000 - $150,000</option>
                    <option value="$150,000+">$150,000+</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>

            {saved && (
              <div className="mt-4 p-3 bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200 rounded-lg text-center">
                Profile saved successfully!
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
} 