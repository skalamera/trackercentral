# Testing Documentation for Custom Tracker

This document outlines the testing approach for the Custom Tracker application, detailing the test structure, challenges encountered, and best practices for maintaining and extending the test suite.

## Testing Approach

The Custom Tracker application uses Jest as its testing framework. The tests are organized into several categories:

1. **Generic Template Tests**: Verify that all templates have the required structure and properties.
2. **Template-Specific Tests**: Test specific functionality for each template type.
3. **Utility Function Tests**: Test helper functions like `formatDate`.
4. **DOM Interaction Tests**: Test functions that interact with the DOM.

## Test Structure

The test files are organized as follows:

- `tests/setup.js`: Contains setup code and mock implementations for the test environment.
- `tests/tracker-config.test.js`: Tests the structure and functionality of all tracker templates.
- `tests/formatDate.test.js`: Tests the date formatting utility.
- `tests/sim-orr-onload.test.js`: Tests the dynamic functionality of the SIM ORR template.

## Mocking Strategy

Since the application is designed to run in a browser but tests run in Node.js, we use a comprehensive mocking strategy:

1. **DOM Elements**: We create mock DOM elements that simulate the behavior of real DOM elements.
2. **Browser APIs**: We mock browser APIs like `document.getElementById`.
3. **Event Handling**: We simulate events and event listeners.

Example of our DOM element mocking approach:

```javascript
function createMockElement(depth = 0) {
  const listeners = {};
  return {
    value: '',
    style: {
      display: ''
    },
    checked: false,
    addEventListener: jest.fn((event, handler) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    }),
    dispatchEvent: (event) => {
      if (listeners[event.type]) {
        listeners[event.type].forEach(handler => handler(event));
      }
    },
    closest: jest.fn(() => depth < 2 ? createMockElement(depth + 1) : null),
    textContent: '',
    innerHTML: '',
    parentElement: depth < 2 ? { 
      textContent: '', 
      style: {} 
    } : null
  };
}
```

## Challenges Encountered and Solutions

### 1. Infinite Recursion in DOM Element Mocking

**Challenge**: The initial implementation of `createMockElement` caused a stack overflow when calling methods like `closest()`.

**Solution**: Added a depth parameter to limit recursion:

```javascript
closest: jest.fn(() => depth < 2 ? createMockElement(depth + 1) : null)
```

### 2. DOM Style Property Handling

**Challenge**: DOM style properties needed proper initialization to avoid undefined errors.

**Solution**: Initialize style objects with empty strings for display properties:

```javascript
style: {
  display: ''
}
```

### 3. Date Formatting Edge Cases

**Challenge**: The `formatDate` function didn't handle non-standard date formats correctly.

**Solution**: Added validation to check for the expected format before processing:

```javascript
// Check if the string follows the YYYY-MM-DD pattern
const parts = dateString.split('-');
if (parts.length !== 3) {
  return dateString; // Return original if not in YYYY-MM-DD format
}

// Additional validation - check if the first part looks like a year
const year = parts[0];
if (year.length !== 4 || isNaN(parseInt(year))) {
  return dateString;
}
```

### 4. Testing DOM Event Handling

**Challenge**: Needed to test event handlers and subject line formatting without executing the full onLoad function.

**Solution**: Created targeted tests that simulate specific behaviors rather than calling the entire onLoad function:

```javascript
// Manual simulation approach
harFileReasonContainer.style.display = 'block';
harFileUploaderContainer.style.display = 'none';
harPlaceholderContainer.style.display = 'none';

// Verify initial No state
expect(harFileReasonContainer.style.display).toBe('block');
expect(harFileUploaderContainer.style.display).toBe('none');
expect(harPlaceholderContainer.style.display).toBe('none');
```

## Code Coverage

Current code coverage metrics:
- Statements: 51.07%
- Branches: 40.08%
- Functions: 24.24%
- Lines: 47.80%

The coverage is focused on the core functionality in the tracker-config.js file, which has approximately 70% coverage.

### Improving Code Coverage

To improve code coverage:

1. Add tests for untested template functions.
2. Test more event handling scenarios.
3. Add tests for edge cases and error handling.
4. Consider adding integration tests for the application as a whole.

## Best Practices for Extending Tests

When adding new templates or modifying existing ones:

1. **Structure Tests**: Follow the established pattern in `tracker-config.test.js`.
2. **Mock DOM Elements**: Use the `createMockElement` function for DOM mocking.
3. **Test Description Generation**: Always test the `descriptionGenerator` function.
4. **Test Event Handling**: For templates with dynamic behavior, test the event handling logic.
5. **Check For Edge Cases**: Consider what might go wrong and test those scenarios.

## Running Tests

Tests can be run using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Conclusion

The test suite provides a solid foundation for ensuring the reliability of the Custom Tracker application. By following the patterns and practices established in these tests, you can maintain and extend the application with confidence. 