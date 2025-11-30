/*!
 * Data grid for status page at https://localize.typo3.org/
 */
/*!
 * AG Grid community v34.3.1 by AG Grid Ltd. - https://www.ag-grid.com
 * License - https://www.ag-grid.com/eula/AG-Grid-Community-License.html (MIT License)
 */

// Config - source
const sourceCrowdin = 'https://crowdin.com/project/';
const sourceTYPO3ExtensionRepository = 'https://extensions.typo3.org/extension/';
const sourceJsonData = 'status.json';

let gridApi;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch data
        const jsonData = await fetchJsonData(sourceJsonData);

        // Define grid
        const columnDefsLanguages = [];
        if (jsonData.languages) {
            for (const [key, value] of Object.entries(jsonData.languages)) {
                columnDefsLanguages.push({
                    cellRenderer: renderCellCrowdinProjectLanguage,
                    colId: key,
                    filter: false,
                    headerClass: 't3-header-cell-language',
                    headerName: value,
                    headerTooltip: key,
                    sortable: true,
                    sortingOrder: ['desc', 'asc', null],
                    tooltipValueGetter: renderTooltipProjectLanguageState,
                    unSortIcon: true,
                    valueGetter: `(typeof data.translations['${key}'] === "number") ? data.translations['${key}'] : -1`,
                    t3LanguageKey: key,
                });
            }
        }

        const columnDefs = [
            {
                headerName: 'Extension',
                cellRenderer: renderCellExtension,
                field: 'extensionKey',
                filter: true,
                lockPinned: true,
                pinned: 'left',
                sortable: true,
                width: 260,
            },
            ...columnDefsLanguages
        ];

        const defaultColDef = {
            filter: false,
            flex: 1,
            initialWidth: 90,
            minWidth: 90,
            sortable: false,
        };

        const gridOptions = {
            columnDefs: columnDefs,
            defaultColDef: defaultColDef,
            headerHeight: 110,
            tooltipShowDelay: 500,
            tooltipHideDelay: 5000,
        };

        const gridDiv = document.querySelector('#ag-grid');

        // Create grid
        gridApi = agGrid.createGrid(gridDiv, gridOptions);
        gridApi.setGridOption('rowData', jsonData.projects);

        // Init custom events
        initActions();
    } catch (error) {
        console.error('Error during grid setup:', error);
    }
});

// Functions

// Fetch json from given source
async function fetchJsonData(sourceJson) {
    try {
        const response = await fetch(sourceJson);
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
        throw error; // Re-throw error to be handled in DOMContentLoaded
    }
}



/**
 * test some features with preferred languages (pin, hide, show)
 */
let buttonLanguageHide = document.getElementById('buttonLanguageHide');
let buttonLanguagePin = document.getElementById('buttonLanguagePin');
let preferredLanguages = navigator.languages;
let hiddenStatesDefault = [
    {colId: 'extensionKey', hide: false},
    {colId: 'usable', hide: false}
];
let pinnedStatesDefault = [
    {colId: 'extensionKey', pinned: 'left'},
    {colId: 'usable', pinned: 'left'}
];
function initActions() {
    // Hide
    buttonLanguageHide.onclick = function() {
        hideLanguage();
    };
    buttonLanguageHide.textContent = buttonLanguageHide.dataset.labelHide;
    // Pin
    buttonLanguagePin.onclick = function() {
        pinLanguage();
    };
    buttonLanguagePin.textContent = buttonLanguagePin.dataset.labelPin;
}
function hideLanguage() {
    const hiddenStates = hiddenStatesDefault;
    if (preferredLanguages.length !== 0) {
        for (let i = 0; i < preferredLanguages.length; i++) {
            const colId = preferredLanguages[i];
            hiddenStates.push({colId: colId.toString(), hide: false});
        }
    }
    gridApi.applyColumnState({
        defaultState: {hide: true},
        state: hiddenStates,
    });
    buttonLanguageHide.onclick = function() {
        hideLanguageReset();
    };
    buttonLanguageHide.textContent = buttonLanguageHide.dataset.labelUnhide;
    buttonLanguageHide.classList.remove('btn-light');
    buttonLanguageHide.classList.add('btn-dark');
}
function hideLanguageReset() {
    const hiddenStates = hiddenStatesDefault;
    if (preferredLanguages.length !== 0) {
        for (let i = 0; i < preferredLanguages.length; i++) {
            const colId = preferredLanguages[i];
            hiddenStates.push({colId: colId.toString(), hide: false});
        }
    }
    gridApi.applyColumnState({
        defaultState: {hide: false},
        state: hiddenStates,
    });
    buttonLanguageHide.onclick = function() {
        hideLanguage();
    };
    buttonLanguageHide.textContent = buttonLanguageHide.dataset.labelHide;
    buttonLanguageHide.classList.remove('btn-dark');
    buttonLanguageHide.classList.add('btn-light');
}
function pinLanguage() {
    const pinnedStates = pinnedStatesDefault;
    if (preferredLanguages.length !== 0) {
        for (let i = 0; i < preferredLanguages.length; i++) {
            const colId = preferredLanguages[i];
            pinnedStates.push({colId: colId.toString(), pinned: 'left'});
        }
    }
    gridApi.applyColumnState({
        defaultState: {pinned: null},
        state: pinnedStates,
    });
    buttonLanguagePin.onclick = function() {
        pinLanguageReset();
    };
    buttonLanguagePin.textContent = buttonLanguagePin.dataset.labelUnpin;
    buttonLanguagePin.classList.remove('btn-light');
    buttonLanguagePin.classList.add('btn-dark');
}
function pinLanguageReset() {
    const pinnedStates = pinnedStatesDefault;
    if (preferredLanguages.length !== 0) {
        for (let i = 0; i < preferredLanguages.length; i++) {
            const colId = preferredLanguages[i];
            pinnedStates.push({colId: colId.toString(), pinned: null});
        }
    }
    gridApi.applyColumnState({
        defaultState: {pinned: null},
        state: pinnedStates,
    });
    buttonLanguagePin.onclick = function() {
        pinLanguage();
    };
    buttonLanguagePin.textContent = buttonLanguagePin.dataset.labelPin;
    buttonLanguagePin.classList.remove('btn-dark');
    buttonLanguagePin.classList.add('btn-light');
}



