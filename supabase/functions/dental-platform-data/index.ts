// Public data endpoint for the ElevenLabs voice agent (Server Tools / Webhooks).
// Lets the agent know the REAL specialties, governorates, and clinics
// stored in the platform — so it never invents names.
//
// Routes (GET):
//   /specialties                    -> { specialties: [...] }
//   /governorates                   -> { governorates: [...] }   (only those that have clinics)
//   /clinics?governorate=بغداد&specialty=تقويم  -> { count, clinics: [...] }
//   /clinic-names?governorate=بغداد           -> { names: [...] }  (lightweight, for TTS pronunciation)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, xi-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

// External platform DB (same one used by the React app)
const SUPABASE_URL = 'https://nhueyaeyutfmadbgghfe.supabase.co'
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Canonical Iraqi governorates
const CANONICAL_GOVS = [
    'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'ديالى',
    'كركوك', 'ذي قار', 'ميسان', 'المثنى', 'الأنبار', 'بابل',
    'صلاح الدين', 'واسط', 'القادسية', 'دهوك', 'السليمانية',
]

// Aliases (English / city / variants) -> canonical
const GOV_ALIASES: Record<string, string> = {
    'baghdad': 'بغداد', 'بغداد محافظة': 'بغداد', 'محافظة بغداد': 'بغداد',
    'basra': 'البصرة', 'basrah': 'البصرة', 'بصرة': 'البصرة', 'البصرة محافظة': 'البصرة',
    'mosul': 'نينوى', 'الموصل': 'نينوى', 'موصل': 'نينوى', 'ninawa': 'نينوى', 'nineveh': 'نينوى',
    'erbil': 'أربيل', 'arbil': 'أربيل', 'هولير': 'أربيل', 'اربيل': 'أربيل',
    'najaf': 'النجف', 'النجف محافظة': 'النجف',
    'karbala': 'كربلاء', 'kerbala': 'كربلاء',
    'diyala': 'ديالى', 'بعقوبة': 'ديالى',
    'kirkuk': 'كركوك', 'كركوك محافظة': 'كركوك',
    'thiqar': 'ذي قار', 'dhi qar': 'ذي قار', 'الناصرية': 'ذي قار', 'ناصرية': 'ذي قار',
    'maysan': 'ميسان', 'missan': 'ميسان', 'العمارة': 'ميسان', 'عمارة': 'ميسان',
    'muthanna': 'المثنى', 'السماوة': 'المثنى', 'سماوة': 'المثنى',
    'anbar': 'الأنبار', 'الانبار': 'الأنبار', 'الرمادي': 'الأنبار', 'رمادي': 'الأنبار', 'الفلوجة': 'الأنبار',
    'babil': 'بابل', 'babylon': 'بابل', 'الحلة': 'بابل', 'حلة': 'بابل',
    'saladin': 'صلاح الدين', 'salahuddin': 'صلاح الدين', 'salah al-din': 'صلاح الدين',
    'تكريت': 'صلاح الدين', 'سامراء': 'صلاح الدين', 'صلاح الدين محافظة': 'صلاح الدين',
    'wasit': 'واسط', 'الكوت': 'واسط', 'كوت': 'واسط',
    'qadisiyyah': 'القادسية', 'qadisiya': 'القادسية', 'الديوانية': 'القادسية', 'ديوانية': 'القادسية',
    'duhok': 'دهوك', 'dohuk': 'دهوك',
    'sulaymaniyah': 'السليمانية', 'sulaimaniyah': 'السليمانية', 'السليمانيه': 'السليمانية',
}

function normalizeGovernorate(raw?: string | null): string | null {
    if (!raw) return null
    const s = raw.trim().toLowerCase()
    // direct alias
    if (GOV_ALIASES[s]) return GOV_ALIASES[s]
    // canonical match (case-insensitive on Arabic too)
    for (const g of CANONICAL_GOVS) {
        if (raw.includes(g) || g.includes(raw.trim())) return g
    }
    // alias contains
    for (const [alias, canonical] of Object.entries(GOV_ALIASES)) {
        if (s.includes(alias) || alias.includes(s)) return canonical
    }
    return null
}

