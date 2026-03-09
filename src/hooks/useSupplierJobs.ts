import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SupplierJob {
    id: string;
    title: string;
    type: string;
    location: string;
    salary: string;
    description: string;
    requirements: string[];
    postedDate: string;
    expiresDate: string;
    applicantsCount: number;
    status: 'active' | 'closed' | 'draft';
}

const MOCK_JOBS: SupplierJob[] = [
    {
        id: 'JOB001',
        title: 'مندوب مبيعات طبي',
        type: 'دوام كامل',
        location: 'بغداد - المنصور',
        salary: '1,500,000 د.ع',
        description: 'نبحث عن مندوب مبيعات ذو خبرة في مجال الأجهزة الطبية',
        requirements: ['بكالوريوس صيدلة أو هندسة طبية', 'خبرة سنتين', 'لغة إنجليزية جيدة'],
        postedDate: '2025-11-01',
        expiresDate: '2025-12-01',
        applicantsCount: 12,
        status: 'active'
    },
    {
        id: 'JOB002',
        title: 'موظف مخازن',
        type: 'دوام كامل',
        location: 'بغداد - المخازن المركزية',
        salary: '800,000 د.ع',
        description: 'مسؤول عن إدارة المخزون وتنظيم الطلبات',
        requirements: ['شهادة إعدادية كحد أدنى', 'خبرة في برامج المخازن', 'قدرة على تحمل ضغط العمل'],
        postedDate: '2025-11-05',
        expiresDate: '2025-12-05',
        applicantsCount: 5,
        status: 'active'
    }
];

export const useSupplierJobs = () => {
    const [jobs, setJobs] = useState<SupplierJob[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            // Mock fetch
            setJobs(MOCK_JOBS);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const addJob = async (job: Omit<SupplierJob, 'id' | 'postedDate' | 'applicantsCount'>) => {
        try {
            const newJob: SupplierJob = {
                ...job,
                id: `JOB${Date.now()}`,
                postedDate: new Date().toISOString().split('T')[0],
                applicantsCount: 0,
                status: 'active'
            };
            setJobs(prev => [newJob, ...prev]);
            // API call placeholder
            /*
            await supabase.from('supplier_jobs').insert(newJob);
            */
        } catch (error) {
            console.error('Error adding job:', error);
        }
    };

    const deleteJob = async (id: string) => {
        try {
            setJobs(prev => prev.filter(job => job.id !== id));
            // API call placeholder
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    return {
        jobs,
        loading,
        addJob,
        deleteJob,
        refresh: fetchJobs
    };
};
