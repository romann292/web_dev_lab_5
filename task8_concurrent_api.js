/**
 * Task 8 - Concurrent Academic API Aggregator with async/await (12 Marks)
 * 
 * Case Study: CampusFlow Academic Operations System
 * 
 * Concepts Demonstrated:
 * - async / await syntax
 * - Fetch API abstraction (response.ok, response.json(), status handling)
 * - Concurrent execution via Promise.all() (avoiding sequential awaits)
 * - Error classification (HTTP failure, network error, invalid JSON, timeout/abort)
 * - Timeout Challenge with AbortController, setTimeout, clearTimeout, and try/finally
 * - Aggregation of academic dashboard analytics
 */

import { fileURLToPath } from 'url';

// -------------------------------------------------------------
// 1. Asynchronous fakeFetch Implementation
// -------------------------------------------------------------

/**
 * Simulates the browser/Node Fetch API for reproducible testing.
 * Supports: 200 Success, 404 Not Found, 500 Server Error, Network Failure, Invalid JSON, Slow Response, and AbortSignal.
 * 
 * @param {string} url - Requested URL endpoint
 * @param {Object} options - { signal?: AbortSignal }
 * @returns {Promise<Response>} A Response-shaped object
 */
export function fakeFetch(url, options = {}) {
  const signal = options?.signal;

  return new Promise((resolve, reject) => {
    // Check if already aborted before starting
    if (signal?.aborted) {
      return reject(new DOMException('The operation was aborted due to timeout', 'AbortError'));
    }

    // Set up abort listener
    let onAbort;
    if (signal) {
      onAbort = () => {
        reject(new DOMException('The operation was aborted due to timeout', 'AbortError'));
      };
      signal.addEventListener('abort', onAbort, { once: true });
    }

    // Simulate endpoint latency & responses
    let delay = 30;
    if (url === '/slow-endpoint') {
      delay = 200; // Intentionally slow to trigger timeout test
    }

    setTimeout(() => {
      // If signal aborted during the timer, don't proceed
      if (signal?.aborted) {
        return;
      }

      // Cleanup abort listener if still attached
      if (signal && onAbort) {
        signal.removeEventListener('abort', onAbort);
      }

      // 1. Simulate Network Failure
      if (url === '/network-failure') {
        return reject(new TypeError('Failed to fetch: Network error (ENOTFOUND dns lookup failed)'));
      }

      // 2. Simulate 404 Not Found
      if (url === '/not-found') {
        return resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({ error: 'Resource not found' })
        });
      }

      // 3. Simulate 500 Internal Server Error
      if (url === '/server-error') {
        return resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Database connection failed' })
        });
      }

      // 4. Simulate Invalid / Corrupted JSON
      if (url === '/invalid-json') {
        return resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => {
            throw new SyntaxError('Unexpected token < in JSON at position 0');
          }
        });
      }

      // 5. Successful Endpoints for Dashboard
      if (url === '/users') {
        return resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => [
            { id: 1, name: 'Ali', department: 'CS', email: 'ali@air.edu.pk' },
            { id: 2, name: 'Sara', department: 'CS', email: 'sara@air.edu.pk' },
            { id: 3, name: 'Usman', department: 'SE', email: 'usman@air.edu.pk' },
            { id: 4, name: 'Hina', department: 'AI', email: 'hina@air.edu.pk' },
            { id: 5, name: 'Ahmed', department: 'SE', email: 'ahmed@air.edu.pk' },
            { id: 6, name: 'Zoya', department: 'AI', email: 'zoya@air.edu.pk' }
          ]
        });
      }

      if (url === '/courses') {
        return resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => [
            { code: 'CS301', title: 'Data Structures', creditHours: 3 },
            { code: 'CS302', title: 'Database Systems', creditHours: 3 },
            { code: 'CS401', title: 'Full Stack Web Dev', creditHours: 4 }
          ]
        });
      }

      if (url === '/results') {
        return resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => [
            { studentId: 1, marks: 82 },
            { studentId: 2, marks: 94 },
            { studentId: 3, marks: 44 }, // Failed (< 50)
            { studentId: 4, marks: 73 },
            { studentId: 5, marks: 64 },
            { studentId: 6, marks: 91 }
          ]
        });
      }

      if (url === '/slow-endpoint') {
        return resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ message: 'Slow data arrived successfully' })
        });
      }

      // Unrecognized URL default
      return resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: `Unknown endpoint ${url}` })
      });
    }, delay);
  });
}

