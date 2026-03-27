import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export const SocialBadges: React.FC = () => {
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    const fetchIdentities = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.identities) {
        const linkedProviders = user.identities.map(i => i.provider);
        setProviders(Array.from(new Set(linkedProviders)));
      }
    };
    fetchIdentities();
  }, []);

  if (providers.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {providers.map(provider => {
        if (provider === 'google') {
          return (
            <div key="google" className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm text-xs font-medium text-gray-700" title="تم الربط بحساب Google">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-3.5 h-3.5" />
              <span>حساب Google</span>
            </div>
          );
        }
        if (provider === 'facebook') {
          return (
            <div key="facebook" className="flex items-center gap-1.5 px-3 py-1 bg-[#1877F2]/10 border border-[#1877F2]/20 rounded-full text-xs font-medium text-[#1877F2]" title="تم الربط بحساب Facebook">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-3.5 h-3.5 bg-white rounded-full" />
              <span>حساب Facebook</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
