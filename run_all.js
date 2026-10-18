/**
 * CampusFlow - Master Test Runner
 * Executes all 8 tasks in sequence with clean formatting and status reporting.
 */

import { runTask1 } from './task1_admission.js';
import { runTask2 } from './task2_academic_intelligence.js';
import { runTask3 } from './task3_profile_update.js';
import { runTask4 } from './task4_user_hierarchy.js';
import { runTask5 } from './task5/main.js';
import { runTask6 } from './task6_legacy_callbacks.js';
import { runTask7 } from './task7_promise_registration.js';
import { runTask8 } from './task8_concurrent_api.js';

async function main() {
  console.log('\n' + '#'.repeat(75));
  console.log('   AIR UNIVERSITY - CAMPUSFLOW ACADEMIC OPERATIONS SYSTEM');
  console.log('   Lab 5 Hands on Practice on Advanced JavaScript (CLO-1 GA-4)');
  console.log('#'.repeat(75) + '\n');

  try {
    // Task 1
    runTask1();
    console.log('\n');

    // Task 2
    runTask2();
    console.log('\n');

    // Task 3
    runTask3();
    console.log('\n');

    // Task 4
    runTask4();
    console.log('\n');

    // Task 5
    runTask5();
    console.log('\n');

    // Task 6 (Callback-based)
    await new Promise((resolve) => {
      runTask6(() => {
        resolve();
      });
    });
    console.log('\n');

    // Task 7 (Promise-based)
    await runTask7();
    console.log('\n');

    // Task 8 (async/await and Fetch)
    await runTask8();
    console.log('\n');

    console.log('#'.repeat(75));
    console.log('   ALL 8 LAB 5 TASKS COMPLETED SUCCESSFULLY WITH ZERO ERRORS');
    console.log('#'.repeat(75) + '\n');
  } catch (error) {
    console.error('Test Suite encountered an unexpected failure:', error);
  }
}

main();
