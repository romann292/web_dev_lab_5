# CampusFlow - Academic Operations System
## Lab 5: Hands on Practice on Advanced JavaScript (CLO-1 GA-4)

CampusFlow is an academic operations system implemented in Node.js, delivering core business logic, data sanitization, academic analytics, object-oriented user hierarchies, fault-tolerant JSON processing, and asynchronous workflows using Callbacks, Promises, and `async/await`.

---

## General Requirements Compliance

| # | General Requirement | Implementation Detail in CampusFlow |
|---|---------------------|--------------------------------------|
| 1 | **No external packages, DOM, HTML, Express, databases** | Built exclusively with vanilla modern Node.js built-ins (`Set`, `Map`, `AbortController`, `setTimeout`, etc.). |
| 2 | **No closures for state retention** | State is preserved in plain data structures or object instances via `this`, never through inner function state capture. |
| 3 | **Appropriate use of `const` and `let`** | `const` is used by default for all references; `let` is used strictly for reassignable counters and loop accumulators. No `var`. |
| 4 | **No mutation of source data** | Array methods that mutate (e.g., `.sort()`) operate strictly on shallow copies (`[...results].sort()`). Objects are updated via copy-on-write (`{ ...obj }`). |
| 5 | **No hard-coded calculated answers** | Merit calculations, GPAs, averages, ranks, and aggregations are computed dynamically. |
| 6 | **Meaningful return values** | Every function returns processed data records or report summaries instead of only printing. |
| 7 | **Strict equality (`===` / `!==`)** | Enforced across all type conversions, status checks, and data comparisons. |
| 8 | **Handle invalid and unexpected data** | Guard clauses, range checks, regex/string sanitization, and descriptive errors (`TypeError`, `RangeError`, `SyntaxError`). |
| 9 | **Organized into ES Modules** | All files use `import` / `export` syntax with `"type": "module"` in `package.json`. |
| 10 | **Demonstrated against normal, boundary, and invalid cases** | Each task includes automated test suites covering happy paths, edge cases, and invalid inputs. |

---

## Project Structure

```
lab 5/
├── package.json                   # Project metadata and npm scripts ("type": "module")
├── run_all.js                     # Master runner executing all 8 tasks sequentially
├── task1_admission.js             # Task 1: Admission Decision & Data Sanitization Engine
├── task2_academic_intelligence.js # Task 2: Academic Performance Intelligence Engine
├── task3_profile_update.js        # Task 3: Safe Student Profile Update Service
├── task4_user_hierarchy.js        # Task 4: University User Hierarchy & Dynamic this
├── task5/                         # Task 5: Modular Transcript Processing & JSON
│   ├── Student.js                 # Default export Student class
│   ├── gradeUtils.js              # Named exports (calculateGrade, calculateAverage, calculateGPA)
│   ├── transcriptService.js       # Fault-tolerant JSON parser & reporter
│   └── main.js                    # Entry point demonstrating imports and try/catch/finally
├── main.js                        # Root entry point re-exporting task 5
├── Student.js                     # Root alias for task 5 Student class
├── gradeUtils.js                  # Root alias for task 5 grade utilities
├── transcriptService.js           # Root alias for task 5 transcript service
├── task6_legacy_callbacks.js      # Task 6: Legacy Course Registration via Callbacks
├── task7_promise_registration.js  # Task 7: Promise-Based Multi-Service Registration Engine
├── task8_concurrent_api.js        # Task 8: Concurrent Academic API Aggregator with async/await
└── README.md                      # Comprehensive lab report and documentation
```

---

## Detailed Task Breakdown

