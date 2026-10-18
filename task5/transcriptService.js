/**
 * Task 5 - Modular Transcript Processing and Fault-Tolerant JSON
 * File: transcriptService.js
 * 
 * Provides robust, fault-tolerant JSON transcript parsing and validation.
 * Uses Student class and gradeUtils functions.
 */

import Student from './Student.js';
import { calculateGrade, calculateAverage, calculateGPA } from './gradeUtils.js';

/**
 * Parses raw JSON transcript data and performs strict validation.
 * 
 * @param {string} rawJsonString - Raw incoming JSON text
 * @returns {{ reportObject: Object, reportJson: string }}
 * @throws {SyntaxError|TypeError|RangeError|Error}
 */
export function processTranscriptData(rawJsonString) {
  // 1. Safe JSON parsing & Malformed JSON rejection
  if (typeof rawJsonString !== 'string') {
    throw new TypeError(`Incoming raw data must be a string, received ${typeof rawJsonString}`);
  }

  let parsedData;
  try {
    parsedData = JSON.parse(rawJsonString);
  } catch (err) {
    throw new SyntaxError(`Malformed JSON received: ${err.message}`);
  }

  if (!Array.isArray(parsedData)) {
    throw new TypeError('Expected JSON data to be an array of student records');
  }

  // Tracking set for duplicate student ID detection
  const seenIds = new Set();
  const processedStudents = [];

  for (let i = 0; i < parsedData.length; i++) {
    const rawRecord = parsedData[i];

    if (!rawRecord || typeof rawRecord !== 'object') {
      throw new TypeError(`Record at index ${i} is not a valid object`);
    }

    // 2. Reject missing student IDs
    if (rawRecord.id === undefined || rawRecord.id === null || String(rawRecord.id).trim() === '') {
      throw new Error(`Missing student ID at record index ${i}`);
    }

    const studentId = rawRecord.id;

    // 3. Reject duplicate student IDs
    if (seenIds.has(studentId)) {
      throw new Error(`Duplicate student ID detected: ${studentId}`);
    }
    seenIds.add(studentId);

    // Validate student name
    const studentName = String(rawRecord.name ?? 'Unknown Student').trim();

    // Validate courses
    if (!Array.isArray(rawRecord.courses)) {
      throw new TypeError(`Student [${studentId}] courses must be an array`);
    }

    const validatedCourses = [];

    for (let c = 0; c < rawRecord.courses.length; c++) {
      const course = rawRecord.courses[c];

      // 4. Reject missing course codes
      if (!course || typeof course !== 'object' || !course.code || String(course.code).trim() === '') {
        throw new TypeError(`Student [${studentId}] has a course with missing or empty course code at course index ${c}`);
      }

      const courseCode = String(course.code).trim();

      // 5. Reject course marks below 0 or above 100
      if (course.marks === undefined || course.marks === null || typeof course.marks !== 'number' || Number.isNaN(course.marks)) {
        throw new TypeError(`Student [${studentId}], Course [${courseCode}]: marks must be a valid number`);
      }

      if (course.marks < 0 || course.marks > 100) {
        throw new RangeError(
          `Student [${studentId}], Course [${courseCode}]: course marks must be between 0 and 100, received ${course.marks}`
        );
      }

      const { grade, points } = calculateGrade(course.marks);
      validatedCourses.push({
        code: courseCode,
        marks: course.marks,
        grade,
        gradePoints: points
      });
    }

    // 6. Calculate Average & GPA
    const average = calculateAverage(validatedCourses);
    const gpa = calculateGPA(validatedCourses);

    // Instantiate Student instance
    const studentInstance = new Student(studentId, studentName, validatedCourses, average, gpa);
    processedStudents.push(studentInstance);
  }

  // 7. Generate valid JavaScript report object
  const reportObject = {
    institution: 'Air University - CampusFlow Transcript Engine',
    timestamp: new Date().toISOString(),
    totalStudentsProcessed: processedStudents.length,
    overallCohortAverage: Number(
      (
        processedStudents.reduce((sum, s) => sum + s.average, 0) /
        (processedStudents.length || 1)
      ).toFixed(2)
    ),
    overallCohortGPA: Number(
      (
        processedStudents.reduce((sum, s) => sum + s.gpa, 0) /
        (processedStudents.length || 1)
      ).toFixed(2)
    ),
    students: processedStudents
  };

  // 8. Convert the final report back to JSON
  const reportJson = JSON.stringify(reportObject, null, 2);

  return {
    reportObject,
    reportJson
  };
}
