const openExplorer = document.getElementById('open-explorer');
const runSort = document.getElementById('run-sort');
const pathToDir = document.getElementById('path-to-dir');
const logs = document.getElementById('logs');
const stopSort = document.getElementById('stop-sort');
const loadLevelInput = document.getElementById('load-level');
const loadLevelDisplay = document.getElementById('load-level-display');

loadLevelInput.addEventListener('input', () => {
    loadLevelDisplay.textContent = loadLevelInput.value;
    window.api.setLoadLevel(loadLevelInput.value); // Отправка значения в главный процесс
});



openExplorer.addEventListener('click', () => {
    window.api.openExplorer();
});

runSort.addEventListener('click', () => {
    window.api.runSort(pathToDir.value);
});

stopSort.addEventListener('click', () => {
    console.log('-----------------------------------------------------\n-----------------------------------------\n---------------------------------------\n---------------------------')
    window.api.stopSort();
});

window.api.onSelectPath((path) => {
    pathToDir.value = path;
});

window.api.onPrintLog((log) => {
    if (logs.innerHTML === '') {
        logs.innerHTML = 'Logs: <br>';
    }
    logs.innerHTML += log + '<br>';
});