### Task 1 - Admission Decision and Data Sanitization Engine
- **File**: [`task1_admission.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task1_admission.js)
- **Key Concepts**: Explicit type conversion (`Number()`, `Boolean()`), guard clauses, non-mutating transformations.
- **Rules & Logic**:
  - Validates applicant age ($17 \le \text{age} \le 30$).
  - Validates marks ($0 \le \text{marks} \le 100$).
  - Allowed programs: `BSCS`, `BSSE`, `BSAI`, `BSIT`, `BSDS`.
  - Merit Formula: $\text{Merit} = (\text{Matric} \times 0.20) + (\text{Inter} \times 0.30) + (\text{Entry Test} \times 0.50)$.
  - Minimum Eligibility: $\text{Merit} \ge 70$, $\text{Entry Test} \ge 60$, and $\text{Intermediate} \ge 60$.
  - **Status Distinction**:
    - `SELECTED`: Meets eligibility criteria, fee is confirmed paid (`feePaid === true`), and merit $\ge 75$ (Direct Merit Allocation).
    - `WAITING`: Meets eligibility criteria, but either fee is pending (`feePaid === false`) OR merit is between $70.00$ and $74.99$ (Waiting List Quota).
    - `REJECTED`: Application is valid, but fails minimum eligibility.
    - `INVALID DATA`: Missing or corrupt fields, out-of-range marks/age, or unsupported program.
- **Additional Challenge**: Produces an analytics summary containing valid/invalid counts, highest/lowest merit applicants, cohort average merit, and per-program counts.

---

### Task 2 - Academic Performance Intelligence Engine
- **File**: [`task2_academic_intelligence.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task2_academic_intelligence.js)
- **Key Concepts**: Array higher-order methods (`forEach`, `map`, `filter`, `find`, `findIndex`, `reduce`, `some`, `every`, `sort`, `slice`), source array immutability.
- **Features**:
  - **Part A (Result Processing)**: Enriches raw marks with grades ($A, A-, B+, B, B-, C+, C, F$), grade points ($0.00 - 4.00$), and status (`PASSED`/`FAILED`).
  - **Part B (Ranked Merit List)**: Produces a new array sorted by marks descending, breaking ties by student name alphabetically. Original array is protected via `[...results].sort()`.
  - **Part C (Department Statistics)**: Uses `.reduce()` to dynamically aggregate student count, average marks, highest marks, and pass rate for any department (including dynamically added departments like `"DS"` or `"Cyber"`).
  - **Part D (Academic Queries)**: Solves all required queries using declarative array methods (`find`, `findIndex`, `some`, `every`, `filter`, `slice`).

---

### Task 3 - Safe Student Profile Update Service
- **File**: [`task3_profile_update.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task3_profile_update.js)
- **Key Concepts**: Object and array destructuring, nested destructuring, destructuring rename, default values, rest parameters (`...updates`), object rest (`...other`), spread operator, optional chaining (`?.`), nullish coalescing (`??`), and property shorthand.
- **Preservation of Falsy Values**: Uses `??` (Nullish Coalescing) to ensure legitimate falsy values such as `0`, `false`, and `""` are not inadvertently overridden by default fallbacks.
- **Reference Challenge**:
  - `original === updated` $\rightarrow$ `false`: Instantiating an object literal produces a new reference in heap memory.
  - `original.address === updated.address` $\rightarrow$ `false`: Address was shallow-copied with overrides (`{ ...original.address, city: 'Rawalpindi' }`), generating a distinct nested object reference.
  - `original.contact === updated.contact` $\rightarrow$ `false`: Contact was newly created to incorporate `phone` without mutating the original.

---

### Task 4 - University User Hierarchy and Dynamic `this`
- **File**: [`task4_user_hierarchy.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task4_user_hierarchy.js)
- **Key Concepts**: `constructor`, `new`, `this`, `extends`, `super`, method overriding, runtime polymorphism, `instanceof`, `call()`, `bind()`, and detached methods.
- **Class Structure**:
  - `Person(name, email)` $\rightarrow$ `introduce()`
  - `Student extends Person` $\rightarrow$ adds `rollNo`, `marks`, overrides `introduce()` via `super.introduce()`, adds `getResult()`
  - `FacultyMember extends Person` $\rightarrow$ adds `employeeId`, `department`, overrides `introduce()` via `super.introduce()`
- **Dynamic `this` Challenge**:
  - `Person.prototype.introduce.call(guest)`: Explicitly binds `guest` as `this` during invocation.
  - `const fn = student.introduce`: When invoked bare (`fn()`), ES6 class strict mode enforces `this === undefined`, causing a `TypeError: Cannot read properties of undefined (reading 'name')`.
  - `const boundFn = student.introduce.bind(student)`: Returns an exotic bound function permanently tied to `student`.

---

### Task 5 - Modular Transcript Processing and Fault-Tolerant JSON
- **Files**:
  - [`task5/Student.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task5/Student.js): Default export `Student` class.
  - [`task5/gradeUtils.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task5/gradeUtils.js): Named exports `calculateGrade`, `calculateAverage`, `calculateGPA`.
  - [`task5/transcriptService.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task5/transcriptService.js): Fault-tolerant JSON parser & reporter.
  - [`task5/main.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task5/main.js): Demonstrates named + default imports, import aliasing (`calculateGPA as computeGPA`), and `try` / `catch` / `finally`.
- **Validation**:
  - Rejects malformed JSON $\rightarrow$ `SyntaxError`
  - Rejects missing student ID $\rightarrow$ `Error`
  - Rejects duplicate student IDs $\rightarrow$ `Error`
  - Rejects course marks $< 0$ or $> 100$ $\rightarrow$ `RangeError`
  - Rejects missing course codes $\rightarrow$ `TypeError`
  - Produces both JavaScript object report and serialized JSON string.

