import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Interfaces
export interface Job {
    id: string;
    title: string;
    companyName: string;
    governorate: string;
    district: string;
    category: string;
    type: string;
    salary: string;
    experience: string;
    description: string;
    requirements: string[];
    contactEmail: string;
    contactPhone: string;
    sponsorshipLevel: 'premium' | 'gold' | 'basic';
    status: 'active' | 'expired' | 'draft';
    isFeatured: boolean;
    applicationsCount: number;
    viewsCount: number;
    createdAt: string;
}

export interface JobStats {
    totalJobs: number;
    featuredJobs: number;
    totalApplications: number;
    avgApplicationsPerJob: number;
    topCategories: { category: string; count: number; percentage: number }[];
    topGovernorates: { governorate: string; count: number; percentage: number }[];
    monthlyTrends: { month: string; jobs: number; applications: number }[];
}

export function useAdminJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [stats, setStats] = useState<JobStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchJobsData = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedJobs: Job[] = (data || []).map(j => ({
                id: j.id,
                title: j.title,
                companyName: j.company_name,
                governorate: j.governorate,
                district: j.district,
                category: j.category,
                type: j.type,
                salary: j.salary,
                experience: j.experience,
                description: j.description,
                requirements: j.requirements || [],
                contactEmail: j.contact_email,
                contactPhone: j.contact_phone,
                sponsorshipLevel: j.sponsorship_level || 'basic',
                status: j.status,
                isFeatured: j.is_featured || false,
                applicationsCount: j.applications_count || 0,
                viewsCount: j.views_count || 0,
                createdAt: j.created_at
            }));

            setJobs(mappedJobs);

            // Calculate Stats
            const totalJobs = mappedJobs.length;
            const featuredCount = mappedJobs.filter(j => j.isFeatured || j.sponsorshipLevel === 'premium').length;
            const totalApps = mappedJobs.reduce((acc, j) => acc + j.applicationsCount, 0);

            // Simple distribution stats (mocking detailed ones for now or calculating on fly)
            const categoriesCheck = mappedJobs.reduce((acc: any, j) => {
                acc[j.category] = (acc[j.category] || 0) + 1;
                return acc;
            }, {});

            const topCategories = Object.keys(categoriesCheck).map(k => ({
                category: k,
                count: categoriesCheck[k],
                percentage: Math.round((categoriesCheck[k] / totalJobs) * 100) || 0
            })).sort((a, b) => b.count - a.count).slice(0, 4);

            const govCheck = mappedJobs.reduce((acc: any, j) => {
                acc[j.governorate] = (acc[j.governorate] || 0) + 1;
                return acc;
            }, {});

            const topGovernorates = Object.keys(govCheck).map(k => ({
                governorate: k,
                count: govCheck[k],
                percentage: Math.round((govCheck[k] / totalJobs) * 100) || 0
            })).sort((a, b) => b.count - a.count).slice(0, 4);

            setStats({
                totalJobs,
                featuredJobs: featuredCount,
                totalApplications: totalApps,
                avgApplicationsPerJob: totalJobs ? Math.round(totalApps / totalJobs) : 0,
                topCategories,
                topGovernorates,
                monthlyTrends: [] // Can be calculated if needed
            });

        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const addJob = async (jobData: any) => {
        try {
            const dbJob = {
                title: jobData.title,
                company_name: jobData.companyName,
                governorate: jobData.governorate,
                district: jobData.district,
                category: jobData.category,
                type: jobData.type,
                salary: jobData.salary,
                experience: jobData.experience,
                description: jobData.description,
                requirements: jobData.requirements || [],
                contact_email: jobData.contactEmail,
                contact_phone: jobData.contactPhone,
                sponsorship_level: jobData.sponsorshipLevel || 'basic',
                status: 'active',
                is_featured: jobData.sponsorshipLevel === 'premium' // Auto feature premiums
            };

            const { data, error } = await supabase
                .from('jobs')
                .insert([dbJob])
                .select()
                .single();

            if (error) throw error;

            fetchJobsData(); // Refresh list match perfectly
        } catch (err) {
            console.error('Error adding job:', err);
        }
    };

    const deleteJob = async (id: string) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setJobs(prev => prev.filter(j => j.id !== id));
        } catch (err) {
            console.error('Error deleting job:', err);
        }
    };

    useEffect(() => {
        fetchJobsData();
    }, []);

    return {
        jobs,
        stats,
        loading,
        addJob,
        deleteJob,
        refresh: fetchJobsData
    };
}
