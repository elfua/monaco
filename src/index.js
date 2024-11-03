import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import './styles.css';
import { minify } from "terser";


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

    // Set the language picker to the last stored language
    const langId = editor.getModel().getLanguageId()
    if (languageSelector.value != langId) {
        languageSelector.value = langId;
    }

    // Update editor language
    languageSelector.addEventListener('change', (e) => {
        monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
        localStorage.setItem(STORAGE_LANGUAGE_KEY, editor.getModel().getLanguageId());
    });

    // THEME SELECTOR 
    const themeToggle = document.getElementById('theme-toggle');

    function updateTheme(isDarkMode) {
        const theme = isDarkMode ? 'vs-dark' : 'vs';
        monaco.editor.setTheme(theme);
        localStorage.setItem(STORAGE_THEME_KEY, theme);
    }

    const isDarkTheme = localStorage.getItem(STORAGE_THEME_KEY) === 'vs-dark';
    themeToggle.checked = isDarkTheme;
    updateTheme(isDarkTheme);

    themeToggle.addEventListener('change', (e) => {
        updateTheme(e.target.checked);
    });

    // DRAG-N-DROP files
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());

    document.body.addEventListener('drop', (event) => {
        event.preventDefault();

        if (event.dataTransfer.files.length) {
            const file = event.dataTransfer.files[0];
            const fileExtension = file.name.split('.').pop();
            const reader = new FileReader();

            reader.onload = function (e) {
                const content = e.target.result;
                editor.setValue(content);
                const inferredLangId = extToGrammarMap[fileExtension] || fileExtension.toLowerCase();
                monaco.editor.setModelLanguage(editor.getModel(), inferredLangId);
                document.getElementById('language-selector').value = inferredLangId;
                localStorage.setItem(STORAGE_LANGUAGE_KEY, inferredLangId);
            };

            reader.readAsText(file); 
        }
    });

    // SAVE STATE
    window.addEventListener('beforeunload', (event) => {
        if (editor) {
            localStorage.setItem(STORAGE_CONTENT_KEY, editor.getValue());
            editor.dispose();  // Dispose editor to free resources
            console.log("BEFOREUNLOAD");
            event.returnValue = null;
        }
    });

    const minifyToggle = document.getElementById('minify-toggle');

    minifyToggle.addEventListener('change', async (e) => {
        const editorContent = monaco.editor.getModels()[0].getValue();

        if (e.target.checked) {
            const minifiedCode = await minifyCode(editorContent);
            monaco.editor.getModels()[0].setValue(minifiedCode);
            e.target.checked = false;
        }
    });
}