// Render cell - extension with link to crowdin project & source (currently TER only)
function renderCellExtension(params) {
    const link_crowdin = `<a href="${sourceCrowdin}${params.data.crowdinKey}" target="_blank" title="Crowdin">${params.data.extensionKey}</a>`;
    // Source link only for TER extensions
    let link_src;
    if ( params.data.extensionKey != 'typo3-cms') {
        link_src = `<a href="${sourceTYPO3ExtensionRepository}${params.data.extensionKey}" target="_blank" title="TYPO3 extension repository">ter</a>`;
    }
    // Render admonition for extension state with information about usable or not (No approvals available)
    let unusable = '';
    if (params.data.usable === false) {
        unusable = '<span class="t3-admonition t3-admonition-warning" role="alert" title="No approvals available"></span>';
    }
    return ` ${(link_crowdin) + (link_src ? ' | ' + link_src : '') + unusable}`;
}

// Render cell - crowdin project language link
function renderCellCrowdinProjectLanguage(params) {
    const dataApprovals = params.data.approvals[params.colDef.t3LanguageKey];
    const dataTranslations = params.data.translations[params.colDef.t3LanguageKey];
    let resultStyleAdditionalClasses = 't3-cell-element';
    if (params.data.usable && dataTranslations >= 80) {
        resultStyleAdditionalClasses += ' t3-cell-element-success';
    }
    if (params.data.usable && dataTranslations >= 50 && dataTranslations < 80) {
        resultStyleAdditionalClasses += ' t3-cell-element-warning';
    }
    if (params.data.usable && dataTranslations < 50) {
        resultStyleAdditionalClasses += ' t3-cell-element-danger';
    }
    if (params.data.usable && typeof dataTranslations === "number") {
        resultStyleAdditionalClasses += ' t3-cell-element-unit-percent';
    }
    if (params.data.usable && (dataApprovals !== dataTranslations)) {
        resultStyleAdditionalClasses += ' t3-cell-element-lang-approval-missing';
    }
    const resultInfo = `${dataApprovals} / ${dataTranslations}`
    if (params.data.usable && typeof dataTranslations === "number") {
        return `<a href="${sourceCrowdin}${params.data.crowdinKey}/${params.colDef.t3LanguageKey}" target="_blank"><span class="${resultStyleAdditionalClasses}">${resultInfo}</span></a>`;
    } else {
        return `<span class="${resultStyleAdditionalClasses}">-</span>`;
    }
}

// Render tooltip - project language state
function renderTooltipProjectLanguageState(params) {
    const dataApprovals = params.data.approvals[params.colDef.t3LanguageKey];
    const dataTranslations = params.data.translations[params.colDef.t3LanguageKey];
    if (params.data.usable && (dataApprovals !== dataTranslations)) {
        return `${dataTranslations - dataApprovals}% Approvals missing`;
    } else {
        return '';
    }
}
