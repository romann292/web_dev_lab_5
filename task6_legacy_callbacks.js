/**
 * Task 6 - Legacy Course Registration Service Using Callbacks
 * 
 * Case Study: CampusFlow Academic Operations System
 * 
 * Flow:
 * Load Student -> Check Prerequisites -> Check Available Seats -> Register Course
 * 
 * Rules:
 * - Error-first callback convention: callback(error, value)
 * - Each async operation calls its callback exactly once.
 * - Stop immediately when any stage fails.
 * - STRICTLY NO Promises, NO async/await.
 * - Handles every asynchronous boundary via setTimeout.
 */

import { fileURLToPath } from 'url';

// Mock Database Records
const MOCK_STUDENTS = {
  101: {
    id: 101,
    name: 'Ali Khan',
    passedCourses: ['CS101', 'CS201', 'CS301'],
    registeredCourses: ['CS302']
  },
  102: {
    id: 102,
    name: 'Bilal Ahmed',
    passedCourses: ['CS101'], // Lacks CS301 prerequisite for CS401
    registeredCourses: []
  },
  103: {
    id: 103,
    name: 'Sara Tariq',
    passedCourses: ['CS101', 'CS201', 'CS301'],
    registeredCourses: ['CS401'] // Already registered
  }
};

const MOCK_COURSES = {
  'CS401': {
    code: 'CS401',
    name: 'Advanced Web Development',
    prerequisite: 'CS301',
    availableSeats: 5
  },
  'CS402': {
    code: 'CS402',
    name: 'Cloud Computing',
    prerequisite: 'CS201',
    availableSeats: 0 // Course is full
  }
};

/**
 * Stage 1: Load Student
 * @param {number} studentId 
 * @param {Function} callback - callback(error, student)
 */
export function loadStudent(studentId, callback) {
  setTimeout(() => {
    const student = MOCK_STUDENTS[studentId];
    if (!student) {
      return callback(new Error(`Student with ID ${studentId} does not exist.`));
    }
    return callback(null, student);
  }, 50);
}

/**
 * Stage 2: Check Prerequisites
 * @param {Object} student 
 * @param {string} courseCode 
 * @param {Function} callback - callback(error, course)
 */
export function checkPrerequisites(student, courseCode, callback) {
  setTimeout(() => {
    const course = MOCK_COURSES[courseCode];
    if (!course) {
      return callback(new Error(`Course ${courseCode} does not exist.`));
    }

    // Check if already registered
    if (student.registeredCourses.includes(courseCode)) {
      return callback(new Error(`Student ${student.id} is already registered in course ${courseCode}.`));
    }

    // Check prerequisite
    if (course.prerequisite && !student.passedCourses.includes(course.prerequisite)) {
      return callback(
        new Error(`Prerequisite not completed: ${course.prerequisite} is required for ${courseCode}.`)
      );
    }

    return callback(null, course);
  }, 50);
}

/**
 * Stage 3: Check Available Seats
 * @param {Object} course 
 * @param {Function} callback - callback(error, course)
 */
export function checkAvailableSeats(course, callback) {
  setTimeout(() => {
    if (course.availableSeats <= 0) {
      return callback(new Error(`Course ${course.code} is full. No available seats remaining.`));
    }
    return callback(null, course);
  }, 50);
}

/**
 * Stage 4: Register Course
 * @param {Object} student 
 * @param {Object} course 
 * @param {Function} callback - callback(error, confirmation)
 */
export function registerCourse(student, course, callback) {
  setTimeout(() => {
    // Atomically decrement seats and assign course
    course.availableSeats -= 1;
    student.registeredCourses.push(course.code);

    const confirmation = {
      studentId: student.id,
      course: course.code,
      status: 'REGISTERED'
    };

    return callback(null, confirmation);
  }, 50);
}

/**
 * Orchestrator: Chains all 4 dependent asynchronous operations using nested error-first callbacks.
 * 
 * @param {number} studentId 
 * @param {string} courseCode 
 * @param {Function} finalCallback - finalCallback(error, result)
 */
