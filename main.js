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
                    cellClassRules: {
                        't3-cell-color-green': 'x >= 80',
                        't3-cell-color-blue': 'x >= 50 && x < 80',
                        't3-cell-color-red': 'x < 50',
                        't3-cell-unit-percent': 'x >= 0',
                    },
                    cellRenderer: renderCellCrowdinProjectLanguage,
                    filter: false,
                    headerClass: 'ag-header-cell-custom-languagestyle',
                    headerName: value,
                    headerTooltip: key,
                    sortable: true,
                    valueGetter: `data.languages['${key}']`,
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
                pinned: 'left',
                sortable: true,
                width: 260,
            },
            {
                headerName: '',
                cellRenderer: renderCellExtensionState,
                field: 'usable',
                pinned: 'left',
                sortable: true,
                width: 20,
            },
            ...columnDefsLanguages
        ];

        const defaultColDef = {
            filter: false,
            flex: 1,
            initialWidth: 70,
            minWidth: 70,
            sortable: false,
        };

        const gridOptions = {
            columnDefs: columnDefs,
            defaultColDef: defaultColDef,
            headerHeight: 110,
            theme: agGrid.themeMaterial,
        };

        const gridDiv = document.querySelector('#ag-grid');

        // Create grid
        gridApi = agGrid.createGrid(gridDiv, gridOptions);
        gridApi.setGridOption('rowData', jsonData.projects);

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

// Render extension with link to crowdin project & source (currently TER only)
function renderCellExtension(params) {
    const link_crowdin = `<a href="${sourceCrowdin}${params.data.crowdinKey}" target="_blank" title="Crowdin">${params.data.extensionKey}</a>`;
    // Source link only for TER extensions
    let link_src;
    if ( params.data.extensionKey != 'typo3-cms') {
        link_src = `<a href="${sourceTYPO3ExtensionRepository}${params.data.extensionKey}" target="_blank" title="TYPO3 extension repository">ter</a>`;
    }
    return `${(link_crowdin) + (link_src ? ' | ' + link_src : '')}`;
}

/**
 * Render extension state with information about
 * - usable or not (unfinished)
 * - ...
 */
function renderCellExtensionState(params) {
    if (params.data.usable) {
        return '';
    } else {
        return '<span class="t3-admonition t3-admonition-warning" role="alert" title="Unfinished projects"></span>';
    }
}

// Render crowdin project language link
function renderCellCrowdinProjectLanguage(params) {
    if (params.data.usable && typeof params.value === "number") {
        return `<a href="${sourceCrowdin}${params.data.crowdinKey}/${params.colDef.t3LanguageKey}" target="_blank"><span class="t3-cell-element">${params.value}</span></a>`;
    } else {
        return `<span class="t3-cell-element">${params.value}</span>`;
    }
}
