import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Asset {
    id: string;
    clinicId: string;
    name: string;
    description?: string;
    category: 'equipment' | 'furniture' | 'electronics' | 'software' | 'building' | 'other';
    purchaseDate: string;
    purchaseCost: number;
    currency: string;
    usefulLifeYears: number;
    salvageValue: number;
    status: 'active' | 'maintenance' | 'disposed' | 'sold' | 'written_off';
    location?: string;
    serialNumber?: string;
    supplier?: string;
    warrantyExpiry?: string;

    // Computed
    currentValue?: number;
    accumulatedDepreciation?: number;
    dailyDepreciation?: number;
}

export const useAssets = (clinicId?: string) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalValue: 0,
        totalCost: 0,
        totalDepreciation: 0,
        assetCount: 0
    });

    useEffect(() => {
        if (clinicId) {
            fetchAssets();
        }
    }, [clinicId]);

    const calculateDepreciation = (asset: Asset) => {
        const purchaseDate = new Date(asset.purchaseDate);
        const now = new Date();
        const lifeInDays = asset.usefulLifeYears * 365;
        const daysSincePurchase = Math.max(0, Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)));

        // Straight Line Depreciation
        // (Cost - Salvage) / Life
        const depreciableAmount = asset.purchaseCost - (asset.salvageValue || 0);
        const dailyDepreciation = depreciableAmount / lifeInDays;

        let accumulatedDepreciation = dailyDepreciation * daysSincePurchase;

        // Cap at depreciable amount
        if (accumulatedDepreciation > depreciableAmount) accumulatedDepreciation = depreciableAmount;

        const currentValue = asset.purchaseCost - accumulatedDepreciation;

        return {
            currentValue,
            accumulatedDepreciation,
            dailyDepreciation
        };
    };

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .eq('clinic_id', clinicId || 0)
                .order('purchase_date', { ascending: false });

            if (error) throw error;

            let totalValue = 0;
            let totalCost = 0;
            let totalDepreciation = 0;

            const mappedAssets: Asset[] = (data || []).map((a: any) => {
                const baseAsset: Asset = {
                    id: a.id,
                    clinicId: a.clinic_id.toString(),
                    name: a.name,
                    description: a.description,
                    category: a.category,
                    purchaseDate: a.purchase_date,
                    purchaseCost: parseFloat(a.purchase_cost),
                    currency: a.currency,
                    usefulLifeYears: a.useful_life_years,
                    salvageValue: parseFloat(a.salvage_value || 0),
                    status: a.status,
                    location: a.location,
                    serialNumber: a.serial_number,
                    supplier: a.supplier,
                    warrantyExpiry: a.warranty_expiry
                };

                const dep = calculateDepreciation(baseAsset);

                // Aggregate Stats
                if (baseAsset.status === 'active' || baseAsset.status === 'maintenance') {
                    totalValue += dep.currentValue;
                    totalCost += baseAsset.purchaseCost;
                    totalDepreciation += dep.accumulatedDepreciation;
                }

                return {
                    ...baseAsset,
                    ...dep
                };
            });

            setAssets(mappedAssets);
            setStats({
                totalValue,
                totalCost,
                totalDepreciation,
                assetCount: mappedAssets.length
            });

        } catch (err) {
            console.error('Error fetching assets:', err);
        } finally {
            setLoading(false);
        }
    };

    const addAsset = async (asset: Omit<Asset, 'id' | 'currentValue' | 'accumulatedDepreciation' | 'dailyDepreciation'>) => {
        try {
            // Snake Case for DB
            const dbAsset = {
                clinic_id: clinicId || 0,
                name: asset.name,
                description: asset.description,
                category: asset.category,
                purchase_date: asset.purchaseDate,
                purchase_cost: asset.purchaseCost,
                useful_life_years: asset.usefulLifeYears,
                salvage_value: asset.salvageValue,
                status: asset.status,
                location: asset.location,
                serial_number: asset.serialNumber,
                supplier: asset.supplier,
                warranty_expiry: asset.warrantyExpiry
            };

            const { data, error } = await supabase.from('assets').insert(dbAsset).select().single();
            if (error) throw error;

            fetchAssets();
            return data;
        } catch (err) {
            console.error('Error adding asset:', err);
            throw err;
        }
    };

    const deleteAsset = async (id: string) => {
        try {
            const { error } = await supabase.from('assets').delete().eq('id', id);
            if (error) throw error;
            setAssets(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting asset:', err);
            throw err;
        }
    }

    return {
        assets,
        loading,
        stats,
        addAsset,
        deleteAsset,
        refresh: fetchAssets
    };
};
