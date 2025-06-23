/**
 * Demo Data Helper Utility
 * Provides demo data generation and form population functionality for templates
 */

class DemoDataHelper {
    constructor() {
        this.demoData = {
            // Basic text fields
            districtName: "Fairfax County Public Schools",
            districtState: "VA",
            application: "Advance -c2022",
            username: "jsmith123",
            userEmail: "jane.smith@fairfaxschools.org",
            name: "Jane Smith",
            userRole: "Teacher",
            role: "Teacher",
            realm: "msemail",
            schoolName: "Thomas Jefferson Elementary",
            xcode: "X98765",
            resource: "TRS",
            resourceName: "TRS",
            specificIssue: "Unit 5 Assessment Not Loading",
            shortDescription: "Unable to Access Digital Resources",
            shortDescriptionDetails: "Unable to Access Digital Resources",
            path: "G3>U5>W1>L15",
            pathField: "Advance -c2022 > TRS: G3>U5>W1>L15",
            gradesImpacted: "Grade 3",
            dateReported: this.getTodayDate(),
            dateRequested: this.getTodayDate(),
            device: "Chromebook",
            studentInternalId: "12345678",
            BURCLink: "https://onboarding-production.benchmarkuniverse.com/85066/dashboard",
            customer_email: "jane.smith@fairfaxschools.org",
            
            // Rich text fields
            issueDescription: "<p>Students are unable to access the Unit 5 assessment in the TRS. When clicking on the assessment link, the page loads indefinitely without displaying content. This is affecting all students in Grade 3.</p>",
            stepsToReproduce: "<p>1. Log into student account<br>2. Navigate to TRS<br>3. Click on Grade 3<br>4. Select Unit 5<br>5. Click on Week 1 Assessment<br>6. Page fails to load</p>",
            expectedResults: "<p>The Unit 5 assessment should load properly and display all questions for students to complete within the expected timeframe.</p>",
            actualResults: "<p>The assessment page shows a loading spinner indefinitely and never displays the actual assessment content. Students cannot proceed with their work.</p>",
            additionalDetails: "<p>This issue started occurring on Monday morning and affects approximately 150 students across 6 different classes. Teachers have tried refreshing browsers and using different devices with the same result.</p>",
            screenshotsDescription: "<p>Screenshots of the loading error have been attached showing the stuck loading state.</p>",
            summary: "<p>Students cannot access Grade 3 Unit 5 assessment in TRS - page loads indefinitely affecting 150+ students across multiple classes.</p>",
            summaryContent: "<p>Fairfax County Public Schools is requesting custom achievement levels.</p>",
            issueSummary: "<p>In Advance -c2022 TRS: G3 > U5 > W1 > Assessment, the assessment fails to load properly for students.</p>",
            issueDetails: "<p>Multiple teachers have reported that their Grade 3 students cannot access the Unit 5 Week 1 assessment. The issue appears to be system-wide affecting all classes using this specific assessment.</p>",
            components: "<p>TRS (Teacher Resource System) - eAssessment component</p>",
            subscriptionCodes: "<p>BEC Benchmark Advance 2022 (National Edition) Gr. 3 Classroom Digital<br>BEC Benchmark Advance 2022 (Virginia Edition) Gr. 3 Student Digital</p>",
            
            // Select field options
            isVIP: "No",
            version: "2.75",
            versionState: "Virginia",
            harFileAttached: "Yes",
            hasMultipleXcodes: "No",
            impactScope: "Both Teacher and Student",
            impactType: "Digital Only",
            team: "SIM (Colleen Baker)"
        };
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Get demo data for a specific field
     */
    getDemoValue(fieldId, fieldType, options = []) {
        if (this.demoData[fieldId]) {
            return this.demoData[fieldId];
        }

        // Generate data based on type if no specific demo data exists
        switch (fieldType) {
            case 'text':
                return this.generateTextDemo(fieldId);
            case 'email':
                return "demo.user@testschool.edu";
            case 'date':
                return this.getTodayDate();
            case 'select':
                return this.getSelectDemo(options);
            case 'richtext':
                return "<p>Demo content for testing purposes - this field contains sample data to help with form validation and testing.</p>";
            default:
                return "";
        }
    }

    generateTextDemo(fieldId) {
        const demos = {
            default: "Demo Text Value",
            districtName: "Sample School District",
            schoolName: "Demo Elementary School", 
            username: "demo.user",
            name: "Demo User",
            xcode: "X12345",
            path: "G1>U1>W1>L1",
            specificIssue: "Sample Issue Description"
        };
        return demos[fieldId] || demos.default;
    }

    getSelectDemo(options) {
        if (options && options.length > 1) {
            // Skip empty first option and loading options
            const validOptions = options.filter(opt => 
                opt && opt !== "" && opt !== "-- Loading from settings --"
            );
            if (validOptions.length > 0) {
                return validOptions[0];
            }
        }
        return "";
    }

    /**
     * Fill all form fields with demo data
     */
    fillDemoData(template) {
        console.log("Filling demo data for template:", template.title);
        
        if (!template.sections) {
            console.warn("Template has no sections to populate");
            return;
        }

        let fieldsPopulated = 0;

        template.sections.forEach(section => {
            if (section.fields) {
                section.fields.forEach(field => {
                    if (field.type === 'hidden') return; // Skip hidden fields
                    
                    const element = document.getElementById(field.id);
                    if (!element) {
                        console.warn(`Field element not found: ${field.id}`);
                        return;
                    }

                    // Skip read-only fields
                    if (field.readOnly || element.readOnly) {
                        console.log(`Skipping read-only field: ${field.id}`);
                        return;
                    }

                    try {
                        this.populateField(field, element);
                        fieldsPopulated++;
                    } catch (error) {
                        console.error(`Error populating field ${field.id}:`, error);
                    }
                });
            }
        });

        console.log(`Demo data population complete. ${fieldsPopulated} fields populated.`);

        // Trigger any field change events to update dependent fields
        this.triggerFieldUpdates();
    }

    populateField(field, element) {
        switch (field.type) {
            case 'text':
            case 'email':
                element.value = this.getDemoValue(field.id, field.type);
                element.dispatchEvent(new Event('input', { bubbles: true }));
                break;

            case 'date':
                element.value = this.getDemoValue(field.id, field.type);
                element.dispatchEvent(new Event('change', { bubbles: true }));
                break;

            case 'select':
                const selectValue = this.getDemoValue(field.id, field.type, field.options);
                if (selectValue && Array.from(element.options).some(opt => opt.value === selectValue)) {
                    element.value = selectValue;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                } else if (element.options.length > 1) {
                    // Select first non-empty option
                    for (let option of element.options) {
                        if (option.value && option.value !== "" && option.value !== "-- Loading from settings --") {
                            element.value = option.value;
                            element.dispatchEvent(new Event('change', { bubbles: true }));
                            break;
                        }
                    }
                }
                break;

            case 'checkboxes':
                if (field.options && field.options.length > 0) {
                    // Check the first checkbox option
                    const firstCheckbox = document.querySelector(`input[name="${field.id}"][value="${field.options[0].id}"]`);
                    if (firstCheckbox) {
                        firstCheckbox.checked = true;
                        firstCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
                break;

            case 'richtext':
                // Handle Quill editor
                const quillContainer = element.closest('.ql-container');
                if (quillContainer && window.Quill) {
                    const quill = quillContainer.__quill || window.quillInstances?.[field.id];
                    if (quill) {
                        const demoContent = this.getDemoValue(field.id, field.type);
                        quill.root.innerHTML = demoContent;
                        quill.history.clear();
                    }
                } else {
                    // Fallback for regular textarea
                    element.value = this.getDemoValue(field.id, field.type);
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }
                break;

            default:
                console.warn(`Unknown field type: ${field.type} for field ${field.id}`);
        }
    }

    triggerFieldUpdates() {
        // Trigger updates after a small delay to ensure all fields are populated
        setTimeout(() => {
            // Trigger common update events
            const updateEvents = ['input', 'change'];
            const commonFields = ['districtName', 'districtState', 'application', 'version', 'versionState'];
            
            commonFields.forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element) {
                    updateEvents.forEach(eventType => {
                        element.dispatchEvent(new Event(eventType, { bubbles: true }));
                    });
                }
            });

            // Update subject line if template has this functionality
            if (window.templateBase && typeof window.templateBase.updateSubjectLine === 'function') {
                window.templateBase.updateSubjectLine();
            }
        }, 100);
    }

    /**
     * Create and add demo data button to template
     */
    addDemoDataButton(containerId = 'templateContainer') {
        const container = document.getElementById(containerId) || document.body;
        
        // Check if button already exists
        if (document.getElementById('demoDataButton')) {
            return;
        }

        const button = document.createElement('button');
        button.id = 'demoDataButton';
        button.className = 'btn btn-secondary btn-sm';
        button.innerHTML = '<i class="fa fa-flask"></i> Fill Demo Data';
        button.title = 'Fill all fields with demo data for testing';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background-color: #6c757d;
            border-color: #6c757d;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#5a6268';
            button.style.borderColor = '#545b62';
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#6c757d';
            button.style.borderColor = '#6c757d';
        });

        container.appendChild(button);
        return button;
    }
}

// Export for use in templates
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemoDataHelper;
} else {
    window.DemoDataHelper = DemoDataHelper;
}