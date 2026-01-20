/**
 * Copyright (c) 2026 Brian Kyle L. Salor
 * Email: briankylesalor02@gmail.com
 * 
 * This project is licensed under the MIT License.
 * See LICENSE file for details.
 */

const CONFIG = {
    minGrade: 0,
    maxGrade: 5.0,
    minUnits: 0.1,
    maxUnits: 10,
    years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    semesters: ['1st Semester', '2nd Semester'],
    defaultSubjects: 3
};

const state = {
    data: {},
    rangeFilter: 'all',
    schoolName: '',
    studentName: ''
};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadFromLocalStorage();
    renderRangeFilter();
    renderYears();
    attachEventListeners();
    updateSummary();
    setTimeout(() => {
        updatePDFButtonState();
    }, 100);
}

function checkForExistingData() {
    try {
        const saved = localStorage.getItem('gwaCalculatorData');
        if (saved) {
            const data = JSON.parse(saved);
            // Check if there's any actual subject data
            for (let yearIndex in data) {
                for (let semesterIndex in data[yearIndex]) {
                    const subjects = data[yearIndex][semesterIndex];
                    if (subjects && subjects.length > 0) {
                        // Check if any subject has actual data
                        const hasData = subjects.some(subject => {
                            const grade = parseFloat(subject.grade);
                            const units = parseFloat(subject.units);
                            return (subject.name && subject.name.trim()) || 
                                   (!isNaN(grade) && grade > 0) || 
                                   (!isNaN(units) && units > 0);
                        });
                        if (hasData) {
                            return true;
                        }
                    }
                }
            }
        }
        const studentName = localStorage.getItem('gwaCalculatorStudentName');
        const schoolName = localStorage.getItem('gwaCalculatorSchoolName');
        if (studentName && studentName.trim()) return true;
        if (schoolName && schoolName.trim()) return true;
        return false;
    } catch (e) {
        return false;
    }
}

function clearAllData() {
    try {
        localStorage.removeItem('gwaCalculatorData');
        localStorage.removeItem('gwaCalculatorRangeFilter');
        localStorage.removeItem('gwaCalculatorSchoolName');
        localStorage.removeItem('gwaCalculatorStudentName');
        
        state.data = {};
        state.rangeFilter = 'all';
        state.schoolName = '';
        state.studentName = '';
        
        const studentInput = document.getElementById('studentName');
        const schoolInput = document.getElementById('schoolName');
        if (studentInput) studentInput.value = '';
        if (schoolInput) schoolInput.value = '';
        
        renderRangeFilter();
        renderYears();
        updateSummary();
        updatePDFButtonState();
    } catch (e) {
        console.warn('Failed to clear data:', e);
    }
}

