import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, UploadIcon } from './icons';

interface UserProfile {
  name: string;
  company: string;
  image: string | null;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSave: (newProfile: UserProfile) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, currentUser, onSave }) => {
  const [profileData, setProfileData] = useState<UserProfile>(currentUser);
  const [imagePreview, setImagePreview] = useState<string | null>(currentUser.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProfileData(currentUser);
      setImagePreview(currentUser.image);
    }
  }, [isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...profileData, image: imagePreview });
  };

  const getUserInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" className="h-32 w-32 rounded-full object-cover" />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-4xl">
                    {getUserInitials(profileData.name)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity">
                  <UploadIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <button type="button" onClick={triggerFileSelect} className="mt-4 text-sm font-semibold text-[#e9a7fb] hover:text-[#d356f8]">
                Change Photo
              </button>
            </div>
            
            <div>
              <label className="block text-base font-medium text-gray-300">Full Name</label>
              <input type="text" name="name" value={profileData.name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" required />
            </div>
             <div>
              <label className="block text-base font-medium text-gray-300">Company</label>
              <input type="text" name="company" value={profileData.company} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
            </div>
          </div>
          <div className="bg-black px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-[#d356f8] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;