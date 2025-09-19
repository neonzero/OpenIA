const assert = require('assert');

const rootSuite = {
  name: 'root',
  suites: [],
  tests: [],
  beforeEach: [],
  afterEach: [],
};

let currentSuite = rootSuite;

function createSuite(name) {
  return {
    name,
    suites: [],
    tests: [],
    beforeEach: [],
    afterEach: [],
  };
}

function describe(name, fn) {
  const parent = currentSuite;
  const suite = createSuite(name);
  parent.suites.push(suite);
  currentSuite = suite;
  fn();
  currentSuite = parent;
}

function it(name, fn) {
  currentSuite.tests.push({ name, fn });
}

function beforeEach(fn) {
  currentSuite.beforeEach.push(fn);
}

function afterEach(fn) {
  currentSuite.afterEach.push(fn);
}

function expect(actual) {
  return {
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected);
    },
    toBe(expected) {
      assert.strictEqual(actual, expected);
    },
    toBeTruthy() {
      assert.ok(actual);
    },
    toContainEqual(expected) {
      assert.ok(actual.some((item) => {
        try {
          assert.deepStrictEqual(item, expected);
          return true;
        } catch (err) {
          return false;
        }
      }), 'Expected array to contain provided value');
    },
    toBeGreaterThan(number) {
      assert.ok(actual > number, `${actual} is not greater than ${number}`);
    },
    toBeLessThan(number) {
      assert.ok(actual < number, `${actual} is not less than ${number}`);
    },
  };
}

async function runSuite(suite, ancestors = { beforeEach: [], afterEach: [] }, depth = 0) {
  const beforeEachHooks = [...ancestors.beforeEach, ...suite.beforeEach];
  const afterEachHooks = [...suite.afterEach, ...ancestors.afterEach];
  let failures = 0;

  for (const test of suite.tests) {
    for (const hook of beforeEachHooks) {
      await hook();
    }
    try {
      await test.fn();
      console.log(`${'  '.repeat(depth)}✓ ${test.name}`);
    } catch (err) {
      failures += 1;
      console.error(`${'  '.repeat(depth)}✗ ${test.name}`);
      console.error(`${'  '.repeat(depth + 1)}${err.message}`);
    }
    for (const hook of afterEachHooks) {
      await hook();
    }
  }

  for (const child of suite.suites) {
    console.log(`${'  '.repeat(depth)}${child.name}`);
    failures += await runSuite(child, { beforeEach: beforeEachHooks, afterEach: afterEachHooks }, depth + 1);
  }

  return failures;
}

async function run() {
  let failures = 0;
  for (const suite of rootSuite.suites) {
    console.log(suite.name);
    failures += await runSuite(suite, { beforeEach: [], afterEach: [] }, 1);
  }
  if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
  } else {
    console.log('\nAll tests passed');
  }
  return failures;
}

module.exports = {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  run,
};
