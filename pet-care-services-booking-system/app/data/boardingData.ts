import { BoardingRoomOption, BoardingAddon } from '../types/boarding';

export const BOARDING_ROOMS: BoardingRoomOption[] = [
  // DOG SUITES
  {
    id: 'dog-standard',
    targetPetType: 'dog',
    name: 'Standard Dog Cabin',
    pricePerNight: 45,
    description: 'Private climate-controlled dog room with comfortable bedding & 2x daily playground sessions.',
    badge: 'Budget Friendly',
    image: '🏡',
    features: [
      'Private 24/7 Air-Conditioned Cabin',
      'Daily Photo & Video Update via WhatsApp',
      '2x Daily Playground & Grass Lawn Walks',
      'Premium Grain-Free Dog Meal Service'
    ]
  },
  {
    id: 'dog-deluxe',
    targetPetType: 'dog',
    name: 'Deluxe Dog Suite',
    pricePerNight: 65,
    description: 'Spacious double-sized suite with sofa bed, lawn playtime & 24/7 HD webcam stream.',
    popular: true,
    badge: 'Most Popular',
    image: '🏰',
    features: [
      'Spacious Double-Sized Dog Lounge',
      'Plush Sofa Bed & Calming Aromatherapy',
      '3x Daily Outdoor Lawn Play Sessions',
      '24/7 HD Webcam Live Mobile Streaming'
    ]
  },

  // CAT SUITES
  {
    id: 'cat-standard',
    targetPetType: 'cat',
    name: 'Standard Cat Cabin',
    pricePerNight: 35,
    description: 'Quiet climate-controlled feline cabin with soft elevated hammock and daily interactive wand play.',
    badge: 'Cozy & Quiet',
    image: '🏡',
    features: [
      'Noise-Isolated Climate-Controlled Cabin',
      'Cozy Elevated Hammock & Fleece Blanket',
      'Daily Photo & Video Update via WhatsApp',
      'Daily Interactive Wand Playtime'
    ]
  },
  {
    id: 'cat-deluxe',
    targetPetType: 'cat',
    name: 'Deluxe Cat Suite',
    pricePerNight: 50,
    description: 'Floor-to-ceiling glass suite with multi-level climbing tree, scratcher & live webcam stream.',
    popular: true,
    badge: 'Most Popular',
    image: '🏰',
    features: [
      'Floor-to-Ceiling Glass Penthouse Suite',
      'Multi-Level Climbing Cat Tree & Sisal Posts',
      'Window Sunbathing Ledge View',
      '24/7 HD Webcam Live Mobile Streaming'
    ]
  }
];

export const BOARDING_ADDONS: BoardingAddon[] = [
  {
    id: 'addon-live-webcam',
    name: '24/7 HD Live Webcam Stream',
    price: 8,
    perNight: true,
    description: 'Watch your pet live anytime from your smartphone via dedicated app link.'
  },
  {
    id: 'addon-treats-pack',
    name: 'Daily Gourmet Freeze-Dried Treats',
    price: 6,
    perNight: true,
    description: 'Daily selection of salmon, chicken, or lamb freeze-dried snacks.'
  },
  {
    id: 'addon-exit-bath',
    name: 'Departure Bubble Spa & Hydro Bath',
    price: 30,
    perNight: false,
    description: 'Complimentary pamper session before check-out so your pet returns squeaky clean.'
  },
  {
    id: 'addon-solo-play',
    name: 'VIP Solo Outdoor Lawn Time (30 mins)',
    price: 12,
    perNight: true,
    description: 'Exclusive one-on-one outdoor playtime with dedicated pet supervisor.'
  }
];

export const CHECK_IN_TIMES = [
  '09:00 AM',
  '11:00 AM',
  '01:00 PM',
  '03:00 PM',
  '05:00 PM'
];