function checkForExistingData() {
    try {
        const saved = localStorage.getItem('gwaCalculatorData');
        if (saved) {
            const data = JSON.parse(saved);
            // Check if there's any actual subject data
            for (let yearIndex in data) {
                for (let semesterIndex in data[yearIndex]) {
                    const subjects = data[yearIndex][semesterIndex];
                    if (subjects && subjects.length > 0) {
                        // Check if any subject has actual data
                        const hasData = subjects.some(subject => {
                            const grade = parseFloat(subject.grade);
                            const units = parseFloat(subject.units);
                            return (subject.name && subject.name.trim()) || 
                                   (!isNaN(grade) && grade > 0) || 
                                   (!isNaN(units) && units > 0);
                        });
                        if (hasData) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

function ensureYearSemester(yearIndex, semesterIndex) {
    if (!state.data[yearIndex]) {
        state.data[yearIndex] = {};
    }
    if (!state.data[yearIndex][semesterIndex]) {
        state.data[yearIndex][semesterIndex] = [];
    }
}

function isSemesterInRange(yearIndex, semesterIndex) {
    if (state.rangeFilter === 'all') {
        return true;
    }
    
    const parts = state.rangeFilter.split('-').map(Number);
    if (parts.length !== 4) return true;
    
    const [startYear, startSem, endYear, endSem] = parts;
    
    const currentValue = yearIndex * 2 + semesterIndex;
    const startValue = startYear * 2 + startSem;
    const endValue = endYear * 2 + endSem;
    
    return currentValue >= startValue && currentValue <= endValue;
}

function setRangeFilter(range) {
    state.rangeFilter = range;
    saveToLocalStorage();
    updateSummary();
    updateSemesterVisuals();
}

function renderRangeFilter() {
    const select = document.getElementById('gwaRangeFilter');
    if (!select) return;
    
    select.innerHTML = '';
    
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Semesters';
    select.appendChild(allOption);
    
    const options = generateRangeOptions();
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.value;
        optElement.textContent = option.label;
        select.appendChild(optElement);
    });
    
    select.value = state.rangeFilter || 'all';
    
    select.addEventListener('change', (e) => {
        setRangeFilter(e.target.value);
    });
}

function generateRangeOptions() {
    const options = [];
    
    for (let endYear = 0; endYear < CONFIG.years.length; endYear++) {
        for (let endSem = 0; endSem < CONFIG.semesters.length; endSem++) {
            const startYear = 0;
            const startSem = 0;
            
            const value = `${startYear}-${startSem}-${endYear}-${endSem}`;
            
            let label = '';
            if (endYear === 0 && endSem === 0) {
                label = '1st Year 1st Semester only';
            } else if (endYear === 0 && endSem === 1) {
                label = '1st Year (Both Semesters)';
            } else if (endSem === 0) {
                const endYearName = CONFIG.years[endYear];
                label = `1st Year 1st Sem to ${endYearName} 1st Sem`;
            } else {
                const endYearName = CONFIG.years[endYear];
                label = `1st Year 1st Sem to ${endYearName} 2nd Sem`;
            }
            
            options.push({ value, label });
        }
    }
    
    return options;
}

function getSubject(yearIndex, semesterIndex, subjectIndex) {
    ensureYearSemester(yearIndex, semesterIndex);
    return state.data[yearIndex][semesterIndex][subjectIndex];
}

function addSubject(yearIndex, semesterIndex) {
    ensureYearSemester(yearIndex, semesterIndex);
    state.data[yearIndex][semesterIndex].push({
        name: '',
        grade: '',
        units: ''
    });
    saveToLocalStorage();
    renderSemester(yearIndex, semesterIndex);
    updateSummary();
}

function removeSubject(yearIndex, semesterIndex, subjectIndex) {
    if (state.data[yearIndex] && state.data[yearIndex][semesterIndex]) {
        state.data[yearIndex][semesterIndex].splice(subjectIndex, 1);
        saveToLocalStorage();
        renderSemester(yearIndex, semesterIndex);
        updateSummary();
    }
}

function updateSubject(yearIndex, semesterIndex, subjectIndex, field, value) {
    ensureYearSemester(yearIndex, semesterIndex);
    if (!state.data[yearIndex][semesterIndex][subjectIndex]) {
        state.data[yearIndex][semesterIndex][subjectIndex] = {
            name: '',
            grade: '',
            units: ''
        };
    }
    state.data[yearIndex][semesterIndex][subjectIndex][field] = value;
    saveToLocalStorage();
    updateSummary();
}

function calculateSemesterGWA(yearIndex, semesterIndex) {
    const subjects = state.data[yearIndex]?.[semesterIndex] || [];
    
    let totalPoints = 0;
    let totalUnits = 0;
    
    subjects.forEach(subject => {
        // Only count valid subjects (skip empty or incomplete entries)
        if (isValidSubject(subject)) {
            const grade = parseFloat(subject.grade);
            const units = parseFloat(subject.units);
            totalPoints += grade * units;
            totalUnits += units;
        }
    });
    
    if (totalUnits === 0) return null;
    
    return totalPoints / totalUnits;
}

function calculateCumulativeGWA() {
    let totalPoints = 0;
    let totalUnits = 0;
    
    Object.keys(state.data).forEach(yearIndex => {
        Object.keys(state.data[yearIndex]).forEach(semesterIndex => {
            if (!isSemesterInRange(parseInt(yearIndex), parseInt(semesterIndex))) {
                return;
            }
            
            const subjects = state.data[yearIndex][semesterIndex] || [];
            
            subjects.forEach(subject => {
                if (isValidSubject(subject)) {
                    const grade = parseFloat(subject.grade);
                    const units = parseFloat(subject.units);
                    totalPoints += grade * units;
                    totalUnits += units;
                }
            });
        });
    });
    
    if (totalUnits === 0) return null;
    
    return totalPoints / totalUnits;
}

function getTotalUnits() {
    let totalUnits = 0;
    
    Object.keys(state.data).forEach(yearIndex => {
        Object.keys(state.data[yearIndex]).forEach(semesterIndex => {
            if (!isSemesterInRange(parseInt(yearIndex), parseInt(semesterIndex))) {
                return;
            }
            
            const subjects = state.data[yearIndex][semesterIndex] || [];
            
            subjects.forEach(subject => {
                const units = parseFloat(subject.units);
                if (!isNaN(units) && units > 0) {
                    totalUnits += units;
                }
            });
        });
    });
    
    return totalUnits;
}

function getActiveSemestersCount() {
    let count = 0;
    
    Object.keys(state.data).forEach(yearIndex => {
        Object.keys(state.data[yearIndex]).forEach(semesterIndex => {
            if (!isSemesterInRange(parseInt(yearIndex), parseInt(semesterIndex))) {
                return;
            }
            
            const subjects = state.data[yearIndex][semesterIndex] || [];
            const hasValidSubjects = subjects.some(subject => {
                const grade = parseFloat(subject.grade);
                const units = parseFloat(subject.units);
                return !isNaN(grade) && !isNaN(units) && units > 0;
            });
            
            if (hasValidSubjects) {
                count++;
            }
        });
    });
    
    return count;
}

function formatGWA(gwa) {
    if (gwa === null || isNaN(gwa)) return '0.00';
    return gwa.toFixed(2);
}

function formatUnits(units) {
    if (units === null || isNaN(units)) return '0';
    return Math.round(units * 10) / 10;
}

function validateGrade(grade) {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return false;
    return numGrade >= CONFIG.minGrade && numGrade <= CONFIG.maxGrade;
}

function validateUnits(units) {
    const numUnits = parseFloat(units);
    if (isNaN(numUnits)) return false;
    return numUnits >= CONFIG.minUnits && numUnits <= CONFIG.maxUnits;
}

function isValidSubject(subject) {
    if (!subject) return false;
    
    const grade = parseFloat(subject.grade);
    const units = parseFloat(subject.units);
    
    return !isNaN(grade) && !isNaN(units) && units > 0 && 
           grade >= CONFIG.minGrade && grade <= CONFIG.maxGrade;
}

function isEmptySubject(subject) {
    if (!subject) return true;
    
    const hasName = subject.name && subject.name.trim() !== '';
    const hasGrade = subject.grade && subject.grade.toString().trim() !== '';
    const hasUnits = subject.units && subject.units.toString().trim() !== '';
    
    return !hasName && !hasGrade && !hasUnits;
}

function renderYears() {
    const container = document.getElementById('yearsContainer');
    container.innerHTML = '';
    
    CONFIG.years.forEach((yearName, yearIndex) => {
        const yearSection = createYearSection(yearIndex, yearName);
        container.appendChild(yearSection);
    });
    
    updateSemesterVisuals();
}

function createYearSection(yearIndex, yearName) {
    const section = document.createElement('div');
    section.className = 'year-section collapsed';
    section.dataset.yearIndex = yearIndex;
    
    const header = document.createElement('div');
    header.className = 'year-header';
    header.innerHTML = `
        <div class="year-title">
            <div class="year-icon">${yearIndex + 1}</div>
            <span>${yearName}</span>
        </div>
        <div class="year-toggle">
            <span class="year-toggle-icon">▼</span>
        </div>
    `;
    
    const content = document.createElement('div');
    content.className = 'year-content';
    
    const semesters = document.createElement('div');
    semesters.className = 'year-semesters';
    
    CONFIG.semesters.forEach((semesterName, semesterIndex) => {
        const semesterSection = createSemesterSection(yearIndex, semesterIndex, semesterName);
        semesters.appendChild(semesterSection);
    });
    
    content.appendChild(semesters);
    section.appendChild(header);
    section.appendChild(content);
    
    header.addEventListener('click', () => {
        section.classList.toggle('collapsed');
    });
    
    return section;
}

function createSemesterSection(yearIndex, semesterIndex, semesterName) {
    const section = document.createElement('div');
    section.className = 'semester-section';
    section.dataset.yearIndex = yearIndex;
    section.dataset.semesterIndex = semesterIndex;
    
    ensureYearSemester(yearIndex, semesterIndex);
    
    const header = document.createElement('div');
    header.className = 'semester-header';
    
    const title = document.createElement('div');
    title.className = 'semester-title';
    title.textContent = semesterName;
    
    const stats = document.createElement('div');
    stats.className = 'semester-stats';
    
    const gwaStat = document.createElement('div');
    gwaStat.className = 'semester-stat';
    gwaStat.innerHTML = `
        <span class="semester-stat-label">GWA</span>
        <span class="semester-stat-value semester-gwa" id="semester-gwa-${yearIndex}-${semesterIndex}">0.00</span>
    `;
    
    const unitsStat = document.createElement('div');
    unitsStat.className = 'semester-stat';
    unitsStat.innerHTML = `
        <span class="semester-stat-label">Units</span>
        <span class="semester-stat-value" id="semester-units-${yearIndex}-${semesterIndex}">0</span>
    `;
    
    stats.appendChild(gwaStat);
    stats.appendChild(unitsStat);
    header.appendChild(title);
    header.appendChild(stats);
    
    const table = document.createElement('table');
    table.className = 'subjects-table';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'subject-header-row';
    
    const nameHeader = document.createElement('th');
    nameHeader.textContent = 'Subject';
    nameHeader.className = 'subject-header';
    
    const gradeHeader = document.createElement('th');
    gradeHeader.textContent = 'Grade';
    gradeHeader.className = 'subject-header';
    
    const unitsHeader = document.createElement('th');
    unitsHeader.textContent = 'Units';
    unitsHeader.className = 'subject-header';
    
    const gradeUnitsHeader = document.createElement('th');
    gradeUnitsHeader.textContent = 'Grade × Units';
    gradeUnitsHeader.className = 'subject-header';
    
    const actionHeader = document.createElement('th');
    actionHeader.textContent = 'Action';
    actionHeader.className = 'subject-header';
    
    headerRow.appendChild(nameHeader);
    headerRow.appendChild(gradeHeader);
    headerRow.appendChild(unitsHeader);
    headerRow.appendChild(gradeUnitsHeader);
    headerRow.appendChild(actionHeader);
    thead.appendChild(headerRow);
    
    const tbody = document.createElement('tbody');
    tbody.id = `subjects-tbody-${yearIndex}-${semesterIndex}`;
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    const addButton = document.createElement('button');
    addButton.className = 'btn-add-subject';
    addButton.innerHTML = '<span>+</span> <span>Add Subject</span>';
    addButton.addEventListener('click', () => {
        addSubject(yearIndex, semesterIndex);
    });
    
    section.appendChild(header);
    section.appendChild(table);
    section.appendChild(addButton);
    
    renderSemester(yearIndex, semesterIndex);
    updateSemesterVisuals();
    
    return section;
}

function renderSemester(yearIndex, semesterIndex) {
    const tbody = document.getElementById(`subjects-tbody-${yearIndex}-${semesterIndex}`);
    if (!tbody) return;
    
    ensureYearSemester(yearIndex, semesterIndex);
    const subjects = state.data[yearIndex][semesterIndex];
    
    tbody.innerHTML = '';
    
    if (subjects.length > 0) {
        subjects.forEach((subject, subjectIndex) => {
            const row = createSubjectRow(yearIndex, semesterIndex, subjectIndex, subject);
            tbody.appendChild(row);
        });
        
        subjects.forEach((subject, subjectIndex) => {
            updateGradeUnitsDisplay(yearIndex, semesterIndex, subjectIndex);
        });
    }
    
    updateSemesterStats(yearIndex, semesterIndex);
}

function createSubjectRow(yearIndex, semesterIndex, subjectIndex, subject) {
    const row = document.createElement('tr');
    row.className = 'subject-row';
    row.dataset.yearIndex = yearIndex;
    row.dataset.semesterIndex = semesterIndex;
    row.dataset.subjectIndex = subjectIndex;
    
    const nameCell = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'subject-input';
    nameInput.placeholder = 'Subject';
    nameInput.value = subject.name || '';
    nameInput.addEventListener('input', (e) => {
        updateSubject(yearIndex, semesterIndex, subjectIndex, 'name', e.target.value);
        updateGradeUnitsDisplay(yearIndex, semesterIndex, subjectIndex);
    });
    nameCell.appendChild(nameInput);
    
    const gradeCell = document.createElement('td');
    const gradeInput = document.createElement('input');
    gradeInput.type = 'number';
    gradeInput.className = 'subject-input';
    gradeInput.placeholder = '0.00';
    gradeInput.step = '0.01';
    gradeInput.min = CONFIG.minGrade;
    gradeInput.max = CONFIG.maxGrade;
    gradeInput.value = subject.grade || '';
    gradeInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value === '' || validateGrade(value)) {
            updateSubject(yearIndex, semesterIndex, subjectIndex, 'grade', value);
            updateGradeUnitsDisplay(yearIndex, semesterIndex, subjectIndex);
        } else {
            e.target.value = subject.grade || '';
        }
    });
    gradeCell.appendChild(gradeInput);
    
    const unitsCell = document.createElement('td');
    const unitsInput = document.createElement('input');
    unitsInput.type = 'number';
    unitsInput.className = 'subject-input';
    unitsInput.placeholder = '0';
    unitsInput.step = '0.1';
    unitsInput.min = CONFIG.minUnits;
    unitsInput.max = CONFIG.maxUnits;
    unitsInput.value = subject.units || '';
    unitsInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value === '' || validateUnits(value)) {
            updateSubject(yearIndex, semesterIndex, subjectIndex, 'units', value);
            updateGradeUnitsDisplay(yearIndex, semesterIndex, subjectIndex);
        } else {
            e.target.value = subject.units || '';
        }
    });
    unitsCell.appendChild(unitsInput);
    
    const gradeUnitsCell = document.createElement('td');
    gradeUnitsCell.className = 'grade-units-display';
    gradeUnitsCell.id = `grade-units-${yearIndex}-${semesterIndex}-${subjectIndex}`;
    gradeUnitsCell.textContent = '0.00';
    gradeUnitsCell.title = 'Grade × Units (calculated automatically)';
    
    const actionCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.className = 'btn-remove';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
        removeSubject(yearIndex, semesterIndex, subjectIndex);
    });
    actionCell.appendChild(removeButton);
    
    row.appendChild(nameCell);
    row.appendChild(gradeCell);
    row.appendChild(unitsCell);
    row.appendChild(gradeUnitsCell);
    row.appendChild(actionCell);
    
    updateGradeUnitsDisplay(yearIndex, semesterIndex, subjectIndex);
    
    return row;
}