// -------------------------------------------------------------
// 2. getJSON Implementation
// -------------------------------------------------------------

/**
 * Robust JSON fetcher adhering to strict requirements:
 * 1. calls fetchImplementation(url)
 * 2. checks response.ok
 * 3. throws an error for unsuccessful HTTP status codes
 * 4. parses and returns JSON
 * 5. correctly propagates network and JSON parsing failures
 * 
 * @param {string} url 
 * @param {Function} fetchImplementation 
 * @param {Object} options 
 * @returns {Promise<any>} Parsed JSON
 */
export async function getJSON(url, fetchImplementation = fakeFetch, options = {}) {
  // Step 1: Call fetchImplementation
  const response = await fetchImplementation(url, options);

  // Step 2 & 3: Check response.ok and throw error for non-2xx status codes
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const detail = errorBody?.error ? ` - ${errorBody.error}` : '';
    throw new Error(`HTTP Error ${response.status} (${response.statusText})${detail}`);
  }

  // Step 4 & 5: Parse and return JSON, propagating parsing failures
  return await response.json();
}

// -------------------------------------------------------------
// 3. Concurrent Dashboard Loading & Analytics Aggregation
// -------------------------------------------------------------

/**
 * Loads all dashboard endpoints concurrently and calculates summary metrics.
 * Uses Promise.all to avoid sequential blocking.
 */
export async function loadAcademicDashboard(fetchImpl = fakeFetch) {
  console.log('\n--- Concurrent Dashboard Loading (/users, /courses, /results) ---');
  const startTime = Date.now();

  // Crucial: Fire all 3 independent API calls concurrently!
  const [users, courses, results] = await Promise.all([
    getJSON('/users', fetchImpl),
    getJSON('/courses', fetchImpl),
    getJSON('/results', fetchImpl)
  ]);

  const elapsedTime = Date.now() - startTime;
  console.log(`All 3 endpoints loaded concurrently in ${elapsedTime}ms!`);

  // Aggregate Metrics:
  // 1. Total students
  const totalStudents = users.length;

  // 2. Total courses
  const totalCourses = courses.length;

  // 3. Overall average marks
  const totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
  const overallAverageMarks = results.length > 0 ? Number((totalMarks / results.length).toFixed(2)) : 0;

  // 4. Highest-performing student
  let highestResult = results[0];
  for (const r of results) {
    if (r.marks > highestResult.marks) {
      highestResult = r;
    }
  }
  const topStudentInfo = users.find(u => u.id === highestResult.studentId);
  const highestPerformingStudent = {
    id: topStudentInfo?.id,
    name: topStudentInfo?.name,
    department: topStudentInfo?.department,
    marks: highestResult.marks
  };

  // 5. Number of failed students (< 50 marks)
  const failedResults = results.filter(r => r.marks < 50);
  const numberOfFailedStudents = failedResults.length;

  // 6. Department-wise statistics
  const userMap = new Map(users.map(u => [u.id, u]));
  const departmentStats = {};

  results.forEach(r => {
    const student = userMap.get(r.studentId);
    if (!student) return;
    const dept = student.department;

    if (!departmentStats[dept]) {
      departmentStats[dept] = {
        studentCount: 0,
        totalMarks: 0,
        highestMarks: r.marks,
        lowestMarks: r.marks,
        passedCount: 0,
        failedCount: 0
      };
    }

    const deptObj = departmentStats[dept];
    deptObj.studentCount += 1;
    deptObj.totalMarks += r.marks;
    if (r.marks > deptObj.highestMarks) deptObj.highestMarks = r.marks;
    if (r.marks < deptObj.lowestMarks) deptObj.lowestMarks = r.marks;

    if (r.marks >= 50) {
      deptObj.passedCount += 1;
    } else {
      deptObj.failedCount += 1;
    }
  });

  // Calculate clean averages for each department
  const formattedDeptStats = {};
  for (const [dept, data] of Object.entries(departmentStats)) {
    formattedDeptStats[dept] = {
      students: data.studentCount,
      averageMarks: Number((data.totalMarks / data.studentCount).toFixed(2)),
      highestMarks: data.highestMarks,
      lowestMarks: data.lowestMarks,
      passed: data.passedCount,
      failed: data.failedCount
    };
  }

  const dashboardReport = {
    totalStudents,
    totalCourses,
    overallAverageMarks,
    highestPerformingStudent,
    numberOfFailedStudents,
    departmentStatistics: formattedDeptStats
  };

  console.log('\n--- Generated Academic Dashboard Report ---');
  console.log(JSON.stringify(dashboardReport, null, 2));

  return dashboardReport;
}

