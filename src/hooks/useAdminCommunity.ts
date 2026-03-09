import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface CommunityEvent {
    id: string;
    title: string;
    instructor: string;
    type: 'course' | 'webinar' | 'workshop';
    date: string;
    time: string;
    current_attendees: number;
    max_attendees: number;
    price: number;
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    rating: number;
    description?: string;
    image_url?: string;
    created_at: string;
}

export interface CommunityGroup {
    id: string;
    name: string;
    category: string;
    admin_name: string;
    member_count: number;
    created_at: string;
    is_private: boolean;
}

export interface CommunityUser {
    id: string;
    full_name: string;
    email: string;
    role: string;
    city?: string;
    hospital?: string;
    specialty?: string;
    is_elite?: boolean;
    is_syndicate?: boolean;
    created_at: string;
    avatar_url?: string;
}

export interface CommunityResource {
    id: string;
    title: string;
    url: string;
    type: string;
    category?: string;
    downloads_count: number;
    created_at: string;
}

export interface CommunityModel {
    id: string;
    title: string;
    embed_url: string;
    category?: string;
    thumbnail_url?: string;
    created_at: string;
}


export function useAdminCommunity() {
    const [courses, setCourses] = useState<CommunityEvent[]>([]);
    const [webinars, setWebinars] = useState<CommunityEvent[]>([]);

    // New State
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [users, setUsers] = useState<CommunityUser[]>([]);
    const [resources, setResources] = useState<CommunityResource[]>([]);
    const [models, setModels] = useState<CommunityModel[]>([]);

    const [loading, setLoading] = useState(true);

    const fetchCommunityData = async () => {
        try {
            setLoading(true);

            // 1. Events (Courses/Webinars) - Using 'courses' table with 'type' field
            const { data: eventsData } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (eventsData) {
                const allEvents = eventsData.map(event => ({
                    id: event.id,
                    title: event.title,
                    instructor: event.instructor,
                    type: event.type || (event.category === 'ندوة' ? 'webinar' : 'course'),
                    date: event.date,
                    time: event.time,
                    current_attendees: event.students || 0,
                    max_attendees: event.max_attendees || 100,
                    price: event.price || 0,
                    status: event.status || 'scheduled',
                    rating: event.rating || 5,
                    description: event.description,
                    image_url: event.image || event.thumbnail_url,
                    created_at: event.created_at
                }));
                setCourses(allEvents.filter((e: any) => e.type === 'course'));
                setWebinars(allEvents.filter((e: any) => e.type === 'webinar' || e.type === 'workshop'));
            }

            // 2. Groups - Using 'groups' table
            const { data: groupsData } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
            if (groupsData) setGroups(groupsData.map((g: any) => ({
                ...g,
                admin_name: g.created_by || 'النظام',
                member_count: g.member_count || 0
            })) as CommunityGroup[]);

            // 3. Users (Profiles)
            const { data: usersData } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['doctor', 'lab', 'laboratory', 'supplier', 'admin'])
                .order('created_at', { ascending: false })
                .limit(200);

            if (usersData) {
                // Fetch extra details (logos) in parallel to avoid Join issues
                const userIds = usersData.map((u: any) => u.id);

                const [clinicsRes, labsRes, suppliersRes] = await Promise.all([
                    supabase.from('clinics').select('owner_id, image_url').in('owner_id', userIds),
                    supabase.from('dental_laboratories').select('user_id, logo_url').in('user_id', userIds),
                    supabase.from('suppliers').select('user_id, logo').in('user_id', userIds)
                ]);

                // Create lookup maps
                const clinicMap: Record<string, string> = {};
                clinicsRes.data?.forEach((c: any) => { if (c.owner_id && c.image_url) clinicMap[c.owner_id] = c.image_url; });

                const labMap: Record<string, string> = {};
                labsRes.data?.forEach((l: any) => { if (l.user_id && l.logo_url) labMap[l.user_id] = l.logo_url; });

                const supplierMap: Record<string, string> = {};
                suppliersRes.data?.forEach((s: any) => { if (s.user_id && s.logo) supplierMap[s.user_id] = s.logo; });

                const mappedUsers = usersData
                    .filter((user: any) => !user.banned) // Hide suspended (banned) users
                    .map((user: any) => {
                        // For suppliers: prioritize business logo over community profile avatar
                        const supplierLogo = (user.role === 'supplier') ? supplierMap[user.id] : null;
                        return {
                            ...user,
                            avatar_url: supplierLogo || user.avatar_url || clinicMap[user.id] || labMap[user.id] || supplierMap[user.id]
                        };
                    });
                // Deduplicate by ID to prevent the same account appearing twice
                const uniqueUsers = Array.from(new Map(mappedUsers.map((u: any) => [u.id, u])).values());
                setUsers(uniqueUsers as CommunityUser[]);
            }

            // 4. Resources - Using 'scientific_resources' table
            const { data: resourcesData } = await supabase.from('scientific_resources').select('*').order('created_at', { ascending: false });
            if (resourcesData) setResources(resourcesData.map((r: any) => ({
                ...r,
                downloads_count: r.downloads_count || 0
            })) as CommunityResource[]);

            // 5. Models
            const { data: modelsData } = await supabase.from('models').select('*').order('created_at', { ascending: false });
            if (modelsData) setModels(modelsData as CommunityModel[]);


        } catch (error) {
            console.error('Error fetching community data:', error);
            // toast.error('فشل تحميل بعض بيانات المجتمع'); 
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const addEvent = async (eventData: any) => {
        try {
            const { error } = await supabase.from('courses').insert([eventData]);
            if (error) throw error;
            toast.success('تمت الإضافة بنجاح');
            fetchCommunityData();
            return true;
        } catch (error) {
            toast.error('حدث خطأ');
            return false;
        }
    };

    // Generic update/delete would be cleaner but let's be explicit for safety
    const updateEvent = async (id: string, updates: any) => {
        try {
            const { error } = await supabase.from('courses').update(updates).eq('id', id);
            if (error) throw error;
            toast.success('تم التحديث بنجاح');
            fetchCommunityData();
            return true;
        } catch (error) { return false; }
    };

    const deleteEvent = async (id: string) => {
        try {
            const { error } = await supabase.from('courses').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم الحذف بنجاح');
            fetchCommunityData();
            return true;
        } catch (error) { return false; }
    };

    // --- Sub-Managers Actions ---

    // Resources - Using 'scientific_resources' table
    const addResource = async (data: any) => {
        try {
            const { error } = await supabase.from('scientific_resources').insert([data]);
            if (error) throw error;
            toast.success('تم إضافة المصدر');
            fetchCommunityData();
            return true;
        } catch (error) { toast.error('خطأ في الإضافة'); return false; }
    };
    const deleteResource = async (id: string) => {
        const { error } = await supabase.from('scientific_resources').delete().eq('id', id);
        if (!error) { toast.success('تم الحذف'); fetchCommunityData(); return true; }
        return false;
    };

    // Models
    const addModel = async (data: any) => {
        try {
            const { error } = await supabase.from('models').insert([data]);
            if (error) throw error;
            toast.success('تم إضافة النموذج');
            fetchCommunityData();
            return true;
        } catch (error) { toast.error('خطأ في الإضافة'); return false; }
    };
    const deleteModel = async (id: string) => {
        const { error } = await supabase.from('models').delete().eq('id', id);
        if (!error) { toast.success('تم الحذف'); fetchCommunityData(); return true; }
        return false;
    };

    // Groups - Using 'groups' table
    const deleteGroup = async (id: string) => {
        const { error } = await supabase.from('groups').delete().eq('id', id);
        if (!error) { toast.success('تم حذف المجموعة'); fetchCommunityData(); return true; }
        return false;
    };

    const verifyGroup = async (id: string) => {
        const { error } = await supabase.from('groups').update({ is_verified: true }).eq('id', id);
        if (!error) { toast.success('تم توثيق المجموعة'); fetchCommunityData(); return true; }
        return false;
    };

    const updateUserStatus = async (userId: string, updates: any) => {
        const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
        if (!error) { toast.success('تم التحديث بنجاح'); fetchCommunityData(); return true; }
        return false;
    };


    useEffect(() => {
        fetchCommunityData();
    }, []);

    return {
        courses,
        webinars,
        groups,
        users,
        resources,
        models,
        loading,
        addEvent,
        updateEvent,
        deleteEvent,
        // New exports
        addResource,
        deleteResource,
        addModel,
        deleteModel,
        deleteGroup,
        verifyGroup,
        updateUserStatus,
        refresh: fetchCommunityData
    };
}