function updateGradeUnitsDisplay(yearIndex, semesterIndex, subjectIndex) {
    const subject = state.data[yearIndex]?.[semesterIndex]?.[subjectIndex];
    if (!subject) return;
    
    const grade = parseFloat(subject.grade);
    const units = parseFloat(subject.units);
    const displayElement = document.getElementById(`grade-units-${yearIndex}-${semesterIndex}-${subjectIndex}`);
    
    if (displayElement) {
        if (!isNaN(grade) && !isNaN(units) && units > 0) {
            const result = grade * units;
            displayElement.textContent = result.toFixed(2);
        } else {
            displayElement.textContent = '0.00';
        }
    }
}

function updateSemesterStats(yearIndex, semesterIndex) {
    const gwa = calculateSemesterGWA(yearIndex, semesterIndex);
    const gwaElement = document.getElementById(`semester-gwa-${yearIndex}-${semesterIndex}`);
    if (gwaElement) {
        gwaElement.textContent = formatGWA(gwa);
    }
    
    const subjects = state.data[yearIndex]?.[semesterIndex] || [];
    let totalUnits = 0;
    
    subjects.forEach(subject => {
        if (isValidSubject(subject)) {
            const units = parseFloat(subject.units);
            totalUnits += units;
        }
    });
    
    const unitsElement = document.getElementById(`semester-units-${yearIndex}-${semesterIndex}`);
    if (unitsElement) {
        unitsElement.textContent = formatUnits(totalUnits);
    }
}

