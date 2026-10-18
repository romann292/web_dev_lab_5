/**
 * Task 7 - Promise-Based Multi-Service Registration Engine (12 Marks)
 * 
 * Case Study: CampusFlow Academic Operations System
 * 
 * Demonstrates:
 * - Promise Creation (new Promise(resolve, reject))
 * - Promise Chaining (.then() with strict return value propagation)
 * - Error Handling (.catch())
 * - Settlement Cleanup (.finally())
 * - Promise.allSettled() for resilient post-registration notifications
 * - Promise.any() for high-availability service selection (First Successful vs First Settled)
 * - Detailed comparison between Promise.race() and Promise.any()
 */

import { fileURLToPath } from 'url';

// -------------------------------------------------------------
// Asynchronous Service Definitions (Promise-based)
// -------------------------------------------------------------

/**
 * Retrieves student profile by ID.
 * @param {number} studentId 
 * @returns {Promise<Object>}
 */
export function getStudent(studentId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const students = {
        101: { id: 101, name: 'Ali Khan', passed: ['CS101', 'CS201', 'CS301'] },
        102: { id: 102, name: 'Hamza', passed: ['CS101'] } // Missing CS301
      };
      const student = students[studentId];
      if (!student) {
        reject(new Error(`Student ${studentId} not found.`));
      } else {
        resolve(student);
      }
    }, 40);
  });
}

/**
 * Retrieves course details by code.
 * @param {string} courseCode 
 * @returns {Promise<Object>}
 */
export function getCourse(courseCode) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const courses = {
        'CS401': { code: 'CS401', title: 'Advanced Web Dev', prerequisite: 'CS301', seats: 5 },
        'CS402': { code: 'CS402', title: 'Distributed Systems', prerequisite: 'CS201', seats: 0 } // Full
      };
      const course = courses[courseCode];
      if (!course) {
        reject(new Error(`Course ${courseCode} not found.`));
      } else {
        resolve(course);
      }
    }, 40);
  });
}

/**
 * Validates whether the student has completed course prerequisites.
 * @param {Object} context - { student, course }
 * @returns {Promise<Object>} Returns context if valid
 */
export function checkPrerequisites(context) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { student, course } = context;
      if (course.prerequisite && !student.passed.includes(course.prerequisite)) {
        reject(new Error(`Prerequisite ${course.prerequisite} not satisfied by student ${student.id}.`));
      } else {
        resolve(context);
      }
    }, 30);
  });
}

/**
 * Validates available course capacity.
 * @param {Object} context - { student, course }
 * @returns {Promise<Object>} Returns context if seats available
 */
export function checkSeats(context) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { course } = context;
      if (course.seats <= 0) {
        reject(new Error(`Course ${course.code} has no available seats.`));
      } else {
        course.seats -= 1; // Allocate seat
        resolve(context);
      }
    }, 30);
  });
}

/**
 * Registers student into the course and produces confirmation.
 * @param {Object} context - { student, course }
 * @returns {Promise<Object>} Registration Confirmation
 */
export function registerStudent(context) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { student, course } = context;
      resolve({
        studentId: student.id,
        course: course.code,
        status: 'REGISTERED',
        timestamp: new Date().toISOString()
      });
    }, 30);
  });
}

// -------------------------------------------------------------
// Post-Registration Services (Part B)
// -------------------------------------------------------------

export function sendEmail(student, course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulating 100% reliable email
      resolve(`Email confirmation delivered to ${student?.name ?? 'student'}`);
    }, 50);
  });
}

export function sendSMS(student, course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulating SMS gateway outage / rejection
      reject(new Error('SMS Gateway connection timed out (Vendor 503 Service Unavailable)'));
    }, 30);
  });
}