const SPECIALTIES = [
    { id: 'general', label: 'طب أسنان عام', keys: ['عام', 'كشف', 'general', 'أسنان عام'] },
    { id: 'ortho', label: 'تقويم الأسنان', keys: ['تقويم', 'orthodontic'] },
    { id: 'kids', label: 'طب أسنان أطفال', keys: ['أطفال', 'اطفال', 'pediatric'] },
    { id: 'root', label: 'علاج الجذور', keys: ['جذور', 'root canal', 'علاج الجذور', 'عصب'] },
    { id: 'gum', label: 'لثة وأنسجة داعمة', keys: ['لثة', 'periodontal', 'اللثة'] },
    { id: 'implant', label: 'زراعة الأسنان', keys: ['زراعة', 'implant'] },
    { id: 'surgery', label: 'جراحة وجه وفكين', keys: ['جراحة', 'فكين', 'surgery'] },
    { id: 'cosmetic', label: 'تجميل الأسنان', keys: ['تجميل', 'تبييض', 'cosmetic', 'فينير'] },
]

function matchSpecialty(input?: string | null) {
    if (!input) return null
    const s = input.toLowerCase().trim()
    return SPECIALTIES.find(sp =>
        sp.id === s ||
        sp.label === input ||
        sp.keys.some(k => s.includes(k.toLowerCase()) || k.toLowerCase().includes(s))
    ) || null
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

    try {
        const url = new URL(req.url)
        // edge function path is /functions/v1/dental-platform-data/<route>
        const path = url.pathname.split('/').filter(Boolean).pop() || ''

        if (path === 'specialties' || path === 'dental-platform-data') {
            // root or /specialties -> return list
            if (path === 'dental-platform-data' && url.searchParams.size === 0) {
                return json({
                    ok: true,
                    routes: ['specialties', 'governorates', 'clinics', 'clinic-names'],
                })
            }
            return json({
                specialties: SPECIALTIES.map(({ id, label }) => ({ id, label })),
            })
        }

        if (path === 'governorates') {
            const { data, error } = await supabase
                .from('clinics')
                .select('governorate')
                .eq('is_active', true)
            if (error) throw error
            const present = new Set<string>()
            for (const row of data || []) {
                const g = normalizeGovernorate(row.governorate as string | null)
                if (g) present.add(g)
            }
            return json({
                governorates: Array.from(present).sort(),
                all_supported: CANONICAL_GOVS,
            })
        }

        if (path === 'clinic-names') {
            const govParam = url.searchParams.get('governorate')
            const gov = normalizeGovernorate(govParam)
            const { data, error } = await supabase
                .from('clinics')
                .select('name, governorate')
                .eq('is_active', true)
                .limit(200)
            if (error) throw error
            const filtered = gov
                ? (data || []).filter(c => normalizeGovernorate(c.governorate as string) === gov)
                : (data || [])
            return json({
                governorate: gov,
                count: filtered.length,
                names: filtered.map(c => c.name),
            })
        }

        if (path === 'clinics') {
            const govParam = url.searchParams.get('governorate')
            const specParam = url.searchParams.get('specialty')
            const gov = normalizeGovernorate(govParam)
            const spec = matchSpecialty(specParam)

            const { data, error } = await supabase
                .from('clinics')
                .select('id, name, governorate, address, phone, specialties, services, rating, image_url')
                .eq('is_active', true)
                .limit(200)
            if (error) throw error

            let list = (data || [])
            if (gov) list = list.filter(c => normalizeGovernorate(c.governorate as string) === gov)
            if (spec) {
                const keys = spec.keys.map(k => k.toLowerCase())
                const matched = list.filter((c: any) => {
                    const all = [
                        ...((c.specialties as string[]) || []),
                        ...((c.services as string[]) || []),
                    ].map(x => String(x).toLowerCase())
                    return all.some(s => keys.some(k => s.includes(k) || k.includes(s)))
                })
                if (matched.length > 0) list = matched
            }

            return json({
                governorate: gov,
                specialty: spec?.label || null,
                count: list.length,
                clinics: list.slice(0, 12).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    governorate: normalizeGovernorate(c.governorate as string) || c.governorate,
                    address: c.address,
                    phone: c.phone,
                    rating: c.rating,
                    specialties: c.specialties || [],
                })),
            })
        }

        return json({ error: 'unknown route', path }, 404)
    } catch (e: any) {
        return json({ error: e?.message || 'internal_error' }, 500)
    }
})