function updateSummary() {
    const cumulativeGWA = calculateCumulativeGWA();
    const totalUnits = getTotalUnits();
    const activeSemesters = getActiveSemestersCount();
    
    const cumulativeElement = document.getElementById('cumulativeGWA');
    if (cumulativeElement) {
        cumulativeElement.textContent = formatGWA(cumulativeGWA);
    }
    
    const totalUnitsElement = document.getElementById('totalUnits');
    if (totalUnitsElement) {
        totalUnitsElement.textContent = formatUnits(totalUnits);
    }
    
    const activeSemestersElement = document.getElementById('activeSemesters');
    if (activeSemestersElement) {
        activeSemestersElement.textContent = activeSemesters;
    }
    
    Object.keys(state.data).forEach(yearIndex => {
        Object.keys(state.data[yearIndex]).forEach(semesterIndex => {
            updateSemesterStats(parseInt(yearIndex), parseInt(semesterIndex));
        });
    });
    
    updateSemesterVisuals();
}

function updateSemesterVisuals() {
    CONFIG.years.forEach((yearName, yearIndex) => {
        let yearHasVisibleSemesters = false;
        
        CONFIG.semesters.forEach((semesterName, semesterIndex) => {
            const section = document.querySelector(`[data-year-index="${yearIndex}"][data-semester-index="${semesterIndex}"]`);
            if (section) {
                const isIncluded = isSemesterInRange(yearIndex, semesterIndex);
                if (isIncluded) {
                    section.classList.remove('excluded', 'hidden');
                    section.classList.add('included');
                    section.style.display = '';
                    yearHasVisibleSemesters = true;
                } else {
                    section.classList.remove('included');
                    section.classList.add('excluded', 'hidden');
                    section.style.display = 'none';
                }
            }
        });
        
        const yearSection = document.querySelector(`.year-section[data-year-index="${yearIndex}"]`);
        if (yearSection) {
            if (yearHasVisibleSemesters) {
                yearSection.classList.remove('hidden');
                yearSection.style.display = '';
            } else {
                yearSection.classList.add('hidden');
                yearSection.style.display = 'none';
            }
        }
    });
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('gwaCalculatorData', JSON.stringify(state.data));
        localStorage.setItem('gwaCalculatorRangeFilter', state.rangeFilter);
        localStorage.setItem('gwaCalculatorSchoolName', state.schoolName);
        localStorage.setItem('gwaCalculatorStudentName', state.studentName);
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('gwaCalculatorData');
        if (saved) {
            state.data = JSON.parse(saved);
        }
        const savedRange = localStorage.getItem('gwaCalculatorRangeFilter');
        if (savedRange) {
            state.rangeFilter = savedRange;
        }
        const savedSchool = localStorage.getItem('gwaCalculatorSchoolName');
        if (savedSchool) {
            state.schoolName = savedSchool;
            const schoolInput = document.getElementById('schoolName');
            if (schoolInput) {
                schoolInput.value = savedSchool;
            }
        }
        const savedStudent = localStorage.getItem('gwaCalculatorStudentName');
        if (savedStudent) {
            state.studentName = savedStudent;
            const studentInput = document.getElementById('studentName');
            if (studentInput) {
                studentInput.value = savedStudent;
            }
        }
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
        state.data = {};
        state.rangeFilter = 'all';
        state.schoolName = '';
        state.studentName = '';
    }
}

