import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLocalCache } from '../hooks/useLocalCache';

interface PlatformSettings {
    contact_email?: string;
    support_phone?: string;
    platform_fee_percentage?: number;
    logo_url?: string;
    platform_title_ar?: string;
    platform_name_en?: string;
    footer_text?: string;
}

interface PlatformContextType {
    settings: PlatformSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType>({
    settings: {},
    loading: true,
    refreshSettings: async () => { },
});

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<PlatformSettings>({});
    const [loading, setLoading] = useState(true);
    const cache = useLocalCache();

    const fetchSettings = async () => {
        // Load from cache first for instant offline display
        const cached = cache.get<PlatformSettings>('platform_settings');
        if (cached) {
            setSettings(cached);
            setLoading(false);
        }

        try {
            const { data, error } = await supabase
                .from('admin_settings')
                .select('value')
                .eq('key', 'platform_config')
                .single();

            if (data) {
                setSettings(data.value);
                // Cache for 1 hour (3600s)
                cache.set('platform_settings', data.value, 3600);
            }
        } catch (error) {
            console.error('Error fetching platform settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <PlatformContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </PlatformContext.Provider>
    );
};

export const usePlatform = () => useContext(PlatformContext);
