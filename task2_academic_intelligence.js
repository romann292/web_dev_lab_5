/**
 * Task 2 - Academic Performance Intelligence Engine
 * 
 * Case Study: CampusFlow Academic Operations System
 * 
 * Expected Methods Demonstrated:
 * - forEach()
 * - map()
 * - filter()
 * - find()
 * - findIndex()
 * - reduce()
 * - some()
 * - every()
 * - sort() (immutably via shallow copy)
 * - slice()
 */

import { fileURLToPath } from 'url';

/**
 * Returns grade, status, and gradePoints based on university grading policy.
 * @param {number} marks 
 * @returns {{ grade: string, gradePoints: number, status: string }}
 */
export function getGradeDetails(marks) {
  if (typeof marks !== 'number' || Number.isNaN(marks)) {
    throw new TypeError(`Invalid marks: expected number, got ${typeof marks}`);
  }

  if (marks >= 85 && marks <= 100) {
    return { grade: 'A', gradePoints: 4.00, status: 'PASSED' };
  } else if (marks >= 80 && marks < 85) {
    return { grade: 'A-', gradePoints: 3.67, status: 'PASSED' };
  } else if (marks >= 75 && marks < 80) {
    return { grade: 'B+', gradePoints: 3.33, status: 'PASSED' };
  } else if (marks >= 70 && marks < 75) {
    return { grade: 'B', gradePoints: 3.00, status: 'PASSED' };
  } else if (marks >= 65 && marks < 70) {
    return { grade: 'B-', gradePoints: 2.67, status: 'PASSED' };
  } else if (marks >= 60 && marks < 65) {
    return { grade: 'C+', gradePoints: 2.33, status: 'PASSED' };
  } else if (marks >= 50 && marks < 60) {
    return { grade: 'C', gradePoints: 2.00, status: 'PASSED' };
  } else {
    return { grade: 'F', gradePoints: 0.00, status: 'FAILED' };
  }
}

/**
 * Part A - Result Processing
 * Enriches students with grade, status, and gradePoints using map().
 * Guarantees immutability of the source array.
 */
export function processResults(results) {
  return results.map(student => {
    const { grade, gradePoints, status } = getGradeDetails(student.marks);
    return {
      ...student,
      grade,
      gradePoints,
      status
    };
  });
}

/**
 * Part B - Ranked Merit List
 * Sorts students by marks descending; if marks are equal, sort by name alphabetically.
 * Ensures the original results array remains unchanged by cloning before sorting.
 */
export function getRankedMeritList(results) {
  // Using spread operator [...results] to create a shallow copy since Array.prototype.sort() mutates in place!
  return [...results].sort((a, b) => {
    if (b.marks !== a.marks) {
      return b.marks - a.marks; // Descending by marks
    }
    return a.name.localeCompare(b.name); // Alphabetical ascending by name
  });
}

/**
 * Part C - Department Statistics
 * Uses reduce() to dynamically compute student count, average, highest marks, and passed count.
 * Works dynamically with any department code (including 'DS', 'Cyber', etc.).
 */
export function getDepartmentStatistics(results) {
  return results.reduce((acc, student) => {
    const dept = student.department;
    const isPassed = student.marks >= 50;

    if (!acc[dept]) {
      acc[dept] = {
        students: 0,
        totalMarks: 0,
        highest: student.marks,
        passed: 0
      };
    }

    acc[dept].students += 1;
    acc[dept].totalMarks += student.marks;
    if (student.marks > acc[dept].highest) {
      acc[dept].highest = student.marks;
    }
    if (isPassed) {
      acc[dept].passed += 1;
    }

    return acc;
  }, {});
}

/**
 * Formats department statistics, computing the clean average.
 */
export function formatDepartmentStatistics(rawStats) {
  const formatted = {};
  for (const dept of Object.keys(rawStats)) {
    const data = rawStats[dept];
    formatted[dept] = {
      students: data.students,
      average: Number((data.totalMarks / data.students).toFixed(2)),
      highest: data.highest,
      passed: data.passed
    };
  }
  return formatted;
}

/**
 * Part D - Academic Queries
 * Executes required array search, validation, and slicing operations.
 */
