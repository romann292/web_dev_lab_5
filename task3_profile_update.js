/**
 * Task 3 - Safe Student Profile Update Service
 * 
 * Case Study: CampusFlow Academic Operations System
 * 
 * Demonstrates Modern JavaScript Features:
 * 1. Object Destructuring
 * 2. Nested Destructuring
 * 3. Renaming during Destructuring
 * 4. Default Values in Destructuring
 * 5. Array Destructuring
 * 6. Rest Parameters (...restArgs)
 * 7. Object Rest ({ id, ...rest })
 * 8. Spread Operator (...spread)
 * 9. Optional Chaining (?.)
 * 10. Nullish Coalescing (??)
 * 11. Property Value Shorthand ({ name, address, contact })
 * 
 * Implements the Reference Equality Challenge.
 */

import { fileURLToPath } from 'url';

/**
 * Safely updates a student profile immutably.
 * Uses rest parameters, nested destructuring, object rest, spread, optional chaining, and nullish coalescing.
 * 
 * @param {Object} baseStudent - Original student object (immutable)
 * @param {...Object} updateBatches - One or more update patch objects (rest parameters)
 * @returns {Object} A brand new student object with updated fields
 */
export function updateStudentProfile(baseStudent, ...updateBatches) {
  // Guard clause: ensure valid base object
  if (!baseStudent || typeof baseStudent !== 'object') {
    throw new TypeError('Base student must be a valid object');
  }

  // 1. Array destructuring with default fallback
  const [primaryUpdate = {}, ...additionalUpdates] = updateBatches;

  // Merge any subsequent update patches into a single cumulative update using reduce and object spread
  const cumulativeUpdate = additionalUpdates.reduce(
    (acc, patch) => ({ ...acc, ...patch }),
    { ...primaryUpdate }
  );

  // 2. Object Rest & Destructuring with Renaming:
  // We extract 'id' to ensure it remains immutable, and extract other fields with renaming
  const {
    id: protectedId, // Renaming during destructuring
    name: updatedName,
    marks: updatedMarks,
    scholarship: updatedScholarship,
    address: updateAddress,
    contact: updateContact,
    ...otherUpdatedFields // Object Rest
  } = cumulativeUpdate;

  // 3. Object Destructuring with Default Values:
  // Notice: We extract existing values with default fallbacks
  const {
    id: originalId,
    name: originalName = 'Anonymous',
    marks: originalMarks = 0,
    scholarship: originalScholarship = false,
    address: originalAddress = {},
    contact: originalContact = {},
    ...otherOriginalFields
  } = baseStudent;

  // 4. Nested Destructuring:
  // Extracting city and sector from original address
  const { city: originalCity, sector: originalSector = 'General' } = originalAddress;
  // Extracting email and phone from original contact
  const { email: originalEmail, phone: originalPhone = null } = originalContact;

  // 5. Optional Chaining and Nullish Coalescing:
  // CRITICAL REQUIREMENT: Valid falsy values such as 0, false, and "" must NOT be replaced with defaults!
  // ?? only falls back if the left-hand side is null or undefined, preserving 0, false, and ""!
  const resolvedName = updatedName ?? originalName;
  const resolvedMarks = updatedMarks ?? originalMarks;
  const resolvedScholarship = updatedScholarship ?? originalScholarship;

  // 6. Safe nested object merges with spread and property shorthand
  const resolvedAddress = {
    ...originalAddress,
    city: updateAddress?.city ?? originalCity,
    sector: updateAddress?.sector ?? originalSector
  };

  const resolvedContact = {
    ...originalContact,
    email: updateContact?.email ?? originalEmail,
    phone: updateContact?.phone ?? originalPhone
  };

  // 7. Property Value Shorthand construction of the new object
  const updatedStudent = {
    id: originalId, // ID is protected against tampering
    name: resolvedName,
    marks: resolvedMarks,
    scholarship: resolvedScholarship,
    address: resolvedAddress,
    contact: resolvedContact,
    ...otherOriginalFields,
    ...otherUpdatedFields
  };

  return updatedStudent;
}

/**
 * Demonstrates and explains the Reference Challenge.
 */
