/**
 * Task 5 - Modular Transcript Processing and Fault-Tolerant JSON
 * File: main.js
 * 
 * Demonstrates:
 * - Default import (Student)
 * - Named imports with ALIASING (calculateGPA as computeGPA, calculateGrade as getGrade)
 * - try / catch / finally blocks for fault tolerance
 * - Handling various error scenarios (SyntaxError, TypeError, RangeError, duplicate IDs)
 */

import Student from './Student.js';
import { calculateAverage, calculateGPA as computeGPA, calculateGrade as getGrade } from './gradeUtils.js';
import { processTranscriptData } from './transcriptService.js';
import { fileURLToPath } from 'url';

export function runTask5() {
  console.log('='.repeat(70));
  console.log('Task 5 - Modular Transcript Processing and Fault-Tolerant JSON');
  console.log('='.repeat(70));

  // 1. Valid incoming JSON dataset (from lab specification)
  const validRawData = `
  [
    {
      "id": 101,
      "name": "Ali",
      "courses": [
        { "code": "CS301", "marks": 81 },
        { "code": "CS302", "marks": 74 }
      ]
    },
    {
      "id": 102,
      "name": "Sara",
      "courses": [
        { "code": "CS301", "marks": 92 },
        { "code": "CS302", "marks": 88 },
        { "code": "CS303", "marks": 79 }
      ]
    }
  ]
  `;

  // Test Case 1: Valid Transcript Processing
  console.log('\n--- Test 1: Processing Valid JSON Dataset ---');
  try {
    const { reportObject, reportJson } = processTranscriptData(validRawData);
    console.log('Success! Final Report Object Generated:');
    console.log(reportJson);

    // Demonstrate alias import computeGPA
    console.log('\n* Demonstrating Aliased Named Import (computeGPA & getGrade):');
    reportObject.students.forEach(s => {
      const gpa = computeGPA(s.courses);
      console.log(`Student ${s.name} GPA re-verified using aliased computeGPA: ${gpa}`);
    });

    // Demonstrate Default Import (Student instance check)
    const isFirstRecordStudentInstance = reportObject.students[0] instanceof Student;
    console.log(`Default export Student class verification: instanceof Student = ${isFirstRecordStudentInstance}`);

  } catch (err) {
    console.error(`Unexpected failure in valid test: ${err.message}`);
  } finally {
    console.log('[FINALLY] Test 1 completed cleanup.');
  }

  // Test Case 2: Malformed JSON
  console.log('\n--- Test 2: Handling Malformed JSON Syntax ---');
  const malformedJson = `[ { "id": 103, "name": "Broken" "courses": [] } ]`; // Missing comma
  try {
    processTranscriptData(malformedJson);
  } catch (err) {
    console.log(`Caught Expected Error: [${err.name}] ${err.message}`);
    console.log(`Is SyntaxError: ${err instanceof SyntaxError}`);
  } finally {
    console.log('[FINALLY] Test 2 completed cleanup.');
  }

  // Test Case 3: Missing Student ID
  console.log('\n--- Test 3: Handling Missing Student ID ---');
  const missingIdJson = `[ { "name": "No ID Student", "courses": [] } ]`;
  try {
    processTranscriptData(missingIdJson);
  } catch (err) {
    console.log(`Caught Expected Error: [${err.name}] ${err.message}`);
  } finally {
    console.log('[FINALLY] Test 3 completed cleanup.');
  }

  // Test Case 4: Duplicate Student ID
  console.log('\n--- Test 4: Handling Duplicate Student IDs ---');
  const duplicateIdJson = `
  [
    { "id": 105, "name": "Bilal", "courses": [] },
    { "id": 105, "name": "Bilal Clone", "courses": [] }
  ]
  `;
  try {
    processTranscriptData(duplicateIdJson);
  } catch (err) {
    console.log(`Caught Expected Error: [${err.name}] ${err.message}`);
  } finally {
    console.log('[FINALLY] Test 4 completed cleanup.');
  }

  // Test Case 5: Course Marks Out of Range (Below 0 or Above 100)
  console.log('\n--- Test 5: Handling Out-of-Range Course Marks ---');
  const outOfRangeMarksJson = `
  [
    {
      "id": 106,
      "name": "Kamran",
      "courses": [
        { "code": "CS301", "marks": 115 }
      ]
    }
  ]
  `;
  try {
    processTranscriptData(outOfRangeMarksJson);
  } catch (err) {
    console.log(`Caught Expected Error: [${err.name}] ${err.message}`);
    console.log(`Is RangeError: ${err instanceof RangeError}`);
  } finally {
    console.log('[FINALLY] Test 5 completed cleanup.');
  }

  // Test Case 6: Missing Course Code
  console.log('\n--- Test 6: Handling Missing Course Code ---');
  const missingCourseCodeJson = `
  [
    {
      "id": 107,
      "name": "Nida",
      "courses": [
        { "marks": 85 }
      ]
    }
  ]
  `;
  try {
    processTranscriptData(missingCourseCodeJson);
  } catch (err) {
    console.log(`Caught Expected Error: [${err.name}] ${err.message}`);
    console.log(`Is TypeError: ${err instanceof TypeError}`);
  } finally {
    console.log('[FINALLY] Test 6 completed cleanup.');
  }
}

// Auto-run when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask5();
}