export function runAcademicQueries(results) {
  // 1. Overall average marks across all students (using reduce)
  const totalScore = results.reduce((sum, s) => sum + s.marks, 0);
  const overallAverage = results.length > 0 ? Number((totalScore / results.length).toFixed(2)) : 0;

  // 2. First student scoring more than 85 (find)
  const firstScoringAbove85 = results.find(s => s.marks > 85);

  // 3. Index of the first failed student (findIndex)
  const firstFailedIndex = results.findIndex(s => s.marks < 50);

  // 4. Whether at least one student failed (some)
  const hasAtLeastOneFailed = results.some(s => s.marks < 50);

  // 5. Whether every student has marks within the valid range [0, 100] (every)
  const allMarksValid = results.every(s => typeof s.marks === 'number' && s.marks >= 0 && s.marks <= 100);

  // 6. All students scoring above the overall average (filter)
  const studentsAboveAverage = results.filter(s => s.marks > overallAverage);

  // 7. Names of the top three students (sort immutably, slice, map)
  const topThreeNames = [...results]
    .sort((a, b) => b.marks - a.marks || a.name.localeCompare(b.name))
    .slice(0, 3)
    .map(s => s.name);

  return {
    overallAverage,
    firstScoringAbove85,
    firstFailedIndex,
    hasAtLeastOneFailed,
    allMarksValid,
    studentsAboveAverage,
    topThreeNames
  };
}

// -------------------------------------------------------------
// Demonstration & Comprehensive Test Cases
// -------------------------------------------------------------
export function runTask2() {
  console.log('='.repeat(70));
  console.log('Task 2 - Academic Performance Intelligence Engine');
  console.log('='.repeat(70));

  const results = [
    { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
    { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
    { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
    { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
    { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
    { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 }
  ];

  // Freeze original results to verify no method mutates it
  const frozenCopy = JSON.stringify(results);

  console.log('\n--- Part A: Result Processing ---');
  const enrichedResults = processResults(results);
  console.table(enrichedResults);

  console.log('\n--- Part B: Ranked Merit List (Original Unchanged) ---');
  const rankedList = getRankedMeritList(enrichedResults);
  console.table(rankedList);

  // Immutability Check
  const wasMutated = JSON.stringify(results) !== frozenCopy;
  console.log(`Original results array mutated: ${wasMutated} (Correct: false)`);

  console.log('\n--- Part C: Department Statistics (Dynamic Reduction) ---');
  const deptStats = formatDepartmentStatistics(getDepartmentStatistics(enrichedResults));
  console.log(JSON.stringify(deptStats, null, 2));

  // Test dynamic new department (e.g. "DS" and "Cyber")
  console.log('\n* Testing with dynamic new departments (e.g. "DS", "Cyber"):');
  const extendedResults = [
    ...results,
    { id: 7, name: 'Bilal', department: 'DS', course: 'FSWD', marks: 88 },
    { id: 8, name: 'Khadija', department: 'DS', course: 'FSWD', marks: 95 },
    { id: 9, name: 'Farhan', department: 'Cyber', course: 'FSWD', marks: 45 }
  ];
  const dynamicStats = formatDepartmentStatistics(getDepartmentStatistics(extendedResults));
  console.log(JSON.stringify(dynamicStats, null, 2));

  console.log('\n--- Part D: Academic Queries ---');
  const queries = runAcademicQueries(results);
  console.log(`1. Overall average score: ${queries.overallAverage}`);
  console.log(`2. First student scoring > 85:`, queries.firstScoringAbove85);
  console.log(`3. Index of first failed student: ${queries.firstFailedIndex} (${results[queries.firstFailedIndex]?.name})`);
  console.log(`4. Whether at least one student failed: ${queries.hasAtLeastOneFailed}`);
  console.log(`5. Whether every student has valid marks (0-100): ${queries.allMarksValid}`);
  console.log(`6. Students scoring above overall average (${queries.overallAverage}):`, queries.studentsAboveAverage.map(s => `${s.name} (${s.marks})`));
  console.log(`7. Names of the top three students:`, queries.topThreeNames);

  // Demonstration of forEach
  console.log('\n* Logging summary lines using forEach():');
  enrichedResults.forEach(s => {
    console.log(`   Student #${s.id} ${s.name.padEnd(8)} | Dept: ${s.department} | Marks: ${s.marks} | Grade: ${s.grade.padEnd(2)} | Status: ${s.status}`);
  });

  return { enrichedResults, rankedList, deptStats, queries };
}

// Auto-run when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask2();
}