// -------------------------------------------------------------
// 4. Timeout Challenge Implementation
// -------------------------------------------------------------

/**
 * Fetches a URL with a strict timeout using AbortController, setTimeout, clearTimeout, and try/finally.
 * Ensures the timer is always cleared whether the request resolves or rejects.
 * 
 * @param {string} url 
 * @param {number} milliseconds 
 * @param {Function} fetchImpl 
 * @returns {Promise<any>}
 */
export async function fetchWithTimeout(url, milliseconds, fetchImpl = fakeFetch) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, milliseconds);

  try {
    return await getJSON(url, fetchImpl, { signal: controller.signal });
  } finally {
    // Guarantees timer cleanup whether request succeeds, errors, or aborts!
    clearTimeout(timeoutId);
  }
}

/**
 * Categorizes and explains any caught error according to requirements.
 * 
 * @param {Error} error 
 * @returns {string} Detailed failure categorization
 */
export function classifyError(error) {
  if (error.name === 'AbortError') {
    return `[TIMEOUT / ABORT] The operation timed out and was aborted by AbortController: "${error.message}"`;
  }
  if (error instanceof SyntaxError) {
    return `[INVALID JSON] Failed to parse response as JSON: "${error.message}"`;
  }
  if (error.message.startsWith('HTTP Error')) {
    return `[HTTP STATUS FAILURE] Unsuccessful HTTP response: "${error.message}"`;
  }
  return `[NETWORK FAILURE] Underlying network or DNS failure: "${error.message}"`;
}

// -------------------------------------------------------------
// Demonstration & Comprehensive Test Cases
// -------------------------------------------------------------
export async function runTask8() {
  console.log('='.repeat(70));
  console.log('Task 8 - Concurrent Academic API Aggregator with async/await');
  console.log('='.repeat(70));

  // 1. Concurrent Dashboard Loading & Aggregation
  await loadAcademicDashboard(fakeFetch);

  // 2. Timeout Challenge Tests & Error Distinctions
  console.log('\n--- Timeout Challenge & Error Distinction Verifications ---');

  // Test A: Successful fetch within timeout
  try {
    console.log('\n* Test A: Request completing well within timeout (500ms timeout):');
    const courses = await fetchWithTimeout('/courses', 500);
    console.log(`  Success! Loaded ${courses.length} courses.`);
  } catch (err) {
    console.error('  Unexpected failure:', classifyError(err));
  }

  // Test B: Timeout Exceeded (AbortController triggers)
  try {
    console.log('\n* Test B: Slow request exceeding timeout (50ms timeout on 200ms endpoint):');
    await fetchWithTimeout('/slow-endpoint', 50);
    console.log('  Unexpectedly succeeded.');
  } catch (err) {
    console.log(' ', classifyError(err));
  }

  // Test C: HTTP 404 Status Error
  try {
    console.log('\n* Test C: HTTP 404 Not Found:');
    await fetchWithTimeout('/not-found', 500);
  } catch (err) {
    console.log(' ', classifyError(err));
  }

  // Test D: HTTP 500 Internal Server Error
  try {
    console.log('\n* Test D: HTTP 500 Internal Server Error:');
    await fetchWithTimeout('/server-error', 500);
  } catch (err) {
    console.log(' ', classifyError(err));
  }

  // Test E: Underlying Network Failure
  try {
    console.log('\n* Test E: Network Failure:');
    await fetchWithTimeout('/network-failure', 500);
  } catch (err) {
    console.log(' ', classifyError(err));
  }

  // Test F: Invalid JSON Payload
  try {
    console.log('\n* Test F: Invalid Corrupted JSON:');
    await fetchWithTimeout('/invalid-json', 500);
  } catch (err) {
    console.log(' ', classifyError(err));
  }
}

// Auto-run when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask8();
}