export function writeAuditLog(student, course) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Audit log entry persisted for Registration: Student ${student?.id ?? '101'}`);
    }, 40);
  });
}

// -------------------------------------------------------------
// Part A - Registration Chain
// -------------------------------------------------------------
export function runRegistrationChain(studentId, courseCode) {
  console.log(`\n--- Part A: Registration Promise Chain (${studentId} -> ${courseCode}) ---`);

  // Context accumulator object passed along the chain
  let chainContext = {};

  return getStudent(studentId)
    .then(student => {
      chainContext.student = student;
      // MUST RETURN the next promise to keep chain active!
      return getCourse(courseCode);
    })
    .then(course => {
      chainContext.course = course;
      // Pass bundled context forward
      return checkPrerequisites(chainContext);
    })
    .then(validatedContext => {
      return checkSeats(validatedContext);
    })
    .then(readyContext => {
      return registerStudent(readyContext);
    })
    .then(confirmation => {
      console.log('Registration Succeeded:', confirmation);
      return confirmation;
    })
    .catch(error => {
      console.error(`Registration Failed at stage: ${error.message}`);
      throw error;
    })
    .finally(() => {
      console.log(`[FINALLY] Registration workflow for student ${studentId} completed.`);
    });
}

// -------------------------------------------------------------
// Part B - Post-Registration Services using Promise.allSettled
// -------------------------------------------------------------
export function runPostRegistrationServices(student, course) {
  console.log('\n--- Part B: Post-Registration Services (Promise.allSettled) ---');

  // Trigger all 3 background services concurrently
  const emailPromise = sendEmail(student, course);
  const smsPromise = sendSMS(student, course);
  const auditPromise = writeAuditLog(student, course);

  return Promise.allSettled([
    emailPromise.then(val => ({ service: 'Email', value: val })),
    smsPromise.then(val => ({ service: 'SMS', value: val })),
    auditPromise.then(val => ({ service: 'Audit', value: val }))
  ]).then(settledResults => {
    // Transform into clean report required by lab manual:
    // [ { service: 'Email', status: 'fulfilled' }, ... ]
    const report = settledResults.map((res, index) => {
      const serviceNames = ['Email', 'SMS', 'Audit'];
      return {
        service: serviceNames[index],
        status: res.status,
        ...(res.status === 'fulfilled' ? { result: res.value?.value } : { error: res.reason?.message })
      };
    });

    console.log('Post-Registration Multi-Service Report:');
    console.log(JSON.stringify(report, null, 2));
    return report;
  });
}

// -------------------------------------------------------------
// Part C - Service Selection (Promise.any vs Promise.race)
// -------------------------------------------------------------

/**
 * Simulates Primary Server (unhealthy or down, rejects fast in 20ms)
 */
function fetchCourseFromServer1(code) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Server 1 (Primary) failed: 502 Bad Gateway`));
    }, 20);
  });
}

/**
 * Simulates Secondary Mirror Server (healthy, resolves successfully in 60ms)
 */
function fetchCourseFromServer2(code) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        server: 'Server 2 (Backup Mirror)',
        code,
        title: 'Advanced Web Development',
        status: 'ONLINE'
      });
    }, 60);
  });
}

/**
 * Part C demonstration and justification
 */
export async function runServiceSelection(courseCode) {
  console.log('\n--- Part C: Service Selection (First Successful Result) ---');

  console.log(`
Justification of Promise Combinator:
We MUST use Promise.any() rather than Promise.race().
- Promise.race(): Settles immediately when ANY promise settles (whether fulfilled OR rejected).
  If Server 1 fails fast with a network outage or 502 error in 20ms, Promise.race() immediately
  aborts and rejects the entire request, even though Server 2 successfully responds 40ms later!
- Promise.any(): Ignores rejections from failing servers and waits for the FIRST SUCCESSFUL
  (fulfilled) promise. It only rejects if ALL servers fail (yielding an AggregateError).
  Therefore, Promise.any() provides true high availability and fault tolerance.
  `);

  // Demonstrate Promise.race() failing:
  try {
    console.log('* Attempting with Promise.race() [Fragile]:');
    await Promise.race([fetchCourseFromServer1(courseCode), fetchCourseFromServer2(courseCode)]);
    console.log('Promise.race unexpectedly resolved.');
  } catch (err) {
    console.log(`  Promise.race() REJECTED prematurely because Server 1 failed fast: "${err.message}"`);
  }

  // Demonstrate Promise.any() succeeding:
  try {
    console.log('\n* Attempting with Promise.any() [Resilient]:');
    const winningResult = await Promise.any([
      fetchCourseFromServer1(courseCode),
      fetchCourseFromServer2(courseCode)
    ]);
    console.log('  Promise.any() SUCCESS! First successful response accepted:');
    console.log(' ', winningResult);
    return winningResult;
  } catch (aggregateErr) {
    console.error('All servers failed:', aggregateErr.errors);
  }
}

// -------------------------------------------------------------
// Demonstration & Comprehensive Test Cases
// -------------------------------------------------------------
export async function runTask7() {
  console.log('='.repeat(70));
  console.log('Task 7 - Promise-Based Multi-Service Registration Engine');
  console.log('='.repeat(70));

  // 1. Part A: Successful Registration
  const student = await getStudent(101);
  const course = await getCourse('CS401');
  await runRegistrationChain(101, 'CS401');

  // 2. Part A: Failing chain (Prerequisite failure)
  try {
    await runRegistrationChain(102, 'CS401');
  } catch {
    // handled in chain
  }

  // 3. Part B: Post Registration
  await runPostRegistrationServices(student, course);

  // 4. Part C: Service Selection
  await runServiceSelection('CS401');
}

// Auto-run when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask7();
}
