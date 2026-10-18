/**
 * Task 4 - University User Hierarchy and Dynamic this
 * 
 * Case Study: CampusFlow Academic Operations System
 * 
 * Concepts Demonstrated & Explained:
 * 1. constructor: Initializes instances created by `new`
 * 2. new: Instantiates a new object, links prototype, and binds `this`
 * 3. this: Dynamic contextual execution reference
 * 4. extends: Establishes prototype inheritance chain between classes
 * 5. super: Invokes parent constructor or calls parent prototype methods
 * 6. Method Overriding: Subclass replaces/specializes parent behavior
 * 7. Runtime Polymorphism: Dynamic method dispatch based on instance type
 * 8. instanceof: Inspects prototype chain membership
 * 9. call(): Invokes a function with an explicit `this` argument
 * 10. bind(): Creates an exotic bound function permanently tied to a given `this`
 * 11. Detached Methods: Behavior of member functions separated from their owner object
 * 
 * Note: No closures are used to retain state. State is encapsulated on `this`.
 */

import { fileURLToPath } from 'url';

/**
 * Base Class: Person
 */
export class Person {
  /**
   * @param {string} name 
   * @param {string} email 
   */
  constructor(name, email) {
    if (new.target === Person) {
      // Optional safety check: Person can be instantiated or used as base
    }
    this.name = name;
    this.email = email;
  }

  /**
   * Base introduction method
   * @returns {string}
   */
  introduce() {
    return `Hi, I am ${this.name} (${this.email}).`;
  }
}

/**
 * Subclass: Student extends Person
 */
export class Student extends Person {
  /**
   * @param {string} name 
   * @param {string} email 
   * @param {string|number} rollNo 
   * @param {number} marks 
   */
  constructor(name, email, rollNo, marks) {
    super(name, email); // Must invoke super() before accessing 'this'
    this.rollNo = rollNo;
    this.marks = marks;
  }

  /**
   * Overrides Person.prototype.introduce, reusing super.introduce()
   * @returns {string}
   */
  introduce() {
    const parentIntro = super.introduce();
    return `${parentIntro} I am a Student with Roll No: ${this.rollNo}.`;
  }

  /**
   * Returns student academic status
   * @returns {string}
   */
  getResult() {
    return this.marks >= 50
      ? `PASSED with ${this.marks} marks`
      : `FAILED with ${this.marks} marks`;
  }
}

/**
 * Subclass: FacultyMember extends Person
 */
export class FacultyMember extends Person {
  /**
   * @param {string} name 
   * @param {string} email 
   * @param {string} employeeId 
   * @param {string} department 
   */
  constructor(name, email, employeeId, department) {
    super(name, email); // Reuses Person initialization
    this.employeeId = employeeId;
    this.department = department;
  }

  /**
   * Overrides Person.prototype.introduce, reusing super.introduce()
   * @returns {string}
   */
  introduce() {
    const parentIntro = super.introduce();
    return `${parentIntro} I am a Faculty Member in the ${this.department} department (Employee ID: ${this.employeeId}).`;
  }
}

// -------------------------------------------------------------
// Demonstration & Comprehensive Test Cases
// -------------------------------------------------------------
export function runTask4() {
  console.log('='.repeat(70));
  console.log('Task 4 - University User Hierarchy and Dynamic this');
  console.log('='.repeat(70));

  // 1. Instantiation of Students and FacultyMembers
  const s1 = new Student('Fatima Noor', 'fatima@air.edu.pk', 'CS-2023-01', 88);
  const s2 = new Student('Zainab Bibi', 'zainab@air.edu.pk', 'SE-2023-45', 42);
  const f1 = new FacultyMember('Dr. Kamran', 'kamran@air.edu.pk', 'EMP-901', 'Computer Science');
  const f2 = new FacultyMember('Engr. Ayesha', 'ayesha@air.edu.pk', 'EMP-902', 'Software Engineering');

  // Heterogeneous array of users
  const users = [s1, f1, s2, f2];

  // 2. Demonstration of Runtime Polymorphism
  console.log('\n--- Polymorphic Introduction Dispatch ---');
  users.forEach(user => {
    console.log(user.introduce());
  });

  // 3. Inheritance & Instanceof Checks
  console.log('\n--- Instanceof Verification ---');
  console.log(`s1 instanceof Student:        ${s1 instanceof Student}`);
  console.log(`s1 instanceof Person:         ${s1 instanceof Person}`);
  console.log(`f1 instanceof FacultyMember:  ${f1 instanceof FacultyMember}`);
  console.log(`f1 instanceof Person:         ${f1 instanceof Person}`);
  console.log(`f1 instanceof Student:        ${f1 instanceof Student}`);

  console.log('\n--- Student getResult() Method ---');
  console.log(`${s1.name} (Roll ${s1.rollNo}): ${s1.getResult()}`);
  console.log(`${s2.name} (Roll ${s2.rollNo}): ${s2.getResult()}`);

  // 4. this, call(), and bind() Challenge
  console.log('\n--- this, call() and bind() Challenge ---');
  const guest = {
    name: 'Dr. Ahmed',
    email: 'ahmed@example.com'
  };

  // A. Use call() to execute Person introduction with guest acting as `this`
  // Both Person.prototype.introduce and s1.introduce.call(guest) can be tested.
  // Calling Person.prototype.introduce with guest:
  const guestIntro = Person.prototype.introduce.call(guest);
  console.log(`1. Person.prototype.introduce.call(guest):`);
  console.log(`   Output: "${guestIntro}"`);

  // B. Detach student method
  console.log(`\n2. Detached Student Method Investigation:`);
  const fn = s1.introduce;
  try {
    // Calling fn() without an explicit receiver:
    // In ES6 class methods (which execute in strict mode), `this` evaluates to undefined!
    fn();
    console.log('   fn() executed unexpectedly.');
  } catch (err) {
    console.log(`   Caught expected error when invoking detached fn():`);
    console.log(`   [${err.name}]: ${err.message}`);
    console.log(`   Explanation: In class syntax, methods automatically run in strict mode ('use strict').`);
    console.log(`   When a method is detached (assigned to a bare identifier) and invoked as fn(),`);
    console.log(`   there is no calling object to the left of the dot. Thus, 'this' defaults to undefined,`);
    console.log(`   and evaluating this.name throws a TypeError.`);
  }

  // C. Safely bound version using bind()
  console.log(`\n3. Safely Bound Version using bind():`);
  const boundFn = s1.introduce.bind(s1);
  const boundOutput = boundFn();
  console.log(`   boundFn() output: "${boundOutput}"`);
  console.log(`   Explanation: Function.prototype.bind() returns a new bound function wrapper that`);
  console.log(`   permanently anchors 'this' to the supplied instance (s1), ensuring correct resolution`);
  console.log(`   regardless of where or how the function is subsequently invoked.`);

  return { users, guestIntro, boundOutput };
}

// Auto-run when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask4();
}