---

### Task 6 - Legacy Course Registration Service Using Callbacks
- **File**: [`task6_legacy_callbacks.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task6_legacy_callbacks.js)
- **Workflow**: `Load Student` $\rightarrow$ `Check Prerequisites` $\rightarrow$ `Check Available Seats` $\rightarrow$ `Register Course`.
- **Rules**: Strictly callback-based (`callback(err, data)`), no Promises, no async/await. Early return on any stage failure.
- **Architectural Analysis (Why Callbacks become difficult to maintain)**:
  1. **Pyramid of Doom**: Sequential operations indent code deeply to the right, impairing readability.
  2. **Error Duplication**: Every nested stage requires manual error checking and forwarding (`if (err) return cb(err);`).
  3. **Inversion of Control**: Trust is placed entirely on external functions to call the callback exactly once.
  4. **Breakage of Control Flow**: Traditional `try`/`catch`, loops, and early returns cannot cross asynchronous callback boundaries.

---

### Task 7 - Promise-Based Multi-Service Registration Engine (12 Marks)
- **File**: [`task7_promise_registration.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task7_promise_registration.js)
- **Features**:
  - **Part A (Registration Chain)**: `getStudent` $\rightarrow$ `getCourse` $\rightarrow$ `checkPrerequisites` $\rightarrow$ `checkSeats` $\rightarrow$ `registerStudent`.
    - Every `.then()` explicitly returns the next Promise/context to ensure data propagation. Includes `.catch()` and `.finally()`.
  - **Part B (Post-Registration Services)**:
    - Independent services (`sendEmail`, `sendSMS`, `writeAuditLog`) execute concurrently using `Promise.allSettled()`.
    - Generates a status report even when one service (e.g. SMS) rejects.
  - **Part C (Service Selection & Justification)**:
    - Retrieving course data from two independent servers.
    - **Why `Promise.any()` is used instead of `Promise.race()`**:
      - `Promise.race()` settles on whichever promise finishes first, even if it is a rejection (e.g. Server 1 fails in 20ms with 502, aborting the whole request).
      - `Promise.any()` ignores early rejections and waits for the first *successful* (fulfilled) response (Server 2 responding in 60ms). It only rejects if all servers fail (`AggregateError`), making it the correct choice for high availability.

---

### Task 8 - Concurrent Academic API Aggregator with async/await (12 Marks)
- **File**: [`task8_concurrent_api.js`](file:///c:/Users/GM%20Computer/Desktop/5%20semester/WEB%20DEV/lab%205/task8_concurrent_api.js)
- **Features**:
  - `getJSON(url, fetchImplementation)`: Calls fetch, checks `response.ok`, throws on HTTP status errors, parses JSON, and propagates network/JSON failures.
  - `fakeFetch()`: Simulates 200 OK, 404 Not Found, 500 Server Error, Network Error, Corrupted JSON, Slow responses, and `AbortSignal`.
  - **Concurrent Dashboard Loading**: Uses `Promise.all([getJSON('/users'), getJSON('/courses'), getJSON('/results')])` so independent network calls run concurrently without blocking each other.
  - Aggregates total students, total courses, cohort average, highest student, failed students count, and department breakdown.
  - **Timeout Challenge**:
    - Implemented `fetchWithTimeout(url, milliseconds, fetchImpl)` using `AbortController`, `setTimeout`, and `clearTimeout` wrapped in `try` / `finally`.
    - Guarantees the timer is always cleared in `finally`.
    - Accurately classifies and distinguishes between **Timeout / Abort**, **HTTP Status Errors**, **Invalid JSON Syntax**, and **Network Failures**.

---

## How to Run

You can run individual tasks or the complete test suite directly from the command line:

### 1. Run All Tasks in Sequence
```bash
node run_all.js
# Or via npm
npm start
```

### 2. Run Specific Tasks
```bash
# Task 1: Admission Decision Engine
node task1_admission.js

# Task 2: Academic Performance Engine
node task2_academic_intelligence.js

# Task 3: Profile Update Service
node task3_profile_update.js

# Task 4: User Hierarchy & Dynamic this
node task4_user_hierarchy.js

# Task 5: Modular Transcript System
node main.js
# or: node task5/main.js

# Task 6: Legacy Callbacks
node task6_legacy_callbacks.js

# Task 7: Promise-Based Engine
node task7_promise_registration.js

# Task 8: Concurrent async/await & Timeout Challenge
node task8_concurrent_api.js
```
