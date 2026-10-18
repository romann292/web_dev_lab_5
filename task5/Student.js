/**
 * Task 5 - Modular Transcript Processing and Fault-Tolerant JSON
 * File: Student.js
 * 
 * Requirement: Export the Student class as the DEFAULT export.
 */

export default class Student {
  /**
   * @param {number|string} id 
   * @param {string} name 
   * @param {Array<{code: string, marks: number}>} courses 
   * @param {number} average 
   * @param {number} gpa 
   */
  constructor(id, name, courses = [], average = 0, gpa = 0) {
    this.id = id;
    this.name = name;
    this.courses = courses;
    this.average = average;
    this.gpa = gpa;
  }

  /**
   * Generates a concise summary string of the student transcript.
   * @returns {string}
   */
  getTranscriptSummary() {
    return `Student [${this.id}] ${this.name} | Courses: ${this.courses.length} | Avg: ${this.average}% | GPA: ${this.gpa}`;
  }
}
