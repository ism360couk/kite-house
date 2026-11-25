import portlandHarbourImg from '../assets/images/portland_harbour_sailing_1795468032732.jpg';

export interface SpaceGalleryItem {
  src: string;
  alt: string;
  label: string;
}

export interface SpaceTab {
  id: string;
  label: string;
  floor: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  gallery?: SpaceGalleryItem[];
  highlights: string[];
}

export interface HeritageMilestone {
  index: string;
  title: string;
  detail: string;
}

export interface LocalLandmark {
  name: string;
  distance: string;
  description: string;
}

export interface LocalActivity {
  category: string;
  title: string;
  description: string;
}

export const PROPERTY_IMAGES = {
  heroExterior: './assets/aistudio/image_3089a028.png',
  openPlan: './assets/aistudio/image_a7134cd3.png',
  kitchen: './assets/aistudio/image_4eb7dae9.png',
  primaryBedroom: './assets/aistudio/image_58753638.png',
  ensuiteShower: './assets/aistudio/image_e04669a8.png',
  middleDouble: './assets/aistudio/image_90c744dc.png',
  middleTwin: './assets/aistudio/image_693199aa.png',
  familyBathroom: './assets/aistudio/image_f589dce5.png',
  portlandHarbour: portlandHarbourImg,
  gardenPatio: './assets/aistudio/image_19ee400e.png',
  gardenLawn: './assets/aistudio/image_6abef1e8.png',
  gardenClematis: './assets/aistudio/image_db9c38fd.png',
};

export const PROPERTY_SPECS = [
  { label: 'Accommodation', value: 'Sleeps 7 (+2 on request)' },
  { label: 'Layout', value: '3 Bedrooms · 2.5 Bathrooms' },
  { label: 'Provenance', value: "2012 Olympic Athletes' Village" },
  { label: 'Location', value: "Officer's Field · Portland, DT5" },
];

