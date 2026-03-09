
export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'date' | 'table';
    options?: string[]; // For select
    columns?: { id: string; label: string; type: 'text' | 'number' | 'select'; options?: string[] }[]; // For table
    placeholder?: string;
    required?: boolean;
    defaultValue?: any;
    unit?: string; // e.g., 'mm', 'Ncm'
    visibleIf?: { fieldId: string; value: any }; // Conditional rendering logic
}

export interface SessionSchema {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
}

export const ClinicalSchemas: Record<string, SessionSchema> = {
    // --- Endodontic Schemas ---
    // --- Endodontic Schemas ---
    'endo_access': {
        id: 'endo_access',
        title: 'Access Opening & Diagnosis',
        fields: [
            { id: 'pulp_status', label: 'Pulp Status', type: 'select', options: ['Vital', 'Necrotic', 'Previously Treated', 'Irreversible Pulpitis'], required: true },
            { id: 'anesthesia', label: 'Anesthesia', type: 'select', options: ['Infiltration', 'Block', 'Intraligamentary', 'None'], required: true },
            { id: 'isolation', label: 'Isolation', type: 'select', options: ['Rubber Dam', 'Cotton Rolls', 'Split Dam'], required: true },
            { id: 'access_notes', label: 'Access Difficulty', type: 'select', options: ['Normal', 'Calcified', 'Pulp Stones', 'Restricted Opening'] },
            {
                id: 'canals_data',
                label: 'Identified Canals & Initial WL',
                type: 'table',
                columns: [
                    { id: 'name', label: 'Canal', type: 'select', options: ['MB', 'MB1', 'MB2', 'DB', 'P', 'D', 'DL', 'All'] },
                    { id: 'wl', label: 'Working Length (mm)', type: 'number' },
                    { id: 'ref', label: 'Ref Point', type: 'text' },
                    { id: 'patency', label: 'Patency', type: 'select', options: ['Yes', 'No'] }
                ],
                defaultValue: [{ name: 'MB', wl: '', ref: '', patency: 'Yes' }]
            }
        ]
    },
    'endo_cleaning': {
        id: 'endo_cleaning',
        title: 'Cleaning & Shaping',
        fields: [
            { id: 'rotary_system', label: 'Rotary/File System', type: 'select', options: ['ProTaper Gold', 'WaveOne Gold', 'Reciproc Blue', 'Manual K-Files', 'Protaper Next'], required: true },
            {
                id: 'canal_prep',
                label: 'Instrumentation Details (Syncs from Session 1)',
                type: 'table',
                columns: [
                    { id: 'name', label: 'Canal', type: 'select', options: ['MB', 'MB1', 'MB2', 'DB', 'P', 'D', 'DL'] },
                    { id: 'wl', label: 'Confirmed WL (mm)', type: 'number' },
                    { id: 'size', label: 'Master File Size', type: 'text' },
                    { id: 'taper', label: 'Taper (%)', type: 'text' }
                ]
            },
            { id: 'irrigation', label: 'Irrigation Protocol', type: 'select', options: ['NaOCl 5.25% + EDTA', 'NaOCl Only', 'Chlorhexidine', 'Saline'] },
            { id: 'activation', label: 'Activation', type: 'select', options: ['Sonic (EndoActivator)', 'Ultrasonic (PUI)', 'Manual Agitation', 'None'] },
            { id: 'medicament', label: 'Intracanal Medicament', type: 'select', options: ['Ca(OH)2 (UltraCal)', 'Metapex', 'Ledermix', 'None', 'Cotton Pellet'] }
        ]
    },
    'endo_fill': {
        id: 'endo_fill',
        title: 'Obturation (Filling)',
        fields: [
            { id: 'technique', label: 'Obturation Technique', type: 'select', options: ['Warm Vertical (System B)', 'Cold Lateral Compaction', 'Single Cone (Bioceramic)', 'Carrier-based (Thermafil)'], required: true },
            { id: 'sealer', label: 'Sealer Used', type: 'select', options: ['Resin (AH Plus)', 'Bioceramic (BioRoot/TotalFill)', 'Zinc Oxide Eugenol', 'MTA Based'], required: true },
            {
                id: 'obturation_data',
                label: 'Obturation Details (Syncs from Session 2)',
                type: 'table',
                columns: [
                    { id: 'name', label: 'Canal', type: 'select', options: ['MB', 'MB1', 'MB2', 'DB', 'P', 'D', 'DL'] },
                    { id: 'cone_size', label: 'Master Cone Size', type: 'text' },
                    { id: 'length', label: 'Obturation Length', type: 'number' },
                    { id: 'tugback', label: 'Tug-back', type: 'select', options: ['Good', 'Weak', 'None'] }
                ]
            },
            { id: 'post_space', label: 'Post Space Prepared?', type: 'boolean', defaultValue: false }
        ]
    },
    'endo_final_restoration': {
        id: 'endo_final_restoration',
        title: 'Final Restoration',
        fields: [
            { id: 'restoration_type', label: 'Restoration Type', type: 'select', options: ['Crown (Prosthetic)', 'Direct Filling (Restorative)', 'Post & Core'], required: true },

            // Logic: Visible if Type == Crown
            { id: 'crown_material', label: 'Crown Material', type: 'select', options: ['Zirconia', 'E-Max', 'PFM', 'Gold', 'Temporary'], visibleIf: { fieldId: 'restoration_type', value: 'Crown (Prosthetic)' } },
            { id: 'shade', label: 'Shade', type: 'text', visibleIf: { fieldId: 'restoration_type', value: 'Crown (Prosthetic)' } },

            // Logic: Visible if Type == Direct Filling
            { id: 'filling_material', label: 'Filling Material', type: 'select', options: ['Composite (Bulk Fill)', 'Composite (Layering)', 'Amalgam', 'GIC'], visibleIf: { fieldId: 'restoration_type', value: 'Direct Filling (Restorative)' } },
            { id: 'bonding_agent', label: 'Bonding Agent', type: 'text', visibleIf: { fieldId: 'restoration_type', value: 'Direct Filling (Restorative)' } },

            // Logic: Visible if Type == Post & Core
            { id: 'post_type', label: 'Post Type', type: 'select', options: ['Fiber Post', 'Metal Post', 'Cast Post'], visibleIf: { fieldId: 'restoration_type', value: 'Post & Core' } },
            { id: 'core_material', label: 'Core Build-up Material', type: 'select', options: ['Dual Cure Composite', 'Light Cure Composite', 'Core Paste'], visibleIf: { fieldId: 'restoration_type', value: 'Post & Core' } }
        ]
    },

    // --- Implant Schemas ---
    'implant_surgery': {
        id: 'implant_surgery',
        title: 'Surgical Placement',
        fields: [
            { id: 'system', label: 'Implant System', type: 'select', options: ['Straumann', 'Nobel Biocare', 'BioHorizons', 'Zimmer', 'Osstem'], required: true },
            { id: 'type', label: 'Implant Type', type: 'select', options: ['Bone Level', 'Tissue Level'] },
            { id: 'diameter', label: 'Diameter (mm)', type: 'select', options: ['3.0', '3.3', '3.5', '3.75', '4.0', '4.3', '4.5', '5.0', '5.5', '6.0'], required: true },
            { id: 'length', label: 'Length (mm)', type: 'select', options: ['6', '8', '8.5', '10', '11.5', '13', '15', '16'], required: true },
            { id: 'bone_density', label: 'Bone Density', type: 'select', options: ['D1 (Hard)', 'D2', 'D3', 'D4 (Soft)'] },
            { id: 'torque', label: 'Final Insertion Torque (Ncm)', type: 'number', unit: 'Ncm', required: true },
            { id: 'isq', label: 'Primary Stability (ISQ)', type: 'number' },
            { id: 'bone_graft', label: 'Bone Grafting?', type: 'select', options: ['None', 'Socket Preservation', 'Sinus Lift', 'GBR'] },
            { id: 'membrane', label: 'Membrane Used?', type: 'select', options: ['None', 'Collagen Resorbable', 'PTFE Non-Resorbable'], visibleIf: { fieldId: 'bone_graft', value: 'GBR' } }
        ]
    },
    'implant_loading': {
        id: 'implant_loading',
        title: 'Uncovering & Loading',
        fields: [
            { id: 'healing_time', label: 'Healing Time (Weeks)', type: 'number' },
            { id: 'healing_status', label: 'Soft Tissue Status', type: 'select', options: ['Healthy', 'Inflamed', 'Overgrowth', 'Recession'] },
            { id: 'isq_secondary', label: 'Secondary ISQ', type: 'number' },
            { id: 'procedure', label: 'Procedure', type: 'select', options: ['Healing Abutment Placement', 'Temporary Crown', 'Final Impression'] },
            { id: 'healing_abutment', label: 'Healing Abutment Size', type: 'text', placeholder: 'e.g., 4.5 x 3mm', visibleIf: { fieldId: 'procedure', value: 'Healing Abutment Placement' } }
        ]
    },

    // --- Prosthetic Schemas ---
    'prosthetic_prep': {
        id: 'prosthetic_prep',
        title: 'Preparation',
        fields: [
            { id: 'type', label: 'Prosthesis Type', type: 'select', options: ['Crown', 'Bridge', 'Veneer', 'Inlay/Onlay'], required: true },
            { id: 'material', label: 'Planned Material', type: 'select', options: ['Zirconia', 'E-Max', 'PFM', 'Gold', 'Acetal'] },
            { id: 'finish_line', label: 'Finish Line Design', type: 'select', options: ['Deep Chamfer', 'Light Chamfer', 'Shoulder', 'Feather Edge'] },
            { id: 'occlusal_reduction', label: 'Occlusal Reduction (mm)', type: 'number', unit: 'mm' },
            { id: 'shade_body', label: 'Shade (Body)', type: 'text', placeholder: 'e.g., A2' },
            { id: 'shade_stump', label: 'Stump Shade', type: 'text', placeholder: 'e.g., ND2 (for E-Max)' }
        ]
    },
    'prosthetic_impression': {
        id: 'prosthetic_impression',
        title: 'Impression',
        fields: [
            { id: 'method', label: 'Impression Method', type: 'select', options: ['Digital Intraoral Scan', 'PVS Putty/Wash', 'Polyether'] },
            { id: 'retraction', label: 'Gingival Retraction', type: 'select', options: ['Double Cord', 'Single Cord', 'Paste', 'Laser'] },
            { id: 'bite_reg', label: 'Bite Registration', type: 'select', options: ['Silicon', 'Wax', 'Digital'] },
            { id: 'lab_sent', label: 'Sent to Lab?', type: 'boolean', defaultValue: true }
        ]
    },
    'prosthetic_delivery': {
        id: 'prosthetic_delivery',
        title: 'Cementation',
        fields: [
            {
                id: 'try_in', label: 'Try-in Verification', type: 'table', columns: [
                    { id: 'check', label: 'Checklist', type: 'text' },
                    { id: 'status', label: 'Status', type: 'select', options: ['Pass', 'Adjusted', 'Fail'] }
                ], defaultValue: [{ check: 'Marginal Fit', status: 'Pass' }, { check: 'Proximal Contacts', status: 'Pass' }, { check: 'Occlusion', status: 'Pass' }, { check: 'Esthetics', status: 'Pass' }]
            },
            { id: 'cement', label: 'Cement Used', type: 'select', options: ['Resin (RelyX)', 'GIC (Fuji)', 'Zinc Phosphate', 'TempBond'] }
        ]
    },

    // --- Ortho Schemas ---
    'ortho_visit': {
        id: 'ortho_visit',
        title: 'Ortho Adjustment',
        fields: [
            { id: 'arch', label: 'Arch', type: 'select', options: ['Upper', 'Lower', 'Both'] },
            { id: 'wire_change', label: 'Wire Change?', type: 'boolean' },
            { id: 'wire_size', label: 'New Wire Size', type: 'select', options: ['012 NiTi', '014 NiTi', '016 NiTi', '018 NiTi', '16x22 NiTi', '17x25 SS', '19x25 SS'], visibleIf: { fieldId: 'wire_change', value: true } },
            { id: 'elastics', label: 'Elastics Prescribed', type: 'select', options: ['None', 'Class II (1/4)', 'Class III (3/16)', 'Box', 'Triangle'] },
            { id: 'notes', label: 'Progress Notes', type: 'textarea' }
        ]
    },

    // --- Surgery ---
    'extraction_surgical': {
        id: 'extraction_surgical',
        title: 'Surgical Extraction',
        fields: [
            { id: 'flap', label: 'Flap Design', type: 'select', options: ['Envelope', 'Three-Cornered', 'None'] },
            { id: 'bone_removal', label: 'Bone Removal?', type: 'boolean' },
            { id: 'sectioning', label: 'Tooth Sectioning?', type: 'boolean' },
            { id: 'suture', label: 'Sutures', type: 'select', options: ['Silk 3-0', 'Silk 4-0', 'Vicryl 3-0', 'Vicryl 4-0', 'None'] },
            { id: 'hemostasis', label: 'Hemostasis Achieved?', type: 'boolean', required: true }
        ]
    },

    // --- General/Fillings ---
    'restoration': {
        id: 'restoration',
        title: 'Restoration',
        fields: [
            { id: 'cavity_class', label: 'Cavity Class', type: 'select', options: ['I', 'II', 'III', 'IV', 'V'] },
            { id: 'liner', label: 'Liner/Base', type: 'text', placeholder: 'e.g., Dycal, GIC' },
            { id: 'etch_bond', label: 'Etch & Bond', type: 'boolean', defaultValue: true },
            { id: 'composite_shade', label: 'Composite Shade', type: 'text', placeholder: 'e.g., A2' },
            { id: 'curing_time', label: 'Curing Time (sec)', type: 'number', defaultValue: 20 }
        ]
    }
};
