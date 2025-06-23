// Template loader for browser environment
// This script loads all template configurations and makes them available globally

// Initialize the global templates object
window.TRACKER_CONFIGS_FROM_TEMPLATES = {
    // Assembly templates
    'assembly-rollover': {
        title: "Assembly Rollover Tracker",
        icon: "fa-tools",
        description: "For requests regarding removing legacy assembly codes from a district",
        // Template configuration will be loaded dynamically
    },
    'assembly': {
        title: "Assembly Tracker",
        icon: "fa-puzzle-piece",
        description: "For issues regarding component assembly",
        // Template configuration will be loaded dynamically
    },
    // SEDCUST templates
    'sedcust': {
        title: "Content/Editorial Tracker",
        icon: "fa-book",
        description: "For issues regarding content errors, broken links, and other editorial concerns",
        // Template configuration will be loaded dynamically
    },
    // SIM templates
    'sim-assignment': {
        title: "SIM Assignment Tracker",
        icon: "fa-tasks",
        description: "For issues regarding assignment and/or eAssessment functionality",
        // Template configuration will be loaded dynamically
    },
    'sim-assessment-reports': {
        title: "SIM Assessment Reports Tracker",
        icon: "fa-chart-bar",
        description: "For issues regarding assessment reports",
        // Template configuration will be loaded dynamically
    },
    'sim-achievement-levels': {
        title: "SIM Achievement Levels Tracker",
        icon: "fa-trophy",
        description: "For custom achievement levels configuration",
        // Template configuration will be loaded dynamically
    },
    'sim-fsa': {
        title: "SIM FSA Tracker",
        icon: "fa-clipboard-check",
        description: "For issues regarding Foundational Skills Assessment (FSA)",
        // Template configuration will be loaded dynamically
    },
    'sim-library-view': {
        title: "SIM Library View Tracker",
        icon: "fa-book-open",
        description: "For issues regarding library view functionality",
        // Template configuration will be loaded dynamically
    },
    'sim-orr': {
        title: "SIM ORR Tracker",
        icon: "fa-microphone",
        description: "For issues regarding Oral Reading Records (ORR)",
        // Template configuration will be loaded dynamically
    },
    'sim-plan-teach': {
        title: "SIM Plan & Teach Tracker",
        icon: "fa-chalkboard-teacher",
        description: "For issues regarding Plan & Teach functionality",
        // Template configuration will be loaded dynamically
    },
    'sim-reading-log': {
        title: "SIM Reading Log Tracker",
        icon: "fa-book-reader",
        description: "For issues regarding Reading Log functionality",
        // Template configuration will be loaded dynamically
    },
    'sim-dashboard': {
        title: "SIM Dashboard Tracker",
        icon: "fa-tachometer-alt",
        description: "For issues regarding dashboard functionality",
        // Template configuration will be loaded dynamically
    },
    // Other templates
    'feature-request': {
        title: "Feature Request Tracker",
        icon: "fa-lightbulb",
        description: "For requests regarding new functionality within Benchmark Universe",
        // Template configuration will be loaded dynamically
    },
    'dpt': {
        title: "DPT (Customized eAssessment) Tracker",
        icon: "fa-edit",
        description: "For DPT customized eAssessment issues",
        // Template configuration will be loaded dynamically
    },
    'timeout-extension': {
        title: "Timeout Extension Tracker",
        icon: "fa-clock",
        description: "For timeout extension requests",
        // Template configuration will be loaded dynamically
    },
    'help-article': {
        title: "Help Article Tracker",
        icon: "fa-question-circle",
        description: "For help article creation requests",
        // Template configuration will be loaded dynamically
    }
};

// Note: In production, the actual template configurations will be loaded
// by including the individual template files or through a build process 