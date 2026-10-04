import { PetService, BookingAddon } from '../types/booking';

export const PET_SERVICES: PetService[] = [
  {
    id: 'grooming-full',
    name: 'Full Pamper Grooming',
    category: 'grooming',
    description: 'Complete luxury wash, blow dry, nail clip, ear cleaning, and paw pad moisturizing.',
    price: 45,
    durationMinutes: 60,
    popular: true,
    badge: 'Best Seller',
    iconName: 'Scissors',
    features: [
      'Organic Hypoallergenic Shampoo & Bath',
      'Fluff Blow Dry & De-shedding Brushout',
      'Nail Trimming & Sanitary Cleaning',
      'Ear Inspection & Gentle Cleaning',
      'Fragrance Finishing Spray'
    ]
  },
  {
    id: 'potong-bulu',
    name: 'Fur Styling & Cut (Potong Bulu)',
    category: 'grooming',
    description: 'Precision breed haircut, sanitary trimming, coat shaping, and customized style.',
    price: 35,
    durationMinutes: 45,
    badge: 'Popular',
    iconName: 'Sparkles',
    features: [
      'Customized Breed Haircut & Trimming',
      'Sanitary Area Trim & Maintenance',
      'Face & Paw Shaping',
      'Coat De-matting & Softening Treatment',
      'Complimentary Pet Bandana / Bow'
    ]
  },
  {
    id: 'vet-consultation',
    name: 'Veterinary Consultation & Checkup',
    category: 'vet',
    description: 'Comprehensive medical assessment by senior licensed veterinarians.',
    price: 50,
    durationMinutes: 30,
    popular: true,
    badge: 'Essential Care',
    iconName: 'Stethoscope',
    features: [
      'Full Physical & Vitals Assessment',
      'Weight & Nutritional Health Check',
      'Skin, Coat & Dental Evaluation',
      'Personalized Healthcare Plan',
      'Digital Medical History Report'
    ]
  },
  {
    id: 'neuter-spay',
    name: 'Neuter & Spay Surgical Procedure',
    category: 'surgery',
    description: 'Safe surgical sterilization with pre-op bloodwork, modern anesthesia, and post-op care.',
    price: 150,
    durationMinutes: 120,
    badge: 'Specialist Surgery',
    iconName: 'HeartPulse',
    features: [
      'Pre-anesthetic Blood Screening',
      'Sterile Surgery with Modern Monitoring',
      'Pain Relief & Post-Op Medication Pack',
      'Elizabethan Recovery Collar Included',
      'Free 7-Day Follow-Up Checkup'
    ]
  },
  {
    id: 'vaccination',
    name: 'Core Vaccination & Deworming',
    category: 'vet',
    description: 'Protection against major viruses (Rabies, DHPP/FVRCP) & broad-spectrum deworming.',
    price: 40,
    durationMinutes: 25,
    iconName: 'ShieldCheck',
    features: [
      'Core Annual Vaccine Booster',
      'Internal Parasite Deworming Pill',
      'Official Pet Passport / Vaccine Card',
      'Pre-vaccine Health Check'
    ]
  },
  {
    id: 'dental-care',
    name: 'Ultrasonic Dental Scaling & Polish',
    category: 'vet',
    description: 'Professional plaque removal, tartar scaling, and breath freshening polish.',
    price: 80,
    durationMinutes: 60,
    iconName: 'Smile',
    features: [
      'Ultrasonic Tartar & Plaque Scaling',
      'Subgingival Gum Inspection',
      'Tooth Polishing & Mint Rinse',
      'Preventative Home Care Advice'
    ]
  },
  {
    id: 'spa-aroma',
    name: 'Hydrotherapy Spa & Herbal Massage',
    category: 'spa_boarding',
    description: 'Soothing bubble bath, herbal skin therapy, and calming aromatherapy massage.',
    price: 60,
    durationMinutes: 45,
    badge: 'Relaxation',
    iconName: 'Bath',
    features: [
      'Microbubble Hydrotherapy Bath',
      'Dead Sea Mineral Mud Mask',
      'Soothing Coat Conditioning Spa',
      'Aromatherapy Muscle Massage'
    ]
  },
  {
    id: 'hotel-boarding',
    name: 'Luxury Pet Boarding (Per Night)',
    category: 'spa_boarding',
    description: 'Private climate-controlled suite with 24/7 camera access, playtime & premium meals.',
    price: 35,
    durationMinutes: 1440,
    badge: 'Luxury Resort',
    iconName: 'Home',
    features: [
      'Private Air-Conditioned Suite',
      '24/7 Live Video Feed for Owners',
      'Daily Outdoor Playtime & Socialization',
      'Gourmet Meal Service & Medication Care'
    ]
  }
];

export const BOOKING_ADDONS: BookingAddon[] = [
  {
    id: 'addon-blueberry-facial',
    name: 'Blueberry Tear-Stain Facial',
    price: 10,
    description: 'Gentle facial wash to brighten coat and reduce tear stains.'
  },
  {
    id: 'addon-flea-tick',
    name: 'Flea & Tick Spot-On Treatment',
    price: 15,
    description: '30-day preventative treatment against fleas, ticks & mites.'
  },
  {
    id: 'addon-nail-grind',
    name: 'Dremel Soft-Nail Grinding',
    price: 8,
    description: 'Smooth rounded nail edges to prevent sharp furniture scratches.'
  },
  {
    id: 'addon-express-service',
    name: 'Express VIP Priority Handling',
    price: 20,
    description: 'No waiting time — immediate continuous care for anxious pets.'
  }
];

export const DEFAULT_TIME_SLOTS = [
  { time: '09:00 AM', period: 'morning' },
  { time: '10:30 AM', period: 'morning' },
  { time: '12:00 PM', period: 'afternoon' },
  { time: '01:30 PM', period: 'afternoon' },
  { time: '03:00 PM', period: 'afternoon' },
  { time: '04:30 PM', period: 'evening' },
  { time: '06:00 PM', period: 'evening' },
  { time: '07:30 PM', period: 'evening' }
] as const;
