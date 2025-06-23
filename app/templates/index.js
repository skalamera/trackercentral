// Export all template configurations

// Assembly templates
const assemblyRollover = require('./assembly/assembly-rollover');
const assembly = require('./assembly/assembly');

// SEDCUST templates  
const sedcust = require('./sedcust/sedcust');

// SIM templates
const simAssignment = require('./sim/assignment');
const simAssessmentReports = require('./sim/assessment-reports');
const simAchievementLevels = require('./sim/achievement-levels');
const simFsa = require('./sim/fsa');
const simLibraryView = require('./sim/library-view');
const simOrr = require('./sim/orr');
const simPlanTeach = require('./sim/plan-teach');
const simReadingLog = require('./sim/reading-log');
const simDashboard = require('./sim/dashboard');

// Other templates
const featureRequest = require('./other/feature-request');
const dpt = require('./other/dpt');
const timeoutExtension = require('./other/timeout-extension');
const helpArticle = require('./other/help-article');

// Export all templates with their original keys
module.exports = {
    'assembly-rollover': assemblyRollover,
    'assembly': assembly,
    'sedcust': sedcust,
    'sim-assignment': simAssignment,
    'sim-assessment-reports': simAssessmentReports,
    'sim-achievement-levels': simAchievementLevels,
    'sim-fsa': simFsa,
    'sim-library-view': simLibraryView,
    'sim-orr': simOrr,
    'sim-plan-teach': simPlanTeach,
    'sim-reading-log': simReadingLog,
    'sim-dashboard': simDashboard,
    'feature-request': featureRequest,
    'dpt': dpt,
    'timeout-extension': timeoutExtension,
    'help-article': helpArticle
}; 