function attachEventListeners() {
    const studentInput = document.getElementById('studentName');
    if (studentInput) {
        studentInput.addEventListener('input', (e) => {
            state.studentName = e.target.value.trim();
            saveToLocalStorage();
            updatePDFButtonState();
        });
    }
    
    const schoolInput = document.getElementById('schoolName');
    if (schoolInput) {
        schoolInput.addEventListener('input', (e) => {
            state.schoolName = e.target.value;
            saveToLocalStorage();
        });
    }
    
    const clearButton = document.getElementById('clearDataBtn');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            const hasData = checkForExistingData() || 
                           (state.studentName && state.studentName.trim()) || 
                           (state.schoolName && state.schoolName.trim());
            
            if (hasData) {
                showModal(
                    'Clear All Data',
                    'Are you sure you want to clear all data?\n\n' +
                    'This will remove:\n' +
                    '• All subject entries\n' +
                    '• Student name\n' +
                    '• School name\n' +
                    '• All saved grades and units\n\n' +
                    'This action cannot be undone.',
                    () => {
                        hideModal();
                    },
                    () => {
                        clearAllData();
                        hideModal();
                        showModal(
                            'Data Cleared',
                            'All data has been cleared successfully.\n\nThe page will refresh in a moment.',
                            () => {
                                window.location.reload();
                            },
                            null,
                            false // No cancel button
                        );
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                );
            } else {
                showModal(
                    'No Data',
                    'No data to clear.',
                    () => {
                        hideModal();
                    },
                    null,
                    false // No cancel button
                );
            }
        });
    }
    
    const pdfButton = document.getElementById('generatePDFBtn');
    if (pdfButton) {
        pdfButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!state.studentName || state.studentName.trim() === '') {
                showModal(
                    'Student Name Required',
                    'Please enter your student name to generate the PDF report.',
                    () => {
                        hideModal();
                        const studentInput = document.getElementById('studentName');
                        if (studentInput) {
                            studentInput.focus();
                        }
                    },
                    null,
                    false // No cancel button
                );
                return;
            }
            
            if (window.location.protocol === 'file:') {
                showModal(
                    'Local Server Required',
                    'To download PDFs, please run this app through a local server.\n\n' +
                    'Quick Setup:\n' +
                    '1. Open Command Prompt in this folder\n' +
                    '2. Run: python -m http.server 8000\n' +
                    '3. Open: http://localhost:8000\n\n' +
                    'See SERVER_SETUP.md for detailed instructions.',
                    () => {
                        hideModal();
                    },
                    null,
                    false
                );
                return;
            }
            
            try {
                generatePDFReport();
            } catch (error) {
                console.error('PDF generation error:', error);
                showModal(
                    'PDF Generation Error',
                    'There was an error generating the PDF report. Please try again.',
                    () => {
                        hideModal();
                    },
                    null,
                    false
                );
            }
        });
    }
    
    setupModalListeners();
    updatePDFButtonState();
}

