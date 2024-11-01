import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// import { createEditor } from './editor';
import './styles.css';
import { minify } from "terser";


// (function () {
//     // create div to avoid needing a HtmlWebpackPlugin template

// })();

document.addEventListener('DOMContentLoaded', init);

const extToGrammarMap = {
    "py": "python",
    "js": "javascript",
    "ts": "typescript",
    "sh": "shell",
    "md": "markdown",
    "yml": "yaml",
    "rs": "rust",
    "pl": "perl",
    "txt": "plaintext"
}

const STORAGE_CONTENT_KEY = 'monaco_editor_content';
const STORAGE_LANGUAGE_KEY = 'monaco_editor_language';
const STORAGE_THEME_KEY = 'monaco_editor_theme';

// function setSelectedOption(selectElement, value) {
//     const selectedOption = selectElement.querySelector(`option[value="${value}"]`);

//     if (selectedOption) {
//         selectElement.selectedIndex = Array.from(selectElement.options).indexOf(selectedOption);
//     }
// }

async function minifyCode(code) {
    try {
        const result = await minify(code);
        return result.code;
    } catch (error) {
        console.error('Minification failed:', error);
        return code; // Return original code if minification fails
    }
}



function init() {
    // const editorDiv = document.getElementById('editor');
    const editorDiv = document.createElement('div');
    editorDiv.id = 'root';
    document.body.appendChild(editorDiv);

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: true,
        schemaValidation: 'error',
        trailingCommas: 'error'
      });

    const editor = monaco.editor.create(editorDiv, {
        value: localStorage.getItem(STORAGE_CONTENT_KEY) || "console.log(42);\n\n\n\n\n\n",
        language: localStorage.getItem(STORAGE_LANGUAGE_KEY) || 'javascript',
        theme: localStorage.getItem(STORAGE_THEME_KEY) || 'vs',
        automaticLayout: true,
        minimap: { enabled: true },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        readOnly: false,
        contextmenu: true,
        roundedSelection: true,
        scrollbar: {
            useShadows: true,
            verticalHasArrows: true,
            horizontalHasArrows: true,
            // Accepted values: 'auto', 'visible', 'hidden'.
            vertical: "visible",
            // Accepted values: 'auto', 'visible', 'hidden'.
            // Defaults to 'auto'
            horizontal: "visible",
            verticalScrollbarSize: 19,
            horizontalScrollbarSize: 19,
            arrowSize: 25,
        }
    });

    // LANGUAGE SELECTOR
    const languageSelector = document.getElementById('language-selector');

    // Set the language picker to the last store language
    debugger;
    const langId = editor.getModel().getLanguageId()
    if (languageSelector.value != langId) {
        languageSelector.value = langId;
    }

    // Update editor language
    languageSelector.addEventListener('change', (e) => {
        monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
        localStorage.setItem(STORAGE_LANGUAGE_KEY, editor.getModel().getLanguageId());
    });

    /*
    const languages = monaco.languages.getLanguages();

    // Filter out unwanted languages and sort by language id (display label)
    const sortedLanguages = languages
        .filter(language => !/(cameligo|csharp|csp|cypher|ecl|elixir|flow9|fsharp|hcl|less|lexon|liquid|m3|mdx|msdax|pascaligo|pla|powerquer|powershell|proto|pug|qsharp|razor|sol|sparql|st|tcl|tqig|vg|freema|mips|spark|plaintext|abap|apex|postia|razor|verylog|azcli|bicep)/i.test(language.id))
        .sort((a, b) => a.id.localeCompare(b.id));

    // Populate the select element with sorted languages
    sortedLanguages.forEach(language => {
        const option = document.createElement('option');
        option.value = language.id;
        option.textContent = language.id;
        languageSelector.appendChild(option);

        // Set JavaScript as the default selected language
        if (language.id === 'javascript') {
            option.selected = true;
        }
    });
    */

    // THEME SELECTOR 
    const themeToggle = document.getElementById('theme-toggle');

    // Function to update the editor theme based on the checkbox state
    function updateTheme(isDarkMode) {
        const theme = isDarkMode ? 'vs-dark' : 'vs';
        monaco.editor.setTheme(theme);
        // Persist the theme in localStorage
        localStorage.setItem(STORAGE_THEME_KEY, theme);
    }

    const isDarkTheme = localStorage.getItem(STORAGE_THEME_KEY) === 'vs-dark';
    themeToggle.checked = isDarkTheme;
    updateTheme(isDarkTheme);

    // Add event listener to the checkbox to toggle themes
    themeToggle.addEventListener('change', (e) => {
        updateTheme(e.target.checked);
    });

    // DRAG-N-DROP files
    // handle drag and drop from finder
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());

    document.body.addEventListener('drop', (event) => {
        event.preventDefault();

        // Check if files are present
        if (event.dataTransfer.files.length) {
            const file = event.dataTransfer.files[0];
            const fileExtension = file.name.split('.').pop();
            const reader = new FileReader();

            // Load the file content into the editor
            reader.onload = function (e) {
                const content = e.target.result;
                editor.setValue(content);
                const inferredLangId = extToGrammarMap[fileExtension] || fileExtension.toLowerCase();
                monaco.editor.setModelLanguage(editor.getModel(), inferredLangId);
                document.getElementById('language-selector').value = inferredLangId;
                localStorage.setItem(STORAGE_LANGUAGE_KEY, inferredLangId);
            };

            reader.readAsText(file); // Adjust as needed, e.g., `readAsDataURL` for binary files
        }
    });

    // SAVE STATE
    window.addEventListener('beforeunload', (event) => {
        if (editor) {
            localStorage.setItem(STORAGE_CONTENT_KEY, editor.getValue());
            // localStorage.setItem(STORAGE_LANGUAGE_KEY, currentLanguage);
            editor.dispose();  // Dispose editor to free resources
            console.log("BEFOREUNLOAD");
            event.returnValue = null;
        }
    });

    const minifyToggle = document.getElementById('minify-toggle');

    // Event listener for the minify checkbox
    minifyToggle.addEventListener('change', async (e) => {
        const editorContent = monaco.editor.getModels()[0].getValue();

        if (e.target.checked) {
            // Minify the code when checkbox is checked
            const minifiedCode = await minifyCode(editorContent);
            monaco.editor.getModels()[0].setValue(minifiedCode);
            e.target.checked = false;
        }
    });
}