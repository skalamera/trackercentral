/**
 * Quill Editor Helper Utilities
 * Functions for enhancing Quill rich text editors with additional functionality
 */

/**
 * Setup clear formatting button for Quill editors
 */
function setupClearFormattingButton() {
    // Check if Quill is available
    if (typeof Quill === 'undefined') {
        console.warn("Quill not found for setting up clear formatting button");
        // Retry after a delay in case Quill is still loading
        setTimeout(setupClearFormattingButton, 1000);
        return;
    }

    // Add custom format button to Quill toolbar if possible
    addFormatButtonToQuillDefaults();

    // First check for toolbars directly - this is more reliable
    const toolbars = document.querySelectorAll('.ql-toolbar');
    if (toolbars.length > 0) {
        console.log(`Found ${toolbars.length} Quill toolbars`);

        toolbars.forEach((toolbar, index) => {
            // Skip if toolbar already has a clean button
            if (toolbar.querySelector('.ql-clean')) return;

            // Create clean formatting button
            const cleanButton = document.createElement('button');
            cleanButton.className = 'ql-clean';
            cleanButton.type = 'button';
            cleanButton.innerHTML = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"></line><line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"></line><line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"></line><line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"></line><rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"></rect></svg>';
            cleanButton.title = 'Clear formatting';

            // Add button to toolbar
            toolbar.appendChild(cleanButton);

            // Find the associated editor container and editor
            const editorContainer = toolbar.closest('.quill-editor-container, .quill-editor, .richtext-container');
            let editor = null;

            if (editorContainer) {
                editor = editorContainer.querySelector('.ql-editor');
            } else {
                // Look for an editor that follows this toolbar
                const parentContainer = toolbar.parentElement;
                if (parentContainer) {
                    editor = parentContainer.querySelector('.ql-editor');
                }
            }

            // Add click handler
            cleanButton.addEventListener('click', () => {
                // Try to find the Quill instance
                let quill = null;

                try {
                    // Method 1: Look for Quill instance in the editor's parent
                    if (editor) {
                        const editorParent = editor.parentElement;
                        if (editorParent && editorParent.__quill) {
                            quill = editorParent.__quill;
                        }
                    }

                    // Method 2: Use Quill.find if available
                    if (!quill && editor && Quill.find) {
                        quill = Quill.find(editor);
                    }

                    // Method 3: Check for Quill instance in container
                    if (!quill && editorContainer && editorContainer.__quill) {
                        quill = editorContainer.__quill;
                    }

                    if (!quill) {
                        console.log("Could not find Quill instance for toolbar");
                        return;
                    }

                    // Get current selection
                    const range = quill.getSelection();
                    if (range && range.length > 0) {
                        // Remove all formatting from the selected text
                        quill.removeFormat(range.index, range.length);
                    } else if (range) {
                        // If cursor is just placed, use the current word
                        const text = quill.getText();
                        const currentPos = range.index;

                        // Find word boundaries
                        let startPos = currentPos;
                        while (startPos > 0 && !/\s/.test(text[startPos - 1])) {
                            startPos--;
                        }

                        let endPos = currentPos;
                        while (endPos < text.length && !/\s/.test(text[endPos])) {
                            endPos++;
                        }

                        if (endPos > startPos) {
                            quill.removeFormat(startPos, endPos - startPos);
                        }
                    } else {
                        console.log('Select text to clear formatting');
                    }
                } catch (error) {
                    console.error("Error while applying clear formatting:", error);
                }
            });

            console.log(`Added clear formatting button to toolbar ${index + 1}`);
        });
    }
}

/**
 * Add format button to Quill defaults
 */
function addFormatButtonToQuillDefaults() {
    try {
        // Try to add the clean button to default Quill configuration
        if (typeof Quill !== 'undefined' && Quill.import) {
            // Import Toolbar module
            const Toolbar = Quill.import('modules/toolbar');
            if (!Toolbar) return;

            // Get default modules
            const defaultModules = Quill.imports && Quill.imports.modules;
            if (!defaultModules) return;

            // Add to all toolbar instances on page
            const toolbars = document.querySelectorAll('.ql-toolbar');
            toolbars.forEach(toolbar => {
                // Skip if it already has a clean button
                if (toolbar.querySelector('.ql-clean')) return;

                // Create clean formatting button
                const cleanButton = document.createElement('button');
                cleanButton.className = 'ql-clean';
                cleanButton.type = 'button';
                cleanButton.innerHTML = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"></line><line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"></line><line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"></line><line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"></line><rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"></rect></svg>';
                cleanButton.title = 'Clear formatting';

                // Add button to toolbar
                toolbar.appendChild(cleanButton);

                // Try to associate with a Quill instance
                const editorContainer = toolbar.closest('.quill-editor');
                const editor = editorContainer ? editorContainer.querySelector('.ql-editor') : null;

                // Add click handler
                cleanButton.addEventListener('click', () => {
                    // Try different methods to find the Quill instance
                    let quill = null;

                    // Method 1: Use cached instance if available
                    if (editorContainer && editorContainer.__quill) {
                        quill = editorContainer.__quill;
                    }
                    // Method 2: Find via Quill.find
                    else if (editor && Quill.find) {
                        quill = Quill.find(editor);
                    }

                    if (quill) {
                        const range = quill.getSelection();
                        if (range && range.length > 0) {
                            quill.removeFormat(range.index, range.length);
                        } else if (range) {
                            // If cursor is just placed, use the current word
                            const text = quill.getText();
                            const currentPos = range.index;

                            // Find word boundaries
                            let startPos = currentPos;
                            while (startPos > 0 && !/\s/.test(text[startPos - 1])) {
                                startPos--;
                            }

                            let endPos = currentPos;
                            while (endPos < text.length && !/\s/.test(text[endPos])) {
                                endPos++;
                            }

                            if (endPos > startPos) {
                                quill.removeFormat(startPos, endPos - startPos);
                            }
                        }
                    }
                });
            });

            console.log("Added clear formatting to Quill defaults");
        }
    } catch (error) {
        console.error("Error adding format button to Quill defaults:", error);
    }
}

// Set up clear formatting button when editors are loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        // Initial setup
        setTimeout(setupClearFormattingButton, 1000);

        // Try again after a delay to catch any editors loaded later
        setTimeout(setupClearFormattingButton, 2500);

        // Add mutation observer to watch for dynamically added editors
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    // Check if any added nodes contain Quill editors or toolbars
                    let hasEditor = false;
                    let hasToolbar = false;

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check for editor elements
                            if (node.classList &&
                                (node.classList.contains('ql-editor') ||
                                    node.classList.contains('quill-editor') ||
                                    node.querySelector('.ql-editor'))) {
                                hasEditor = true;
                            }

                            // Check for toolbar elements
                            if (node.classList &&
                                (node.classList.contains('ql-toolbar') ||
                                    node.querySelector('.ql-toolbar'))) {
                                hasToolbar = true;
                            }
                        }
                    });

                    if (hasEditor || hasToolbar) {
                        console.log("Detected new Quill editor or toolbar, updating formatting buttons");
                        setTimeout(setupClearFormattingButton, 100);
                    }
                }
            });
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });

        // Listen for events that might indicate a new editor has been created
        document.addEventListener('quill-editor-created', function () {
            console.log("Quill editor created event detected");
            setTimeout(setupClearFormattingButton, 100);
        });

        // Also check when tab visibility changes (user might have switched back to the tab)
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') {
                setTimeout(setupClearFormattingButton, 500);
            }
        });
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupClearFormattingButton,
        addFormatButtonToQuillDefaults
    };
} 