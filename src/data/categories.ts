export interface Category {
    id: string;
    name: string;
    subCategories: SubCategory[];
}

export interface SubCategory {
    id: string;
    name: string;
    childCategories: string[];
}

export const CATEGORIES: Category[] = [
    {
        id: 'general-dentistry',
        name: 'General Dentistry',
        subCategories: [
            {
                id: 'anesthetics-needles',
                name: 'Anesthetics & Needles',
                childCategories: []
            },
            {
                id: 'restorative',
                name: 'Restorative',
                childCategories: [
                    'Glycerin',
                    'Temporary Filling Material',
                    'Composite Modeling Liquid',
                    'Composites',
                    'Amalgams',
                    'Pulp Protection',
                    'Cement base',
                    'Glass Ionomer',
                    'Opaquers & Tints'
                ]
            },
            {
                id: 'rubber-dam',
                name: 'Rubber Dam',
                childCategories: [
                    'Rubber Dam Sheets & Liquids',
                    'Rubber Dam Clamps',
                    'Rubber Dam Instruments'
                ]
            },
            {
                id: 'impression-materials',
                name: 'Impression Materials',
                childCategories: [
                    'Silicone',
                    'Alginate',
                    'Impression Compounds',
                    'Bite Registration',
                    'Dental Gypsum',
                    'Impression Accessories'
                ]
            },
            {
                id: 'bonding-agents',
                name: 'Bonding Agents & Etchants',
                childCategories: [
                    'Total Etch Adhesives',
                    'Self Etch Adhesives',
                    'Etchants',
                    'Primers and Cleaners',
                    'Silane'
                ]
            },
            {
                id: 'crown-bridge',
                name: 'Crown & Bridge',
                childCategories: [
                    'Permanent Cement',
                    'Temporary Cement',
                    'Retraction Materials',
                    'Tooth Preparation Burs',
                    'Ceramic Materials',
                    'Temporisation',
                    'C&B Accessories'
                ]
            },
            {
                id: 'x-ray',
                name: 'X-Ray',
                childCategories: [
                    'X-Ray Films',
                    'X-Ray Accessories'
                ]
            },
            {
                id: 'preventive',
                name: 'Preventive',
                childCategories: [
                    'Fluoridation & desensitization',
                    'Pit & Fissure Sealants',
                    'Caries Detectors/ Control'
                ]
            },
            {
                id: 'finishing-polishing',
                name: 'Finishing & Polishing',
                childCategories: [
                    'Finishing & Polishing Materials',
                    'Finishing & Polishing Instruments',
                    'SandBlasting Materials',
                    'Finishing Burs',
                    'Polishing Brushes/ Kits',
                    'Restorative Accessories',
                    'Strips'
                ]
            },
            {
                id: 'esthetic-cosmetic',
                name: 'Esthetic & Cosmetic',
                childCategories: [
                    'Bleaching',
                    'Tooth Cleaning & Polishing',
                    'Tooth Jewellery'
                ]
            }
        ]
    },
    {
        id: 'consumables',
        name: 'Consumables',
        subCategories: [
            {
                id: 'gloves',
                name: 'Gloves',
                childCategories: [
                    'Powdered Latex Gloves',
                    'Nitrile Gloves',
                    'Surgical Gloves',
                    'Nylon Gloves'
                ]
            },
            {
                id: 'face-masks-caps',
                name: 'Face masks & Caps',
                childCategories: [
                    '3 Ply Disposable Masks',
                    'Special Masks',
                    'Head Caps'
                ]
            },
            {
                id: 'treatments-aids',
                name: 'Treatments Aids',
                childCategories: [
                    'Trays',
                    'Saliva Ejectors',
                    'Mirrors, Probes & Tweezers',
                    'Set-up Trays & Accessories'
                ]
            },
            {
                id: 'protective-gear',
                name: 'Protective gear',
                childCategories: [
                    'Chair/Equipment Covers',
                    'Patient Protection',
                    'Doctor Protection',
                    'Face Protection'
                ]
            },
            {
                id: 'treatment-area-prep',
                name: 'Treatment area preparation',
                childCategories: [
                    'Dental Brushes',
                    'Cheek Guards & Retractors',
                    'Matrix Materials'
                ]
            },
            {
                id: 'general-disposables',
                name: 'General disposables',
                childCategories: [
                    'Air/ Water Syringe Tips',
                    'Suction Tube',
                    'Cotton Products & Accessories',
                    'Tissues/ Towels',
                    'Drinking Cups'
                ]
            },
            {
                id: 'general-accessories',
                name: 'General accessories',
                childCategories: [
                    'Pediatric accessories',
                    'Plier Holder',
                    'Articulating Paper',
                    'Denture & Retainer Boxes',
                    'Mixing & Dispensing',
                    'Endo Accessories',
                    'General Dispensers'
                ]
            }
        ]
    },
    {
        id: 'endodontics',
        name: 'Endodontics',
        subCategories: [
            // Check formatting from user request: "Root Canal Preparation Bur :" (No children listed under it directly? Or is it a header?)
            // Wait, "Root Canal Preparation Bur:" has a colon, but no indented items below it in the text given?
            // "Access Cavity Preparation:" has indented items.
            // Ah, looking closely at the user text:
            // "-Root Canal Preparation Bur:\n-Access Cavity Preparation:"
            // It seems empty. I will treat it as having no children or maybe I missed something. 
            // Actually, standard Endodontics usually has files under prep. 
            // But looking at the list, "Access Cavity Preparation" has "Root Canal Locator", etc.
            // I will add it as valid SubCategory with empty children for now.
            {
                id: 'root-canal-prep-bur',
                name: 'Root Canal Preparation Bur',
                childCategories: []
            },
            {
                id: 'access-cavity-prep',
                name: 'Access Cavity Preparation',
                childCategories: [
                    'Root Canal Locator',
                    'Endodontic Carbide Burs',
                    'Endodontic Diamond Burs'
                ]
            },
            {
                id: 'cleaning',
                name: 'Cleaning',
                childCategories: [
                    'Pulp Devitalization',
                    'Barbed Broaches'
                ]
            },
            {
                id: 'shaping',
                name: 'Shaping',
                childCategories: [
                    'Rotary Files',
                    'Hand Files'
                ]
            },
            {
                id: 'obturation',
                name: 'Obturation',
                childCategories: [
                    'Gutta Percha Points',
                    'Paper Points',
                    'Root Canal Sealants',
                    'Spreaders & Pluggers',
                    'Gutta Percha Cutters'
                ]
            },
            {
                id: 'post-core',
                name: 'Post & Core',
                childCategories: [
                    'Posts , screws & Drills',
                    'Core Build-Up Materials',
                    'Peeso Reamers'
                ]
            },
            {
                id: 'rc-irrigants',
                name: 'RC irrigants & Root repair',
                childCategories: [
                    'RC Irrigants & Lubricants',
                    'Root Repair'
                ]
            },
            {
                id: 'medicaments',
                name: 'Medicaments',
                childCategories: []
            },
            {
                id: 're-treatment',
                name: 'Re-treatment',
                childCategories: []
            },
            {
                id: 'endo-accessories',
                name: 'Endodontic Accessories',
                childCategories: [
                    'Root Canal Irrigation Needles',
                    'Endodontic Rulers',
                    'Endodontic Holders & Stands',
                    'Endo Testing',
                    'Endo Aspirator'
                ]
            }
        ]
    },
    {
        id: 'orthodontics',
        name: 'Orthodontics',
        subCategories: [
            { id: 'ortho-strips', name: 'Strips', childCategories: [] },
            {
                id: 'bracket-systems',
                name: 'Bracket Systems',
                childCategories: ['Metal', 'Cosmetic', 'Self-ligating', 'Aligners Material']
            },
            {
                id: 'buccal-tubes',
                name: 'Buccal Tubes & Molar Bands',
                childCategories: ['Wire Products', 'Ligature & Kobayashi wires', 'Arch wires', 'Archwire for Self-ligating Brackets']
            },
            {
                id: 'attachments',
                name: 'Attachments',
                childCategories: ['Expansion Screws & Springs', 'Lingual Attachments']
            },
            { id: 'elastomeric', name: 'Elastomeric Products', childCategories: [] },
            { id: 'adhesives', name: 'Adhesives', childCategories: [] },
            { id: 'orthopedic-appliances', name: 'Orthopedic Appliances', childCategories: [] },
            {
                id: 'ortho-anchorage',
                name: 'Orthodontics Anchorage',
                childCategories: ['TADs']
            },
            { id: 'elastics', name: 'Elastics', childCategories: [] },
            {
                id: 'ortho-accessories',
                name: 'Ortho Accessories',
                childCategories: ['Retainer Materials', 'Relief Waxes', 'Other Accessories']
            },
            {
                id: 'ortho-instruments',
                name: 'Ortho instruments',
                childCategories: ['Elastic Ligature Applicator', 'Ortho Pliers', 'Bracket Positioning', 'Wire Cutters', 'Band Seaters', 'Other Ortho Instruments']
            }
        ]
    },
    {
        id: 'instruments',
        name: 'Instruments',
        subCategories: [
            {
                id: 'general-instruments',
                name: 'General instruments',
                childCategories: ['Dental Syringes', 'Trays, Dishes, & Drums', 'Diagnostic Instruments', 'Instrument Kits & Cassettes', 'Miscellaneous']
            },
            {
                id: 'restorative-instruments',
                name: 'Restorative instruments',
                childCategories: ['Amalgam instruments', 'Pins', 'Hand Cutting Instruments', 'Burs', 'Filling Instruments', 'Composite Instruments', 'Matrix Bands, Retainers, Rings and Wedges']
            },
            {
                id: 'endo-instruments',
                name: 'Endo instruments',
                childCategories: ['Endo Forceps', 'Operative Dentistry', 'RCT Instruments']
            },
            {
                id: 'surgical-instruments',
                name: 'Surgical instruments',
                childCategories: ['Bone fixing & Building', 'Forceps', 'Elevators & Retractors', 'Scalpels & Scissors', 'Bone Cutting Instruments', 'Needle Holders & Hemostats', 'Surgical Burs', 'Other Surgical Instruments']
            },
            {
                id: 'perio-instruments',
                name: 'Perio instruments',
                childCategories: ['Ultrasonic Scaler Tips', 'Periodont Burs', 'Curettes', 'Scalers', 'Periodontal Probes', 'Elevators', 'Knives', 'Periodontal Files', 'Other Perio Instruments']
            },
            {
                id: 'prostho-instruments',
                name: 'Prostho Instruments',
                childCategories: ['Carvers & Knives', 'Crown Removers', 'Mixing Spatulas', 'Cord Packers', 'Articulators']
            }
        ]
    },
    {
        id: 'equipments',
        name: 'Equipments',
        subCategories: [
            { id: 'portable-unites', name: 'Portable Unites', childCategories: [] },
            { id: 'digital-impression', name: 'Digital Impression', childCategories: [] },
            { id: 'dental-implant-unit', name: 'Dental Implant Unit', childCategories: [] },
            {
                id: 'general-equipments',
                name: 'General equipments',
                childCategories: ['Anesthesia Device', 'Ultrasonic Scalers', 'Bleaching & Whitening units', 'Mixers & Dispensers', 'Amalgamators', 'Air Polishing Units', 'Shade Guides', 'Light Cure Units', 'Loupes & Magnifiers', 'Intra Oral Cameras', 'Hand Sanitizer Dispensers']
            },
            {
                id: 'sterilization-equipment',
                name: 'Sterilization Equipment',
                childCategories: ['Dental Autoclaves', 'Ultrasonic Cleaners', 'UV Cabinets', 'Water Distillers', 'Glass Bead Sterilizers', 'Sealing Devices', 'Other Sterilizers']
            },
            {
                id: 'imaging-systems',
                name: 'Imaging Systems',
                childCategories: ['X-Ray Units', 'X-Ray Sensors', 'X-Ray Processors & Viewers', 'Phosphor Plate Scanners']
            },
            {
                id: 'dental-handpieces',
                name: 'Dental Handpieces',
                childCategories: ['Handpiece & Electric motors', 'Turbines', 'Handpiece & Air motors', 'Handpiece Accessories', 'Micromotors', 'Endo Handpieces', 'Implant Handpieces']
            },
            {
                id: 'other-equipment',
                name: 'Other Equipment',
                childCategories: ['Microscope', 'Surgical Equipment', 'Laboratory Equipment', 'Dental Lasers', 'Other Dental Equipment']
            },
            {
                id: 'endo-equipments',
                name: 'Endodontic Equipments',
                childCategories: ['Endo Activator', 'Apex Locators', 'Endomotors', 'Obturation Systems', 'Pulp Testers', 'Endomotors With Built-In Apex Locators', 'Other Endo Equipment']
            },
            {
                id: 'dental-chairs',
                name: 'Dental Chairs & Accessories',
                childCategories: ['Dental Chairs', 'Dental Stools', 'Compressors', 'Suction Units', 'Trolleys', 'Chair Accessories']
            }
        ]
    },
    {
        id: 'paedodontics',
        name: 'Paedodontics',
        subCategories: [
            { id: 'space-maintainer', name: 'Space Maintainer', childCategories: [] },
            { id: 'pediatric-crowns', name: 'Pediatric Crowns', childCategories: [] },
            { id: 'pulp-therapy', name: 'Pulp Therapy', childCategories: [] }
        ]
    },
    {
        id: 'prosthodontics',
        name: 'Prosthodontics',
        subCategories: [
            { id: 'model-creation', name: 'Model Creation', childCategories: [] },
            { id: 'acrylics', name: 'Acrylics', childCategories: [] },
            { id: 'dental-waxes', name: 'Dental Waxes', childCategories: [] },
            { id: 'denture-processing', name: 'Denture Processing', childCategories: [] },
            { id: 'denture-relines', name: 'Denture relines', childCategories: [] }
        ]
    },
    {
        id: 'periodontics',
        name: 'Periodontics',
        subCategories: [
            { id: 'splints', name: 'Splints & Mouth Guards', childCategories: [] },
            { id: 'surgical-products', name: 'Surgical products', childCategories: [] },
            { id: 'surgical-dressings', name: 'Surgical dressings', childCategories: [] },
            { id: 'tissue-management', name: 'Tissue Management', childCategories: [] },
            { id: 'bone-grafts', name: 'Bone Grafts', childCategories: [] },
            { id: 'plaque-control', name: 'Plaque Control', childCategories: [] }
        ]
    },
    {
        id: 'oral-surgery',
        name: 'Oral Surgery',
        subCategories: [
            { id: 'sutures', name: 'Sutures', childCategories: [] },
            { id: 'hemostatic', name: 'Hemostatic / Antiseptic Agents and Packing', childCategories: [] }
        ]
    },
    {
        id: 'implantology',
        name: 'Implantology',
        subCategories: [
            { id: 'implants-offers', name: 'Implants Offers', childCategories: [] },
            { id: 'dental-implants', name: 'Dental Implants', childCategories: [] },
            { id: 'implant-drills', name: 'Implant Drills', childCategories: [] },
            { id: 'implant-accessories', name: 'Implant Accessories', childCategories: [] },
            { id: 'implant-abutments', name: 'Implant Abutments', childCategories: [] }
        ]
    },
    {
        id: 'sterilization',
        name: 'Sterilization',
        subCategories: [
            { id: 'inst-sterilizers', name: 'Instrument Sterilizers', childCategories: [] },
            { id: 'sterilization-pouches', name: 'Sterilization Pouches & Accessories', childCategories: [] },
            { id: 'contactless', name: 'Contactless Dispensers', childCategories: [] },
            { id: 'hand-sanitizers', name: 'Hand Sanitizers', childCategories: [] },
            { id: 'disinfectants', name: 'Surface & Equipment Disinfectants', childCategories: [] }
        ]
    },
    {
        id: 'oral-care',
        name: 'Oral Care',
        subCategories: [
            { id: 'water-jet', name: 'Water Jet', childCategories: [] },
            { id: 'flosser', name: 'Flosser', childCategories: [] },
            { id: 'toothpaste', name: 'Toothpaste', childCategories: [] },
            { id: 'toothbrush', name: 'Toothbrush', childCategories: [] },
            { id: 'mouthwashes', name: 'Mouthwashes', childCategories: [] }
        ]
    },
    {
        id: 'clothing',
        name: 'Clothing & Uniforms',
        subCategories: [
            { id: 'scrubs', name: 'Medical Scrubs', childCategories: [] },
            { id: 'coats', name: 'Lab Coats', childCategories: [] },
            { id: 'jackets', name: 'Scrub Jackets', childCategories: [] },
            { id: 'head-caps', name: 'Head Caps', childCategories: [] },
            { id: 'clogs', name: 'Clogs (Slippers)', childCategories: [] },
            { id: 'clothing-accessories', name: 'Accessories', childCategories: ['Bag', 'Brooches & Pins'] }
        ]
    },
    {
        id: 'photography',
        name: 'Photography',
        subCategories: [
            { id: 'lens-light', name: 'Lens & Light', childCategories: [] },
            { id: 'contraster', name: 'Dental Contraster', childCategories: [] },
            { id: 'photo-mirror', name: 'Photography mirror', childCategories: [] }
        ]
    },
    {
        id: 'learning',
        name: 'Learning & Training',
        subCategories: [
            { id: 'training-models', name: 'Training Teeth and Models', childCategories: [] }
        ]
    },
    {
        id: 'maintenance',
        name: 'Maintenance',
        subCategories: [
            { id: 'lubricant', name: 'Handpiece & Turbine Lubricant', childCategories: [] },
            { id: 'spare-parts', name: 'Spare Parts', childCategories: [] }
        ]
    },
    {
        id: 'laboratory',
        name: 'Laboratory',
        subCategories: [
            { id: 'denture-teeth', name: 'Denture teeth', childCategories: [] },
            { id: 'cad-cam', name: 'CAD CAM', childCategories: [] },
            { id: 'ceramic', name: 'Ceramic Material', childCategories: [] }
        ]
    }
];
