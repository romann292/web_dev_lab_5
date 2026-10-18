/**
 * Task 1 - Admission Decision and Data Sanitization Engine
 * 
 * Case Study: CampusFlow Academic Operations System
 * 
 * Concepts Demonstrated:
 * - Variables & Primitive Types (const, let, string, number, boolean)
 * - Explicit Type Conversion (Number, Boolean, String trimming)
 * - Truthy/Falsy Handling
 * - Guard Clauses for Data Validation
 * - Arithmetic and Comparison Operators (strict equality ===, !==)
 * - Pure Functions & Source Data Immutability
 * - Comprehensive Boundary and Edge Case Handling
 */

// Supported Academic Programs at Air University
export const SUPPORTED_PROGRAMS = Object.freeze(['BSCS', 'BSSE', 'BSAI', 'BSIT', 'BSDS']);

/**
 * Top-level pure helper to validate and convert marks.
 * Returns { value, error } without capturing or retaining any outer state.
 * 
 * @param {any} fieldValue 
 * @param {string} fieldName 
 * @returns {{ value: number|null, error: string|null }}
 */
export function parseAndValidateMark(fieldValue, fieldName) {
  const str = String(fieldValue ?? '').trim();
  const num = Number(str);
  if (str === '' || Number.isNaN(num)) {
    return { value: null, error: `Invalid numeric marks for '${fieldName}': '${fieldValue}'` };
  }
  if (num < 0 || num > 100) {
    return { value: null, error: `Marks for '${fieldName}' (${num}) must be between 0 and 100` };
  }
  return { value: num, error: null };
}


/**
 * Sanitizes and validates a single applicant object.
 * Returns a sanitized applicant object with validation status, calculated merit, and error details.
 * Does NOT mutate the input object.
 * 
 * @param {Object} rawApplicant - Raw applicant data from external form
 * @returns {Object} Sanitized applicant record with status and merit
 */
export function processApplicant(rawApplicant) {
  // Guard Clause: Applicant must be a valid non-null object
  if (!rawApplicant || typeof rawApplicant !== 'object' || Array.isArray(rawApplicant)) {
    return {
      id: rawApplicant?.id ?? 'UNKNOWN',
      name: rawApplicant?.name ?? 'Unknown',
      isValid: false,
      errors: ['Input is not a valid applicant record object'],
      status: 'INVALID DATA',
      merit: null
    };
  }

  const errors = [];

  // 1. Identify missing fields
  const requiredFields = ['id', 'name', 'age', 'matricMarks', 'intermediateMarks', 'entryTest', 'program', 'feePaid'];
  for (const field of requiredFields) {
    if (rawApplicant[field] === undefined || rawApplicant[field] === null || String(rawApplicant[field]).trim() === '') {
      errors.push(`Missing or empty required field: '${field}'`);
    }
  }

  // 2. Explicit Numeric Conversions & Validations
  // Age validation: Between 17 and 30
  const ageStr = String(rawApplicant.age ?? '').trim();
  const parsedAge = Number(ageStr);
  const isAgeValid = ageStr !== '' && !Number.isNaN(parsedAge) && Number.isInteger(parsedAge);
  
  if (!isAgeValid) {
    errors.push(`Invalid age value '${rawApplicant.age}': must be a valid integer`);
  } else if (parsedAge < 17 || parsedAge > 30) {
    errors.push(`Age ${parsedAge} is outside the allowed range of 17 to 30 years`);
  }

  const matricResult = parseAndValidateMark(rawApplicant.matricMarks, 'matricMarks');
  if (matricResult.error) errors.push(matricResult.error);
  const matric = matricResult.value;

  const interResult = parseAndValidateMark(rawApplicant.intermediateMarks, 'intermediateMarks');
  if (interResult.error) errors.push(interResult.error);
  const intermediate = interResult.value;

  const entryResult = parseAndValidateMark(rawApplicant.entryTest, 'entryTest');
  if (entryResult.error) errors.push(entryResult.error);
  const entryTest = entryResult.value;


  // 3. Program Verification
  const program = String(rawApplicant.program ?? '').trim().toUpperCase();
  if (!SUPPORTED_PROGRAMS.includes(program)) {
    errors.push(`Unsupported program '${rawApplicant.program}'. Allowed programs: ${SUPPORTED_PROGRAMS.join(', ')}`);
  }

  // 4. Fee Paid Conversion
  const feePaidStr = String(rawApplicant.feePaid ?? '').trim().toLowerCase();
  let feePaid = false;
  if (feePaidStr === 'true') {
    feePaid = true;
  } else if (feePaidStr === 'false') {
    feePaid = false;
  } else {
    errors.push(`Invalid feePaid status '${rawApplicant.feePaid}': must be 'true' or 'false'`);
  }

  // Guard Clause: If any validation failed, return INVALID DATA status without calculating merit
  if (errors.length > 0) {
    return {
      id: String(rawApplicant.id ?? 'UNKNOWN').trim(),
      name: String(rawApplicant.name ?? 'Unknown').trim(),
      age: isAgeValid ? parsedAge : rawApplicant.age,
      matricMarks: matric,
      intermediateMarks: intermediate,
      entryTest: entryTest,
      program: program,
      feePaid: feePaid,
      isValid: false,
      errors: errors,
      status: 'INVALID DATA',
      merit: null
    };
  }

  // 5. Merit Calculation
  // Formula: Matric 20%, Intermediate 30%, Entry Test 50%
  const calculatedMerit = Number(((matric * 0.20) + (intermediate * 0.30) + (entryTest * 0.50)).toFixed(2));

  // 6. Eligibility Criteria Evaluation
  // Applicant is eligible ONLY IF: Merit >= 70 AND Entry Test >= 60 AND Intermediate >= 60
  const isEligible = calculatedMerit >= 70 && entryTest >= 60 && intermediate >= 60;

  // 7. Status Determination
  // Rules distinguishing SELECTED vs WAITING:
  // - REJECTED: Valid data but failed minimum eligibility criteria (Merit < 70, Entry Test < 60, or Inter < 60).
  // - SELECTED: Eligible, fee is confirmed paid (feePaid === true), and merit >= 75 (Direct Admission Merit Quota).
  // - WAITING: Eligible, but either fee is pending (feePaid === false) OR merit is between 70.00 and 74.99 (Waiting List Quota).
  let status;
  if (!isEligible) {
    status = 'REJECTED';
  } else if (feePaid && calculatedMerit >= 75) {
    status = 'SELECTED';
  } else {
    status = 'WAITING';
  }

  return {
    id: String(rawApplicant.id).trim(),
    name: String(rawApplicant.name).trim(),
    age: parsedAge,
    matricMarks: matric,
    intermediateMarks: intermediate,
    entryTest: entryTest,
    program: program,
    feePaid: feePaid,
    isValid: true,
    errors: [],
    merit: calculatedMerit,
    status: status
  };
}

