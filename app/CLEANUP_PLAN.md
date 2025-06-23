# Custom Tracker Codebase Cleanup Plan

## 📊 Project Overview
- **Application**: Freshdesk Custom App "Tracker Central"
- **Main Issue**: Monolithic tracker-config.js file (8,576 lines) with extensive code duplication
- **Goal**: Clean up duplicate, redundant, unnecessary code while maintaining all functionality

## ✅ Phase 1: Initial Cleanup (COMPLETED)

### 1.1 Git Status Cleanup ✓
- Removed untracked demo files from git
- Deleted 4 debug-related files:
  - `app/debugDistrictSubmission-fixed.js`
  - `tests/debugDistrictSubmission-fixed.test.js`
  - `tests/debugDistrictSubmission-exports.test.js`
  - `tests/debugDistrict.test.js`

### 1.2 Extract Common Utilities ✓
Created 4 utility modules:
- `app/utils/formatDate.js` - Date formatting utility
- `app/utils/fieldPopulators.js` - Auto-populate form fields
- `app/utils/versionFieldHandlers.js` - Custom version input handlers
- `app/utils/quillHelpers.js` - Quill editor enhancements

**Results**:
- Reduced tracker-config.js from 8,556 to 7,147 lines (16.5% reduction)
- Test pass rate: 292/325 (89.8%)

## 🚀 Phase 2: Template Base System (IN PROGRESS)

### ✅ Completed in Phase 2:
1. **Created TemplateBase class** (`app/utils/templateBase.js`)
   - Common subject line formatting logic for all template types
   - Handles SIM, SEDCUST, Assembly, and Assembly Rollover formats
   - Event listener management
   - Field validation utilities
   - Custom version input handling

2. **Created SubjectLineFormatter** (`app/utils/subjectLineFormatter.js`)
   - Template-specific formatting helpers
   - VIP status handling for different template styles
   - Subject line validation
   - Customization hooks for special cases

3. **Refactored updateSubjectLine functions** (4 templates completed)
   - **Assembly Rollover**: Replaced 59 lines with 8 lines (43 lines saved)
   - **Assembly**: Replaced 117 lines with 9 lines (108 lines saved)  
   - **Feature Request**: Replaced 114 lines with 45 lines (69 lines saved - includes custom formatting)
   - **SEDCUST**: Replaced 135 lines with 9 lines (126 lines saved)
   - **Total reduction**: 327 lines saved (from 7,147 to 6,820 lines)
   - All functionality preserved

### Goal
Eliminate 16+ duplicate `updateSubjectLine()` functions

### Implementation Steps

#### 2.1 Create Base Class Module
**File**: `app/utils/templateBase.js`
```javascript
class TemplateBase {
  constructor(config) {
    this.config = config;
    this.fields = {};
  }
  
  // Common subject line formatting logic
  formatSubjectLine() { }
  
  // Shared event listener setup
  setupEventListeners() { }
  
  // Field validation utilities
  validateFields() { }
}
```

#### 2.2 Create Subject Line Formatter
**File**: `app/utils/subjectLineFormatter.js`
- Centralized formatting rules
- Template-specific customization hooks
- VIP/Standard logic handling

#### 2.3 Refactor Each Template
- Replace inline `updateSubjectLine` functions
- Use configuration objects for template-specific rules

**Expected Impact**: ~1,500-2,000 lines reduction

### Progress Update:
- First refactoring complete: **43 lines saved** from just one function
- At this rate, refactoring all 16+ updateSubjectLine functions could save **~700+ lines**
- Additional savings expected from removing duplicate event listener setups

## 📁 Phase 3: Split Configuration by Template Type

### Goal
Break down monolithic tracker-config.js into logical modules

### New Structure
```
app/templates/
├── sim/
│   ├── orr.js
│   ├── assignment.js
│   ├── assessment-reports.js
│   ├── fsa.js
│   ├── library-view.js
│   ├── plan-teach.js
│   ├── reading-log.js
│   └── dashboard.js
│   └── custom-achievement-levels.js
├── assembly/
│   ├── assembly.js
│   └── assembly-rollover.js
├── other/
│   ├── feature-request.js
│   ├── help-article.js
│   └── timeout-extension.js
│   └── dpt.js
└── index.js (exports all templates)
```

**Expected Impact**: ~500 lines per file instead of 7,147

## 🔧 Phase 4: Consolidate Event Handling

### Goal
Remove duplicate event listener setups

### Actions
1. Create `app/utils/eventManager.js`
2. Centralize form validation
3. Unify field change handlers

**Expected Impact**: ~300-500 lines reduction

## 🧹 Phase 5: Clean Up Redundant Functions

### Goal
Remove unused or duplicate helper functions

### Targets
- Multiple date formatting implementations
- Duplicate field validation functions
- Redundant DOM manipulation helpers

**Expected Impact**: ~200-300 lines reduction

## 📊 Expected Final Results
- **Total Line Reduction**: ~3,500-4,000 lines (45-50%)
- **File Count**: From 1 monolithic file to ~20 focused modules
- **Maintainability**: Each template isolated and testable
- **Performance**: Faster load times with modular imports

## 🔄 Implementation Strategy

### Order of Implementation
1. **Phase 2** - Template Base System (biggest impact)
2. **Phase 3** - File Organization (logical structure)
3. **Phases 4-5** - Can be done in parallel

### Risk Mitigation
- ✓ Test after each phase
- ✓ Keep backups of working state
- ✓ Document behavioral changes
- ✓ Maintain backward compatibility

## 📝 Progress Tracking

### Completed Items
- [x] Remove debug files
- [x] Extract date formatting utility
- [x] Extract field populators
- [x] Extract version handlers
- [x] Extract Quill helpers
- [x] Update HTML files to load utilities
- [x] Fix test setup

### Pending Items
- [x] Create template base class ✓
- [x] Create subject line formatter ✓
- [x] Refactor first updateSubjectLine function (proof of concept) ✓
- [ ] Refactor remaining 15+ updateSubjectLine functions
- [ ] Split tracker-config.js by template
- [ ] Create event manager
- [ ] Remove redundant functions
- [ ] Update all tests
- [ ] Performance testing
- [ ] Documentation update

## 🐛 Known Issues from Linter

### High Priority (Complexity > 20)
- `updateSimAssignmentSubject`: complexity 40
- `updateSIMAssessmentReportsSubject`: complexity 49
- `updateSubjectLine` (multiple): complexity 27-40
- `populateSummaryDefault`: complexity 25-28

### Medium Priority
- Multiple functions with complexity 8-20
- Need to be addressed during refactoring

## 📈 Metrics

### Before Cleanup
- **tracker-config.js**: 8,556 lines
- **Duplicate functions**: 16+ updateSubjectLine
- **Test coverage**: Unknown
- **Complexity warnings**: 70+

### After Phase 1
- **tracker-config.js**: 7,147 lines
- **Test pass rate**: 89.8%
- **Files created**: 4 utility modules

### Target After All Phases
- **tracker-config.js**: Split into ~15 files
- **Average file size**: ~500 lines
- **Test pass rate**: >95%
- **Complexity warnings**: <10

## 🔗 Related Files
- Main config: `app/tracker-config.js`
- Dynamic tracker: `app/dynamic-tracker.js`
- Test setup: `tests/setup.js`
- Utilities: `app/utils/`

---
*Last Updated: [6/23/2025]*
*Status: Phase 1 Complete, Phase 2 in Progress* 