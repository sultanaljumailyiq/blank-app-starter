import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_settings')
                .select('value')
                .eq('key', 'platform_config')
                .single();

            if (data) {
                setSettings(data.value);
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
