/**
 * HPCSA CPD Requirements as per December 2024 Guidelines (Version 5)
 *
 * Key Changes from November 2021 (Version 3):
 * - CEU shelf life changed from 24 months to 12 months
 * - Introduction of minimum CLINICAL CEUs separate from Ethics CEUs
 * - Explicit tracking of Clinical vs Ethics/Human Rights/Health Law content
 */

export interface HPCSARequirement {
  profession: string
  abbreviation: string
  totalCEUs: number
  minClinicalCEUs: number
  minEthicsCEUs: number
}

/**
 * HPCSA CEU Requirements per profession (Dec 2024)
 * Source: HPCSA CPD Guidelines for Registered Practitioners, Version 5
 */
export const HPCSA_REQUIREMENTS: Record<string, HPCSARequirement> = {
  // DENTAL THERAPY AND ORAL HYGIENE
  DA: { profession: "Dental Assistant", abbreviation: "DA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  TT: { profession: "Dental Therapist", abbreviation: "TT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  OH: { profession: "Oral Hygienist", abbreviation: "OH", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },

  // DIETETICS AND NUTRITION
  DT: { profession: "Dietitian", abbreviation: "DT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SDT: { profession: "Supplementary Dietitian", abbreviation: "SDT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  NT: { profession: "Nutritionist", abbreviation: "NT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SNT: { profession: "Supplementary Nutritionist", abbreviation: "SNT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },

  // EMERGENCY CARE PRACTITIONERS
  ANA: { profession: "Ambulance Emergency Assistant", abbreviation: "ANA", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  ANT: { profession: "Paramedic", abbreviation: "ANT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  BAA: { profession: "Basic Ambulance Assistant", abbreviation: "BAA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  ECA: { profession: "Emergency Care Assistant", abbreviation: "ECA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  ECT: { profession: "Emergency Care Technician", abbreviation: "ECT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  ECP: { profession: "Emergency Care Practitioner", abbreviation: "ECP", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  OECO: { profession: "Operational Emergency Care Orderly", abbreviation: "OECO", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },

  // ENVIRONMENTAL HEALTH
  HI: { profession: "Environmental Health Practitioner", abbreviation: "HI", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  HIA: { profession: "Environmental Health Assistant", abbreviation: "HIA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  FI: { profession: "Food Inspector", abbreviation: "FI", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },

  // MEDICAL, DENTISTRY AND MEDICAL SCIENCE
  AN: { profession: "Anaesthetist Assistant", abbreviation: "AN", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  BE: { profession: "Biomedical Engineer", abbreviation: "BE", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  CA: { profession: "Clinical Associate", abbreviation: "CA", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  DP: { profession: "Dentist", abbreviation: "DP", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  "GC/GR": { profession: "Genetic Counsellor", abbreviation: "GC/GR", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  HA: { profession: "Health Assistant", abbreviation: "HA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  KB: { profession: "Clinical Biochemist", abbreviation: "KB", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  MP: { profession: "Medical Practitioner", abbreviation: "MP", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  MS: { profession: "Medical Scientist", abbreviation: "MS", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  MW: { profession: "Medical Biological Scientist", abbreviation: "MW", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SMW: { profession: "Supplementary Medical Scientist", abbreviation: "SMW", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  PH: { profession: "Medical Physicist", abbreviation: "PH", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },

  // MEDICAL TECHNOLOGY
  MT: { profession: "Medical Technologist", abbreviation: "MT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  MLS: { profession: "Medical Laboratory Scientist", abbreviation: "MLS", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  GT: { profession: "Medical Technician", abbreviation: "GT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SGT: { profession: "Supplementary Medical Technician", abbreviation: "SGT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  LA: { profession: "Laboratory Assistant", abbreviation: "LA", totalCEUs: 10, minClinicalCEUs: 9, minEthicsCEUs: 1 },
  SLA: { profession: "Supplementary Laboratory Assistant", abbreviation: "SLA", totalCEUs: 10, minClinicalCEUs: 9, minEthicsCEUs: 1 },

  // OCCUPATIONAL THERAPY, MEDICAL ORTHOTICS AND PROSTHETICS AND ARTS THERAPY
  AT: { profession: "Arts Therapist", abbreviation: "AT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  AOS: { profession: "Assistant Medical Orthotist, Prosthetist & Leatherworker", abbreviation: "AOS", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  OSA: { profession: "Orthopaedic Technical Assistant", abbreviation: "OSA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  OTB: { profession: "Occupational Therapy Assistant", abbreviation: "OTB", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  OTT: { profession: "Occupational Therapy Technician", abbreviation: "OTT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  OB: { profession: "Orthopaedic Footwear Technician", abbreviation: "OB", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  OS: { profession: "Medical Orthotist and Prosthetist", abbreviation: "OS", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SOS: { profession: "Supplementary Medical Orthotist Prosthetist", abbreviation: "SOS", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  OT: { profession: "Occupational Therapist", abbreviation: "OT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SOT: { profession: "Supplementary Occupational Therapist", abbreviation: "SOT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },

  // OPTOMETRY AND DISPENSING OPTICIANS
  OD: { profession: "Dispensing Optician", abbreviation: "OD", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SOD: { profession: "Supplementary Dispensing Optician", abbreviation: "SOD", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  OP: { profession: "Optometrist", abbreviation: "OP", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SOP: { profession: "Supplementary Optometrist", abbreviation: "SOP", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  OR: { profession: "Orthoptist", abbreviation: "OR", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },

  // PHYSIOTHERAPY, PODIATRY AND BIOKINETICS
  BK: { profession: "Biokineticist", abbreviation: "BK", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  CH: { profession: "Podiatrist", abbreviation: "CH", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  MA: { profession: "Masseurs", abbreviation: "MA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  PT: { profession: "Physiotherapist", abbreviation: "PT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  PTA: { profession: "Physiotherapy Assistants", abbreviation: "PTA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  PTT: { profession: "Physiotherapy Technicians", abbreviation: "PTT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  RM: { profession: "Remedial Gymnast", abbreviation: "RM", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SCH: { profession: "Supplementary Podiatrist", abbreviation: "SCH", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SPT: { profession: "Supplementary Physiotherapist", abbreviation: "SPT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },

  // PSYCHOLOGY
  PM: { profession: "Psychotechnician", abbreviation: "PM", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  PMT: { profession: "Psychometrist", abbreviation: "PMT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  PRC: { profession: "Registered Counsellor", abbreviation: "PRC", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  PS: { profession: "Psychologist", abbreviation: "PS", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },

  // RADIOGRAPHY AND CLINICAL TECHNOLOGY
  DR: { profession: "Radiographer", abbreviation: "DR", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  EE: { profession: "Electro-Encephalographic Technician", abbreviation: "EE", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  KT: { profession: "Clinical Technologist", abbreviation: "KT", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  KTA: { profession: "Assistant Clinical Technologist", abbreviation: "KTA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  KTG: { profession: "Graduate Clinical Technologist", abbreviation: "KTG", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  RLT: { profession: "Radiation Laboratory Technologist", abbreviation: "RLT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  RSDR: { profession: "Restricted Supplementary Diagnostic Radiographer", abbreviation: "RSDR", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SEE: { profession: "Supplementary Electro-Encephalographic Technician", abbreviation: "SEE", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SDR: { profession: "Supplementary Diagnostic Radiographer", abbreviation: "SDR", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SKT: { profession: "Supplementary Clinical Technologist", abbreviation: "SKT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SRLT: { profession: "Supplementary Radiation Laboratory Technologist", abbreviation: "SRLT", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },

  // SPEECH, LANGUAGE AND HEARING PROFESSIONS
  AM: { profession: "Audiometrician", abbreviation: "AM", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  AU: { profession: "Audiologist", abbreviation: "AU", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  GAK: { profession: "Hearing Aid Acoustician", abbreviation: "GAK", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SAU: { profession: "Supplementary Audiologist", abbreviation: "SAU", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SGAK: { profession: "Supplementary Hearing Aid Acoustician", abbreviation: "SGAK", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  SGG: { profession: "Community Speech and Hearing Worker", abbreviation: "SGG", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SGK: { profession: "Speech and Hearing Correctionist", abbreviation: "SGK", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SHA: { profession: "Speech and Hearing Assistant", abbreviation: "SHA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  ST: { profession: "Speech Therapist", abbreviation: "ST", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  SSTA: { profession: "Supplementary Speech Therapist and Audiologist", abbreviation: "SSTA", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
  STA: { profession: "Speech Therapist and Audiologist", abbreviation: "STA", totalCEUs: 30, minClinicalCEUs: 25, minEthicsCEUs: 5 },
  STB: { profession: "Speech Therapy Assistant", abbreviation: "STB", totalCEUs: 15, minClinicalCEUs: 13, minEthicsCEUs: 2 },
}

/**
 * Get CEU requirements for a specific profession
 */
export function getRequirements(professionCode: string | null): HPCSARequirement {
  // Default requirements if profession not specified
  const defaultRequirement: HPCSARequirement = {
    profession: "Health Practitioner",
    abbreviation: "DEFAULT",
    totalCEUs: 30,
    minClinicalCEUs: 25,
    minEthicsCEUs: 5,
  }

  if (!professionCode) return defaultRequirement

  return HPCSA_REQUIREMENTS[professionCode.toUpperCase()] || defaultRequirement
}

/**
 * Calculate CEU expiry date (12 months from issuance as per Dec 2024 guidelines)
 */
export function calculateCEUExpiryDate(issuedAt: Date): Date {
  const expiryDate = new Date(issuedAt)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1) // 12 months = 1 year
  return expiryDate
}

/**
 * Check if CEUs are still valid
 */
export function areCEUsValid(expiryDate: Date): boolean {
  return expiryDate > new Date()
}

/**
 * Check if CEUs are expiring soon (within 30 days)
 */
export function areCEUsExpiringSoon(expiryDate: Date): boolean {
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  return expiryDate <= thirtyDaysFromNow && expiryDate > now
}

/**
 * Get all profession options for dropdown/selection
 */
export function getAllProfessions(): Array<{ value: string; label: string }> {
  return Object.entries(HPCSA_REQUIREMENTS).map(([code, req]) => ({
    value: code,
    label: `${req.profession} (${code})`,
  }))
}

/**
 * Constants
 */
export const CEU_VALIDITY_MONTHS = 12 // CEUs valid for 12 months as per Dec 2024 guidelines
export const CEU_EXPIRY_WARNING_DAYS = 30 // Warn users 30 days before expiry