export const SPACE_TABS: SpaceTab[] = [
  {
    id: 'living',
    label: 'Living Room',
    floor: 'Ground Floor',
    title: 'Bright coastal lounge opening straight onto the garden',
    summary:
      'Designed for unwinding after a day on the water or coast path, the main living room offers generous twin sofas, a reading corner, warm oak furnishings, and direct flow through to the sheltered south-facing garden.',
    image: './assets/aistudio/image_a7134cd3.png',
    imageAlt:
      'Bright modern living room inside Kite House with two comfortable sofas, oak coffee table, and contemporary coastal artwork',
    highlights: [
      'Comfortable lounge with twin sofas, reading armchair, and oak coffee table',
      'High-speed fibre Wi-Fi, smart TV, and coastal books & board games',
      'Ground-floor cloakroom WC and handy space for coats and walking gear',
      'Direct access onto the private enclosed stone garden terrace',
    ],
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    floor: 'Ground Floor',
    title: 'Well-equipped modern kitchen built for group meals',
    summary:
      'Whether brewing morning coffee before an early tide or cooking dinner for a full house of seven, the bright wrap-around kitchen provides generous dark stone-style worktops, integrated appliances, and full cookware.',
    image: './assets/aistudio/image_4eb7dae9.png',
    imageAlt:
      'Modern bright kitchen at Kite House with white cabinetry, dark worktops, electric hob, oven, stainless extractor, and coffee maker',
    highlights: [
      'Integrated electric oven, 4-zone glass hob & stainless extractor hood',
      'Coffee pod machine, kettle, toaster, and full family cookware & tableware',
      'Large fridge-freezer, integrated dishwasher & deep 1.5-bowl sink',
      'Generous L-shaped prep surfaces and tiled floor for easy coastal clean-up',
    ],
  },
  {
    id: 'bedrooms',
    label: 'Top Floor · Primary Suite',
    floor: 'Top Floor',
    title: 'Top-floor king suite with private en-suite shower room',
    summary:
      'Set quietly on the top storey above the rest of the house, the primary suite features a spindle oak king bed, dressing table, arched wall mirror, and a dedicated en-suite walk-in shower room.',
    image: './assets/aistudio/image_58753638.png',
    imageAlt:
      'Top-floor primary bedroom at Kite House with oak king bed, sage green accent wall, and crisp white linens',
    gallery: [
      {
        src: './assets/aistudio/image_58753638.png',
        alt: 'Top-floor primary bedroom at Kite House with oak king bed, sage green accent wall, and crisp white linens',
        label: 'Primary King Bedroom',
      },
      {
        src: './assets/aistudio/image_e04669a8.png',
        alt: 'Private en-suite shower room with large glass walk-in shower enclosure, tiled walls, and circular mirror',
        label: 'En-suite Shower Room',
      },
    ],
    highlights: [
      'King-size oak spindle bed with crisp white linens and fresh bath towels',
      'Oak dressing table, bedside reading lamps, and digital radio',
      'Private en-suite bathroom with full glass walk-in shower enclosure',
      'Heated chrome towel rail, circular mirror & generous wardrobe storage',
    ],
  },
  {
    id: 'middle-bedrooms',
    label: 'Middle Bedrooms & Bath',
    floor: 'First Floor',
    title: 'Middle floor double, twin room and family bathroom',
    summary:
      'Ideal for families or sailing crews, the middle storey pairs a restful coastal double bedroom with a bright twin bedroom (with pull-out trundle capacity) and a full-size tiled family bathroom.',
    image: './assets/aistudio/image_90c744dc.png',
    imageAlt:
      'First-floor double bedroom at Kite House with slate-teal accent wall, wide coastal window, and folded towels',
    gallery: [
      {
        src: './assets/aistudio/image_90c744dc.png',
        alt: 'First-floor double bedroom at Kite House with slate-teal accent wall, wide coastal window, and folded towels',
        label: 'Double Bedroom',
      },
      {
        src: './assets/aistudio/image_693199aa.png',
        alt: 'Bright twin bedroom with two single timber beds, maritime navy and white bedding, and mustard bath towels',
        label: 'Twin Bedroom',
      },
      {
        src: './assets/aistudio/image_f589dce5.png',
        alt: 'Modern family bathroom with warm ribbed stone wall tiles, full bathtub with glass shower screen, pedestal sink, and WC',
        label: 'Family Bathroom',
      },
    ],
    highlights: [
      'Double bedroom with slate-teal feature wall, blackout curtains & coastal window',
      'Twin bedroom with two full-size single beds and extra trundle capacity on request',
      'Family bathroom with full-length bathtub, overhead shower & glass screen',
      'Fresh bath and hand towels laid out for every guest on arrival',
    ],
  },
  {
    id: 'garden',
    label: 'Garden & Garage',
    floor: 'South-Facing Garden & Garage',
    title: 'Enclosed sunny garden, patio seating and private garage',
    summary:
      'Step through the ground-floor French doors onto a sheltered south-facing patio and lawned garden with coastal planting—paired with an outside tap for rinsing kit and a private garage for bikes and boards.',
    image: './assets/aistudio/image_19ee400e.png',
    imageAlt:
      'Sunny paved garden patio outside Kite House French doors with black outdoor armchairs, parasol, and garden hose tap',
    gallery: [
      {
        src: './assets/aistudio/image_19ee400e.png',
        alt: 'Sunny paved garden patio outside Kite House French doors with black outdoor armchairs, parasol, and garden hose tap',
        label: 'Patio & Seating',
      },
      {
        src: './assets/aistudio/image_6abef1e8.png',
        alt: 'Enclosed south-facing lawned garden with coastal planting, timber fencing, and washing line',
        label: 'Lawn & Borders',
      },
      {
        src: './assets/aistudio/image_db9c38fd.png',
        alt: 'Purple flowering clematis climbing timber garden fencing above outdoor seating corner',
        label: 'Clematis Corner',
      },
    ],
    highlights: [
      'Sheltered south-facing paved patio with outdoor seating and parasol',
      'Enclosed lawned garden with coastal planting, clematis & washing line',
      'Private garage for secure storage of bikes, boards, wetsuits & kit',
      'Outside garden tap and hose access plus allocated off-street parking',
    ],
  },
  {
    id: 'coast',
    label: 'Portland & Coast',
    floor: 'Isle of Portland',
    title: 'Steps from Chesil Beach, Portland Harbour & the Coast Path',
    summary:
      'Step outside into Fortuneswell and you are minutes from the 18-mile shingle curve of Chesil Beach on one side and the flat-water sailing arena of Portland Harbour on the other.',
    image: portlandHarbourImg,
    imageAlt:
      'Panoramic view of Portland Harbour sailing boats, Chesil Beach tombolo, and Jurassic Coast cliffs',
    highlights: [
      '3-minute walk to Chesil Beach promenade and sunset shingle',
      '10-minute walk to Weymouth & Portland National Sailing Academy',
      'Direct access to the South West Coast Path & Tout Quarry sculpture park',
      'Independent coastal pubs, bakeries, and harbour cafés within walking distance',
    ],
  },
];