export function registerStudentLegacy(studentId, courseCode, finalCallback) {
  // Step 1: Load Student
  loadStudent(studentId, (err1, student) => {
    if (err1) {
      return finalCallback(err1, null);
    }

    // Step 2: Check Prerequisites
    checkPrerequisites(student, courseCode, (err2, course) => {
      if (err2) {
        return finalCallback(err2, null);
      }

      // Step 3: Check Available Seats
      checkAvailableSeats(course, (err3, validCourse) => {
        if (err3) {
          return finalCallback(err3, null);
        }

        // Step 4: Register Course
        registerCourse(student, validCourse, (err4, confirmation) => {
          if (err4) {
            return finalCallback(err4, null);
          }

          // Successful completion
          return finalCallback(null, confirmation);
        });
      });
    });
  });
}

// -------------------------------------------------------------
// Demonstration & Comprehensive Test Cases
// -------------------------------------------------------------
export function runTask6(doneCallback) {
  console.log('='.repeat(70));
  console.log('Task 6 - Legacy Course Registration Service Using Callbacks');
  console.log('='.repeat(70));

  console.log('\n--- Architectural Analysis: The Callback Pyramid of Doom ---');
  console.log(`
Why this type of dependent asynchronous workflow becomes difficult to maintain:
1. Deep Callback Nesting (Pyramid of Doom / Callback Hell):
   Each sequential asynchronous step introduces an additional level of indentation.
   As the number of steps grows (e.g., 10 or 20 dependent stages), code drifts heavily
   to the right, making visual scanning and code comprehension onerous.

2. Repetitive Error Propagation Boilerplate:
   Every single callback requires manual check and forwarding ('if (err) return cb(err);').
   Missing a single error check causes silent failure or unhandled exceptions that crash
   or hang the execution pipeline.

3. Inversion of Control & Trust Issues:
   With raw callbacks, the calling code surrenders control to the invoked function.
   If a third-party or internal function accidentally calls the callback twice or never calls
   it at all, your business logic can double-charge or hang indefinitely.

4. Incompatibility with Standard Control Structures:
   Standard JavaScript language constructs like try/catch/finally, loops (for/while),
   and early returns cannot traverse asynchronous callback boundaries.
  `);

  console.log('--- Executing Test Cases ---');

  // Test 1: Successful Registration
  registerStudentLegacy(101, 'CS401', (err, result) => {
    console.log('\nTest Case 1: Successful Registration (Student 101 -> CS401)');
    if (err) {
      console.error('Test 1 Failed:', err.message);
    } else {
      console.log('Test 1 Success Confirmation:', JSON.stringify(result, null, 2));
    }

    // Test 2: Student Does Not Exist Failure
    registerStudentLegacy(999, 'CS401', (err2, result2) => {
      console.log('\nTest Case 2: Failure - Student Does Not Exist (ID 999)');
      if (err2) {
        console.log(`Expected Error Caught: ${err2.message}`);
      } else {
        console.error('Test 2 Unexpectedly Succeeded:', result2);
      }

      // Test 3: Prerequisite Not Completed Failure
      registerStudentLegacy(102, 'CS401', (err3, result3) => {
        console.log('\nTest Case 3: Failure - Prerequisite Not Completed (Student 102 -> CS401)');
        if (err3) {
          console.log(`Expected Error Caught: ${err3.message}`);
        } else {
          console.error('Test 3 Unexpectedly Succeeded:', result3);
        }

        // Test 4: Course is Full Failure
        registerStudentLegacy(101, 'CS402', (err4, result4) => {
          console.log('\nTest Case 4: Failure - Course is Full (Course CS402 has 0 seats)');
          if (err4) {
            console.log(`Expected Error Caught: ${err4.message}`);
          } else {
            console.error('Test 4 Unexpectedly Succeeded:', result4);
          }

          // Test 5: Student Already Registered Failure
          registerStudentLegacy(103, 'CS401', (err5, result5) => {
            console.log('\nTest Case 5: Failure - Student Already Registered (Student 103)');
            if (err5) {
              console.log(`Expected Error Caught: ${err5.message}`);
            } else {
              console.error('Test 5 Unexpectedly Succeeded:', result5);
            }

            console.log('\n[Task 6 Callback Pipeline Completed Successfully]');
            if (typeof doneCallback === 'function') {
              doneCallback();
            }
          });
        });
      });
    });
  });
}

// Auto-run when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask6();
}
