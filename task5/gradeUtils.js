/**
 * Task 5 - Modular Transcript Processing and Fault-Tolerant JSON
 * File: gradeUtils.js
 * 
 * Requirement: Provide named exports for calculateGrade(), calculateAverage(), and calculateGPA().
 */

/**
 * Calculates letter grade and grade points for a numeric mark.
 * Throws RangeError if marks are outside the valid 0-100 range.
 * 
 * @param {number} marks 
 * @returns {{ grade: string, points: number }}
 */
export function calculateGrade(marks) {
  if (typeof marks !== 'number' || Number.isNaN(marks)) {
    throw new TypeError(`Course mark must be a valid number, got: ${marks}`);
  }
  if (marks < 0 || marks > 100) {
    throw new RangeError(`Course marks must be between 0 and 100, received: ${marks}`);
  }

  if (marks >= 85) return { grade: 'A', points: 4.00 };
  if (marks >= 80) return { grade: 'A-', points: 3.67 };
  if (marks >= 75) return { grade: 'B+', points: 3.33 };
  if (marks >= 70) return { grade: 'B', points: 3.00 };
  if (marks >= 65) return { grade: 'B-', points: 2.67 };
  if (marks >= 60) return { grade: 'C+', points: 2.33 };
  if (marks >= 50) return { grade: 'C', points: 2.00 };
  return { grade: 'F', points: 0.00 };
}

/**
 * Computes the arithmetic average of marks across all enrolled courses.
 * @param {Array<{marks: number}>} courses 
 * @returns {number} Average marks rounded to 2 decimal places
 */
export function calculateAverage(courses) {
  if (!Array.isArray(courses)) {
    throw new TypeError('Courses must be an array');
  }
  if (courses.length === 0) {
    return 0.00;
  }

  const total = courses.reduce((sum, course) => {
    if (typeof course.marks !== 'number' || Number.isNaN(course.marks)) {
      throw new TypeError(`Invalid course mark in course ${course.code}`);
    }
    return sum + course.marks;
  }, 0);

  return Number((total / courses.length).toFixed(2));
}

/**
 * Computes the Cumulative Grade Point Average (GPA) across all enrolled courses.
 * @param {Array<{marks: number}>} courses 
 * @returns {number} GPA rounded to 2 decimal places
 */
export function calculateGPA(courses) {
  if (!Array.isArray(courses)) {
    throw new TypeError('Courses must be an array');
  }
  if (courses.length === 0) {
    return 0.00;
  }

  const totalPoints = courses.reduce((sum, course) => {
    const { points } = calculateGrade(course.marks);
    return sum + points;
  }, 0);

  return Number((totalPoints / courses.length).toFixed(2));
}