/**
 * Processes an array of applicants and produces sanitized results along with an analytics summary.
 * 
 * @param {Array<Object>} applicantList - List of raw applicants
 * @returns {Object} { processedApplicants: Array, summary: Object }
 */
export function processAdmissions(applicantList) {
  if (!Array.isArray(applicantList)) {
    throw new TypeError('Input must be an array of applicant records.');
  }

  const processed = applicantList.map(app => processApplicant(app));

  const validApplicants = processed.filter(app => app.isValid);
  const invalidApplicants = processed.filter(app => !app.isValid);

  let highestMeritApplicant = null;
  let lowestMeritApplicant = null;
  let totalMerit = 0;

  for (let i = 0; i < validApplicants.length; i++) {
    const app = validApplicants[i];
    totalMerit += app.merit;

    if (!highestMeritApplicant || app.merit > highestMeritApplicant.merit) {
      highestMeritApplicant = { id: app.id, name: app.name, merit: app.merit, program: app.program };
    }

    if (!lowestMeritApplicant || app.merit < lowestMeritApplicant.merit) {
      lowestMeritApplicant = { id: app.id, name: app.name, merit: app.merit, program: app.program };
    }
  }

  const averageMerit = validApplicants.length > 0
    ? Number((totalMerit / validApplicants.length).toFixed(2))
    : 0;

  // Count applicants per program
  const programCounts = {};
  for (const prog of SUPPORTED_PROGRAMS) {
    programCounts[prog] = 0;
  }
  for (const app of processed) {
    if (app.program && programCounts[app.program] !== undefined) {
      programCounts[app.program]++;
    }
  }

  const summary = {
    totalApplicants: processed.length,
    validApplicants: validApplicants.length,
    invalidApplicants: invalidApplicants.length,
    highestMeritApplicant: highestMeritApplicant,
    lowestMeritApplicant: lowestMeritApplicant,
    averageMerit: averageMerit,
    programCounts: programCounts
  };

  return {
    processedApplicants: processed,
    summary: summary
  };
}