export const HERITAGE_MILESTONES: HeritageMilestone[] = [
  {
    index: '01',
    title: 'Built for the 2012 Sailing Regatta',
    detail:
      "Officer's Field was commissioned ahead of London 2012 to house international Olympic and Paralympic sailing squads competing across Weymouth Bay and Portland Harbour.",
  },
  {
    index: '02',
    title: 'Portland Limestone & Coastal Architecture',
    detail:
      'Constructed with locally quarried Portland stone, warm coastal render, and tall shuttered glazing engineered to capture maritime light while standing up to Channel breezes.',
  },
  {
    index: '03',
    title: 'Designed for Gear, Crews & Family Gatherings',
    detail:
      'Wider hallways, durable timber flooring, multiple bathrooms across three storeys, and enclosed kit storage make Kite House unusually practical for active coastal breaks.',
  },
];

export const LOCAL_LANDMARKS: LocalLandmark[] = [
  {
    name: 'Chesil Beach & Cove',
    distance: '4 min walk',
    description: 'Eighteen miles of dramatic Jurassic Coast shingle, sea swimming, and sunsets.',
  },
  {
    name: 'Weymouth & Portland National Sailing Academy',
    distance: '10 min walk',
    description: 'The 2012 Olympic sailing venue, slipways, and year-round dinghy & wingfoil waters.',
  },
  {
    name: 'Portland Castle (English Heritage)',
    distance: '8 min walk',
    description: "Henry VIII's coastal fortress overlooking Castletown Pier and the harbour.",
  },
  {
    name: 'Portland Bill Lighthouse & Coast Path',
    distance: '9 min drive',
    description: 'Iconic red-and-white lighthouse, limestone cliffs, and circular coastal walks.',
  },
];

export const LOCAL_ACTIVITIES: LocalActivity[] = [
  {
    category: 'On the Water',
    title: 'Sailing, Wingfoiling & Paddleboarding',
    description:
      'Launch from the National Sailing Academy and Portland Harbour—calm sheltered water for SUP, kayaking, windsurfing, and dinghy courses.',
  },
  {
    category: 'Beaches & Coves',
    title: 'Chesil Beach & Weymouth Sandy Bay',
    description:
      'Walk 4 minutes to Chesil Beach sunsets and Church Ope Cove, or drive 10 minutes across the causeway to Weymouth’s award-winning sandy beach.',
  },
  {
    category: 'Climbing & Adventure',
    title: 'Portland Limestone Climbing & Bouldering',
    description:
      'Over 1,500 bolted sport routes and coastal bouldering sectors at Blacknor, The Cuttings, and Tout Quarry right on the island.',
  },
  {
    category: 'Walking & Cycling',
    title: 'South West Coast Path & Rodwell Trail',
    description:
      'Step onto circular cliff walks, sculpture trails, and the traffic-free Rodwell Trail cycle route linking Portland straight into Weymouth.',
  },
  {
    category: 'Sea & Wildlife',
    title: 'Wild Swimming, Scuba Diving & Birdwatching',
    description:
      'Explore clear Dorset dive sites out of Castletown Pier, coasteer rocky ledges, or spot migrating seabirds at Portland Bill and Chesil Lagoon.',
  },
  {
    category: 'Family Days Out',
    title: 'Weymouth Harbour, Castles & Jurassic Coast',
    description:
      'Easy access to Portland Castle, Nothe Fort, Weymouth SEA LIFE Adventure Park, crabbing on the harbourside, and fossil hunting along Dorset.',
  },
];