function updatePDFButtonState() {
    const pdfButton = document.getElementById('generatePDFBtn');
    
    if (pdfButton) {
        if (!state.studentName || state.studentName.trim() === '') {
            pdfButton.disabled = true;
        } else {
            pdfButton.disabled = false;
        }
    }
}

function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Cumulative GWA Summary Report', margin, yPos);
    yPos += 6;
    
    if (state.studentName && state.studentName.trim()) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Name:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(state.studentName.trim(), margin + 35, yPos);
        yPos += 5;
    }
    
    if (state.schoolName && state.schoolName.trim()) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('School:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(state.schoolName.trim(), margin + 20, yPos);
        yPos += 5;
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Generated on: ${currentDate}`, margin, yPos);
    yPos += 5;
    
    yPos += 3;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPos);
    yPos += 5;
    
    const cumulativeGWA = calculateCumulativeGWA();
    const totalUnits = getTotalUnits();
    const activeSemesters = getActiveSemestersCount();
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cumulative GWA: ${formatGWA(cumulativeGWA)}`, margin, yPos);
    yPos += 4;
    doc.text(`Total Units: ${formatUnits(totalUnits)}`, margin, yPos);
    yPos += 4;
    doc.text(`Active Semesters: ${activeSemesters}`, margin, yPos);
    yPos += 6;
    
    const semestersData = [];
    CONFIG.years.forEach((yearName, yearIndex) => {
        CONFIG.semesters.forEach((semesterName, semesterIndex) => {
            if (isSemesterInRange(yearIndex, semesterIndex)) {
                const subjects = state.data[yearIndex]?.[semesterIndex] || [];
                
                const validSubjects = subjects.filter(subject => isValidSubject(subject));
                
                if (validSubjects.length > 0) {
                    const semesterGWA = calculateSemesterGWA(yearIndex, semesterIndex);
                    let semesterUnits = 0;
                    validSubjects.forEach(subject => {
                        const units = parseFloat(subject.units);
                        semesterUnits += units;
                    });
                    
                    semestersData.push({
                        year: yearName,
                        semester: semesterName,
                        subjects: validSubjects,
                        gwa: semesterGWA,
                        units: semesterUnits
                    });
                }
            }
        });
    });
    
    semestersData.forEach((semesterData, index) => {
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 15;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const semesterTitle = `${semesterData.year} - ${semesterData.semester}`;
        doc.text(semesterTitle, margin, yPos);
        yPos += 4;
        
        const tableData = semesterData.subjects.map(subject => {
            const grade = parseFloat(subject.grade) || 0;
            const units = parseFloat(subject.units) || 0;
            const gradeUnits = grade * units;
            return [
                subject.name || '-',
                grade > 0 ? grade.toFixed(2) : '-',
                units > 0 ? units.toFixed(1) : '-',
                (grade > 0 && units > 0) ? gradeUnits.toFixed(2) : '-'
            ];
        });
        
        let totalGradeUnits = 0;
        semesterData.subjects.forEach(subject => {
            const grade = parseFloat(subject.grade) || 0;
            const units = parseFloat(subject.units) || 0;
            if (grade > 0 && units > 0) {
                totalGradeUnits += grade * units;
            }
        });
        
        tableData.push([
            'TOTAL',
            '',
            semesterData.units.toFixed(1),
            totalGradeUnits.toFixed(2)
        ]);
        
        tableData.push([
            `Semester GWA: ${formatGWA(semesterData.gwa)}`,
            '',
            '',
            ''
        ]);
        
        doc.autoTable({
            startY: yPos,
            head: [['Subject', 'Grade', 'Units', 'Grade × Units']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [99, 102, 241],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 2
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 2
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: margin, right: margin, top: 0, bottom: 0 },
            styles: {
                cellPadding: 2,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
                fontSize: 8
            },
            didDrawPage: function(data) {
                yPos = data.cursor.y + 4;
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 4;
    });
    
    if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = pageHeight - 25;
    } else {
        yPos = pageHeight - 25;
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('This report was generated using the Cumulative GWA Calculator System.', margin, yPos);
    yPos += 4;
    doc.text('Developed by: Brian Kyle L. Salor', margin, yPos);
    yPos += 4;
    doc.text('Email: briankylesalor02@gmail.com', margin, yPos);
    yPos += 4;
    doc.text('Free to use for academic purposes.', margin, yPos);
    
    try {
        const fileName = `GWA_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        
        try {
            const pdfArrayBuffer = doc.output('arraybuffer');
            const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            link.setAttribute('download', fileName);
            
            document.body.appendChild(link);
            
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            link.dispatchEvent(clickEvent);
            
            setTimeout(() => {
                if (document.body.contains(link)) {
                    document.body.removeChild(link);
                }
                URL.revokeObjectURL(url);
            }, 200);
            
            return;
        } catch (blobError) {
            console.warn('Blob method failed, trying alternative:', blobError);
        }
        
        try {
            const pdfDataUri = doc.output('datauristring');
            const link = document.createElement('a');
            link.href = pdfDataUri;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                if (document.body.contains(link)) {
                    document.body.removeChild(link);
                }
            }, 200);
            return;
        } catch (dataUriError) {
            console.warn('Data URI method failed, trying direct save:', dataUriError);
        }
        
        doc.save(fileName);
        
    } catch (error) {
        console.error('All PDF download methods failed:', error);
        
        try {
            const pdfDataUri = doc.output('datauristring');
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`<iframe width="100%" height="100%" src="${pdfDataUri}"></iframe>`);
                showModal(
                    'PDF Opened in New Window',
                    'The PDF has been opened in a new window. Please use your browser\'s print or save function (Ctrl+P or Cmd+P) to download it.',
                    () => {
                        hideModal();
                    },
                    null,
                    false
                );
            } else {
                throw new Error('Popup blocked');
            }
        } catch (windowError) {
            showModal(
                'Download Blocked',
                'Your browser is blocking the download. Please:\n\n' +
                '1. Check your browser\'s download settings\n' +
                '2. Allow downloads for this site\n' +
                '3. Try using a local server instead of opening the file directly\n' +
                '4. Or use your browser\'s print function (Ctrl+P) to save as PDF',
                () => {
                    hideModal();
                },
                null,
                false
            );
        }
    }
}

function showModal(title, message, onCancel, onConfirm, showCancel = true) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    
    if (!modal || !modalTitle || !modalMessage || !modalCancel || !modalConfirm) return;
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    if (showCancel) {
        modalCancel.style.display = 'flex';
    } else {
        modalCancel.style.display = 'none';
    }
    
    const newCancel = modalCancel.cloneNode(true);
    const newConfirm = modalConfirm.cloneNode(true);
    modalCancel.parentNode.replaceChild(newCancel, modalCancel);
    modalConfirm.parentNode.replaceChild(newConfirm, modalConfirm);
    
    const cancelBtn = document.getElementById('modalCancel');
    const confirmBtn = document.getElementById('modalConfirm');
    
    if (onCancel) {
        cancelBtn.addEventListener('click', () => {
            hideModal();
            onCancel();
        });
    } else {
        cancelBtn.addEventListener('click', () => {
            hideModal();
        });
    }
    
    if (onConfirm) {
        confirmBtn.addEventListener('click', () => {
            onConfirm();
        });
    } else {
        confirmBtn.addEventListener('click', () => {
            hideModal();
        });
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function setupModalListeners() {
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            hideModal();
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            hideModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            hideModal();
        }
    });
}