export function testReferenceChallenge(original, updated) {
  const isObjectEqual = original === updated;
  const isAddressEqual = original.address === updated.address;
  const isContactEqual = original.contact === updated.contact;

  const explanations = [
    {
      comparison: 'original object === updated object',
      result: isObjectEqual,
      expected: false,
      explanation:
        'A new object literal was instantiated in heap memory via object spread and property shorthand. In JavaScript, non-primitive objects are compared by reference (memory pointer), not by structural content.'
    },
    {
      comparison: 'original.address === updated.address',
      result: isAddressEqual,
      expected: false,
      explanation:
        'The address property was assigned a newly created nested object via { ...originalAddress, city: ... }. Thus, updated.address points to an entirely different memory address than original.address.'
    },
    {
      comparison: 'original.contact === updated.contact',
      result: isContactEqual,
      expected: false,
      explanation:
        'The contact property was also created anew via { ...originalContact, phone: ... } to incorporate phone without mutating original.contact. Hence, their memory references differ.'
    }
  ];

  return explanations;
}

// -------------------------------------------------------------
// Demonstration & Comprehensive Test Cases
// -------------------------------------------------------------
export function runTask3() {
  console.log('='.repeat(70));
  console.log('Task 3 - Safe Student Profile Update Service');
  console.log('='.repeat(70));

  // 1. Initial State from Lab Specification
  const originalStudent = Object.freeze({
    id: 101,
    name: 'Ali',
    marks: 0, // Valid 0 value - must not be overwritten by fallback
    scholarship: false, // Valid false value - must not be overwritten
    address: Object.freeze({
      city: 'Islamabad',
      sector: 'F-10'
    }),
    contact: Object.freeze({
      email: 'ali@university.edu'
    })
  });

  // 2. Profile Update Request
  const updateRequest = {
    name: 'Ali Khan',
    address: {
      city: 'Rawalpindi'
    },
    contact: {
      phone: '03001234567'
    }
  };

  console.log('\n--- Original Student Object ---');
  console.log(JSON.stringify(originalStudent, null, 2));

  console.log('\n--- Update Request Patch ---');
  console.log(JSON.stringify(updateRequest, null, 2));

  // Execute update
  const updatedStudent = updateStudentProfile(originalStudent, updateRequest);

  console.log('\n--- Updated Student Object ---');
  console.log(JSON.stringify(updatedStudent, null, 2));

  // Validation of Specific Lab Requirements
  console.log('\n--- Requirement Verifications ---');
  console.log(`1. Address city changed to Rawalpindi: ${updatedStudent.address.city === 'Rawalpindi'}`);
  console.log(`2. Address sector remained F-10: ${updatedStudent.address.sector === 'F-10'}`);
  console.log(`3. Contact email remained ali@university.edu: ${updatedStudent.contact.email === 'ali@university.edu'}`);
  console.log(`4. Contact phone added as 03001234567: ${updatedStudent.contact.phone === '03001234567'}`);
  console.log(`5. Marks preserved as 0 (not overridden by truthy checks): ${updatedStudent.marks === 0}`);
  console.log(`6. Scholarship preserved as false (not overridden): ${updatedStudent.scholarship === false}`);

  // Test Boundary with 0, false, and empty string update
  console.log('\n* Testing updates with legitimate 0, false, and empty string values:');
  const zeroFalseUpdate = {
    marks: 0,
    scholarship: false,
    name: '' // empty string
  };
  const updatedWithZero = updateStudentProfile(updatedStudent, zeroFalseUpdate);
  console.log(`   Marks: ${updatedWithZero.marks} (Expected 0)`);
  console.log(`   Scholarship: ${updatedWithZero.scholarship} (Expected false)`);
  console.log(`   Name: '${updatedWithZero.name}' (Expected '')`);

  // Reference Challenge
  console.log('\n--- Reference Challenge Results & Explanations ---');
  const refResults = testReferenceChallenge(originalStudent, updatedStudent);
  refResults.forEach(r => {
    console.log(`\nComparison: ${r.comparison}`);
    console.log(`Result:     ${r.result} (Matches Expected: ${r.result === r.expected})`);
    console.log(`Reason:     ${r.explanation}`);
  });

  return { originalStudent, updatedStudent, refResults };
}

// Auto-run when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask3();
}