// -------------------------------------------------------------
// Demonstration & Comprehensive Test Cases
// -------------------------------------------------------------
export function runTask1() {
  console.log('='.repeat(70));
  console.log('Task 1 - Admission Decision and Data Sanitization Engine');
  console.log('='.repeat(70));

  // 1. Given Lab Specification Applicants
  const labApplicants = [
    {
      id: 'A101',
      name: 'Sara Khan',
      age: '19',
      matricMarks: '91',
      intermediateMarks: '87',
      entryTest: '78',
      program: 'BSCS',
      feePaid: 'true'
    },
    {
      id: 'A102',
      name: 'Ahmed Ali',
      age: 'twenty',
      matricMarks: '88',
      intermediateMarks: '',
      entryTest: '72',
      program: 'BSSE',
      feePaid: 'false'
    },
    {
      id: 'A103',
      name: 'Hassan',
      age: '18',
      matricMarks: '76',
      intermediateMarks: '83',
      entryTest: '91',
      program: 'BSAI',
      feePaid: 'true'
    }
  ];

  // 2. Additional Boundary & Edge Case Applicants
  const boundaryAndInvalidApplicants = [
    {
      id: 'A104',
      name: 'Zainab (Boundary: Min Age 17, Min Entry Test 60, Min Inter 60)',
      age: '17',
      matricMarks: '100',
      intermediateMarks: '60',
      entryTest: '60',
      program: 'BSIT',
      feePaid: 'true' // Merit = 20 + 18 + 30 = 68 -> < 70, REJECTED
    },
    {
      id: 'A105',
      name: 'Bilal (Boundary: Age 30, Merit = 74.0, Fee Paid -> WAITING list bracket)',
      age: '30',
      matricMarks: '70',
      intermediateMarks: '70',
      entryTest: '78',
      program: 'BSDS',
      feePaid: 'true' // Merit = 14 + 21 + 39 = 74.0 (< 75 threshold -> WAITING)
    },
    {
      id: 'A106',
      name: 'Hamza (Underage 16 -> INVALID)',
      age: '16',
      matricMarks: '85',
      intermediateMarks: '85',
      entryTest: '85',
      program: 'BSCS',
      feePaid: 'true'
    },
    {
      id: 'A107',
      name: 'Fatima (Marks > 100 -> INVALID)',
      age: '20',
      matricMarks: '105',
      intermediateMarks: '80',
      entryTest: '75',
      program: 'BSSE',
      feePaid: 'true'
    },
    {
      id: 'A108',
      name: 'Tariq (Unsupported Program BBA -> INVALID)',
      age: '22',
      matricMarks: '80',
      intermediateMarks: '80',
      entryTest: '80',
      program: 'BBA',
      feePaid: 'true'
    },
    {
      id: 'A109',
      name: 'Mariam (Eligible Merit 77.5, Fee Unpaid -> WAITING for Fee)',
      age: '21',
      matricMarks: '80',
      intermediateMarks: '75',
      entryTest: '78',
      program: 'BSAI',
      feePaid: 'false' // 16 + 22.5 + 39 = 77.5 >= 75, but fee unpaid -> WAITING
    }
  ];

  const allApplicants = [...labApplicants, ...boundaryAndInvalidApplicants];
  const { processedApplicants, summary } = processAdmissions(allApplicants);

  console.log('\n--- Processed Applicants Table ---');
  console.table(
    processedApplicants.map(a => ({
      ID: a.id,
      Name: a.name.length > 25 ? a.name.substring(0, 22) + '...' : a.name,
      Age: a.age,
      Matric: a.matricMarks,
      Inter: a.intermediateMarks,
      Entry: a.entryTest,
      Prog: a.program,
      Fee: a.feePaid,
      Valid: a.isValid,
      Merit: a.merit !== null ? a.merit : 'N/A',
      Status: a.status
    }))
  );

  console.log('\n--- Validation Errors for Invalid Records ---');
  processedApplicants
    .filter(a => !a.isValid)
    .forEach(a => {
      console.log(`[${a.id}] ${a.name}: ${a.errors.join('; ')}`);
    });

  console.log('\n--- Additional Challenge Summary ---');
  console.log(JSON.stringify(summary, null, 2));

  return { processedApplicants, summary };
}

import { fileURLToPath } from 'url';

// Auto-run when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask1();
}

