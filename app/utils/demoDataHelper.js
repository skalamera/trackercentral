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
            resource: "ORR: Reading History",
            resourceName: "Bookshelves",
            specificIssue: "Student's Status Not Updating",
            shortDescription: "Option to Select Whole Class to Share Bookshelves",
            shortDescriptionDetails: "Option to Select Whole Class to Share Bookshelves",
            path: "G3>U5>W1>L15",
            pathField: "Advance -c2022 > TRS: G3>U5>W1>L15",
            gradesImpacted: "Grade 3",
            dateReported: this.getTodayDate(),
            dateRequested: this.getTodayDate(),
            device: "Chromebook",
            studentInternalId: "12345678",
            BURCLink: "https://onboarding-production.benchmarkuniverse.com/85066/dashboard",
            customer_email: "jane.smith@fairfaxschools.org",
            assignmentId: "https://msemail.benchmarkuniverse.com/?#assignments/11569615",
            harFileReason: "Not applicable for this test scenario",

            // Rich text fields
            issueDescription: "<p>Students are unable to access the Unit 5 assessment in the TRS. When clicking on the assessment link, the page loads indefinitely without displaying content. This is affecting all students in Grade 3.</p>",
            issueDetails: "<p>A student's status will not update even though they have submitted the ORR. The reading history shows incomplete status despite the student completing the oral reading exercise.</p>",
            stepsToReproduce: "<p>1. Teacher dashboard<br>2. ORR<br>3. Click on student Jane Doe<br>4. Select Passage<br>5. Select \"No\" for microphone<br>6. Select \"next\" for passage, retell, comprehension, analysis, and summary<br>7. Submit ORR<br>8. Status remains incomplete</p>",
            expectedResults: "<p>After submitting the ORR, the student's status should update from incomplete to complete in the reading history.</p>",
            actualResults: "<p>The assessment page shows a loading spinner indefinitely and never displays the actual assessment content. Students cannot proceed with their work.</p>",
            additionalDetails: "<p>User reports \"It would be extremely helpful if we had the option to select a class to share a bookshelf with, rather than having to select student by student.\"<br><br>This would save significant time when setting up classroom resources and would allow teachers to quickly share collections with all students at once.</p>",
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
            team: "SIM (Colleen Baker)",

            // Assembly specific
            userType: "Digital Only",
            programImpacted: "Reading",

            // Additional fields
            helpArticleName: "How to Use Oral Reading Records",
            issue: "Session Timeout Extension Request",
            timeoutLength: "8 Hours",
            resourceXcode: "X14569",
            resourceTitle: "Unit 5 Assessment (Gr. 2)",
            summaryContent: "<p>Please see the BL Xcode removal request below.</p>",
            effectiveDate: this.getTodayDate(),
            assemblyCode: "X12345, X56789",

            // Handle duplicate field IDs by populating both
            districtNameDesc: "Fairfax County Public Schools",
            districtStateDesc: "VA",

            // Feature request specific field
            applicationDetails: "Advance -c2022 • 2.75 Virginia"
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
                return this.getRichTextDemo(fieldId);
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

    getRichTextDemo(fieldId) {
        // Field-specific rich text content
        const richTextDemos = {
            issueDetails: this.demoData.issueDetails,
            stepsToReproduce: this.demoData.stepsToReproduce,
            expectedResults: this.demoData.expectedResults,
            actualResults: this.demoData.actualResults,
            additionalDetails: this.demoData.additionalDetails,
            screenshotsDescription: this.demoData.screenshotsDescription,
            summary: this.demoData.summary,
            summaryContent: this.demoData.summaryContent,
            issueSummary: this.demoData.issueSummary,
            components: this.demoData.components,
            subscriptionCodes: this.demoData.subscriptionCodes,

            // Default content for fields not in demoData
            scenario: "<p>1. Teacher logs into the system<br>2. Navigates to assessments section<br>3. Attempts to create custom assessment<br>4. System displays error message</p>",
            featureDescription: "<p>Add ability to duplicate existing assessments with modifications. This would save significant time for teachers who need to create similar assessments for different classes.</p>",
            businessCase: "<p>Teachers spend 30+ minutes recreating similar assessments. This feature would reduce that to 5 minutes, improving teacher efficiency and satisfaction.</p>",
            default: "<p>This is sample content for testing purposes. Please replace with actual issue details.</p>"
        };

        return richTextDemos[fieldId] || richTextDemos.default;
    }

    /**
     * Fill all form fields with demo data
     */
    fillDemoData(template) {
        console.log("Filling demo data for template:", template);

        if (!template || !template.sections) {
            console.warn("Template has no sections to populate:", template);
            return;
        }

        console.log(`Starting demo data fill for template: ${template.title || 'Unknown'}`);

        // Small delay to ensure Quill editors are initialized
        setTimeout(() => this.doFillDemoData(template), 100);
    }

    doFillDemoData(template) {

        let fieldsPopulated = 0;

        template.sections.forEach(section => {
            if (section.fields) {
                section.fields.forEach(field => {
                    if (field.type === 'hidden') return; // Skip hidden fields

                    // Special handling for checkboxes
                    if (field.type === 'checkboxes') {
                        try {
                            this.populateCheckboxField(field);
                            fieldsPopulated++;
                        } catch (error) {
                            console.error(`Error populating checkbox field ${field.id}:`, error);
                        }
                        return;
                    }

                    // For richtext fields, the actual textarea might be hidden
                    let element = document.getElementById(field.id);
                    if (!element && field.type === 'richtext') {
                        // Try to find the textarea that might be hidden
                        element = document.querySelector(`textarea[id="${field.id}"]`);
                    }

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

        // Force update of Quill editors one more time after all fields are populated
        setTimeout(() => {
            if (window.trackerApp && window.trackerApp.quillEditors) {
                Object.entries(window.trackerApp.quillEditors).forEach(([fieldId, quill]) => {
                    // Ensure the textarea value is synced with Quill content
                    const textarea = document.getElementById(fieldId);
                    if (textarea && textarea.value) {
                        quill.emitter.emit('text-change');
                    }
                });
            }
        }, 200);
    }

    populateCheckboxField(field) {
        if (field.id === 'userRole') {
            const teachersCheckbox = document.querySelector('input[type="checkbox"][id="teachers"]');
            if (teachersCheckbox) {
                teachersCheckbox.checked = true;
                teachersCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✓ Checked Teachers checkbox for userRole');

                // Trigger subject line update for SIM templates
                if (window.trackerApp && window.trackerApp.updateSimAssignmentSubject) {
                    setTimeout(() => window.trackerApp.updateSimAssignmentSubject(), 50);
                }
            } else {
                console.warn('Teachers checkbox not found for userRole');
            }
        } else if (field.options && field.options.length > 0) {
            // For other checkbox groups, check the first option
            const firstOption = field.options[0];
            const checkbox = document.querySelector(`input[type="checkbox"][id="${firstOption.id}"]`) ||
                document.querySelector(`input[name="${field.id}"][value="${firstOption.id}"]`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`✓ Checked checkbox for field: ${field.id}`);
            }
        }
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



            case 'richtext':
                console.log(`Processing richtext field: ${field.id}`);

                // First try to get Quill from trackerApp
                if (window.trackerApp && window.trackerApp.quillEditors) {
                    console.log('Available Quill editors:', Object.keys(window.trackerApp.quillEditors));

                    if (window.trackerApp.quillEditors[field.id]) {
                        const quill = window.trackerApp.quillEditors[field.id];
                        const demoContent = this.getDemoValue(field.id, field.type);

                        console.log(`Found Quill editor for ${field.id}, setting content:`, demoContent.substring(0, 50) + '...');

                        // Set content in Quill editor
                        quill.root.innerHTML = demoContent;

                        // Also update the hidden textarea that stores the value
                        element.value = demoContent;

                        // Trigger Quill's text-change event to update the textarea
                        quill.emitter.emit('text-change');

                        console.log(`✓ Populated Quill editor for field: ${field.id}`);
                    } else {
                        console.log(`Quill editor not found in trackerApp for field: ${field.id}`);
                        // Try alternative methods...
                        const editorElement = document.getElementById(`${field.id}Editor`);
                        if (editorElement) {
                            const qlEditor = editorElement.querySelector('.ql-editor');
                            if (qlEditor) {
                                const demoContent = this.getDemoValue(field.id, field.type);
                                qlEditor.innerHTML = demoContent;

                                // Update the hidden textarea
                                element.value = demoContent;
                                element.dispatchEvent(new Event('input', { bubbles: true }));

                                console.log(`✓ Populated Quill editor via DOM for field: ${field.id}`);
                            } else {
                                console.warn(`Could not find Quill editor DOM for field: ${field.id}`);
                                // Fallback to textarea
                                element.value = this.getDemoValue(field.id, field.type);
                                element.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        } else {
                            console.warn(`No editor element found with ID: ${field.id}Editor`);
                            // Fallback to textarea
                            element.value = this.getDemoValue(field.id, field.type);
                            element.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                } else {
                    console.warn('window.trackerApp or quillEditors not available');
                    // Fallback to textarea
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

            // Also trigger subject line update through TemplateBase instances
            if (window.TemplateBase) {
                // Find any active template base instances and update their subject lines
                document.querySelectorAll('[id$="formattedSubject"]').forEach(subjectField => {
                    // Trigger change events on key fields to update subject line
                    ['districtName', 'districtState', 'application', 'specificIssue'].forEach(fieldId => {
                        const field = document.getElementById(fieldId);
                        if (field) {
                            field.dispatchEvent(new Event('input', { bubbles: true }));
                            field.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    });
                });
            }
        }, 100);
    }

    /**
     * Create and add demo data button to template
     */
    async addDemoDataButton(containerId = 'templateContainer') {
        console.log('[DemoDataHelper] Adding demo data button...');

        // Check if the current user is authorized to see the demo button
        try {
            // Get the client from window.trackerApp or app.initialized
            let client;
            if (window.trackerApp && window.trackerApp.client) {
                client = window.trackerApp.client;
            } else if (typeof app !== 'undefined' && app.initialized) {
                client = await app.initialized();
            } else {
                console.log('[DemoDataHelper] No client available, cannot check user authorization');
                return null;
            }

            // Get logged in user data
            const userData = await client.data.get("loggedInUser");
            console.log('[DemoDataHelper] Current user data:', userData);

            // Check if user is Steve Skalamera (by name or ID)
            const authorizedUserId = 67036373043;
            const authorizedUserName = "Steve Skalamera";

            if (!userData || !userData.loggedInUser) {
                console.log('[DemoDataHelper] No user data available');
                return null;
            }

            const currentUser = userData.loggedInUser;
            const isAuthorized = currentUser.id === authorizedUserId ||
                currentUser.name === authorizedUserName;

            if (!isAuthorized) {
                console.log('[DemoDataHelper] User not authorized to see demo button');
                return null;
            }

            console.log('[DemoDataHelper] User authorized, creating demo button');
        } catch (error) {
            console.error('[DemoDataHelper] Error checking user authorization:', error);
            return null;
        }

        // Check if button already exists
        if (document.getElementById('demoDataButton')) {
            console.log('[DemoDataHelper] Demo button already exists');
            return document.getElementById('demoDataButton');
        }

        const button = document.createElement('button');
        button.id = 'demoDataButton';
        button.className = 'btn btn-secondary btn-sm';
        button.innerHTML = '<i class="fa fa-flask"></i> Fill Demo Data';
        button.title = 'Fill all fields with demo data for testing';
        button.style.cssText = `
            position: fixed;
            top: 70px;
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

        // Ensure DOM is ready before appending
        if (document.body) {
            document.body.appendChild(button);
            console.log('[DemoDataHelper] Demo button added to page');
        } else {
            // If body not ready, wait for DOM
            console.log('[DemoDataHelper] Waiting for DOM to be ready...');
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(button);
                console.log('[DemoDataHelper] Demo button added to page after DOM ready');
            });
        }

        return button;
    }
}

// Export for use in templates
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemoDataHelper;
} else {
    window.DemoDataHelper = DemoDataHelper;
}