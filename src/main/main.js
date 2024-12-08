const { BrowserWindow, app, ipcMain, dialog } = require('electron');

const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker } = require('worker_threads');

let win;
const categories = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.tiff', '.webp', '.ico', '.raw'],
    documents: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.rtf', '.csv', '.xml'],
    videos: ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm', '.ogv', '.3gp', '.mpeg', '.vob'],
    audios: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.alac', '.m4a', '.wma', '.aiff'],
    archives: ['.zip', '.rar', '.7z', '.tar', '.gz', '.tar.gz', '.xz', '.bz2', '.lz', '.iso'],
    code: [
        '.js', '.ts', '.html', '.css', '.scss', '.json', '.xml', '.php', '.py', '.java',
        '.cpp', '.c', '.rb', '.go', '.sh', '.swift', '.dart', '.rs', '.kt', '.lua', '.r',
        '.pl', '.perl', '.vhdl', '.matlab', '.h', '.hpp', '.cpp', '.aspx', '.jsp', '.asp',
        '.tsv', '.yaml', '.yml'
    ],
    config: [
        '.json', '.yaml', '.yml', '.xml', '.ini', '.conf', '.env', '.toml', '.properties',
        '.config', '.cfg', '.settings'
    ],
    scripts: ['.bash', '.sh', '.ps1', '.zsh', '.bat', '.cmd', '.fish', '.ksh'],
    databases: ['.sql', '.sqlite', '.db', '.mdb', '.csv', '.dmp', '.dbf'],
    versionControl: ['.gitignore', '.git', '.gitmodules', '.gitattributes', '.svn'],
    markup: ['.html', '.xml', '.md', '.rst', '.yaml', '.json', '.csv', '.toml'],
    others: ['.md', '.json', '.ini', '.log', '.txt', '.yml', '.svg', '.tmp', '.bak', '.trace', '.stackdump', '.dump']
};



function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 800,
        icon: path.join('src/assets/icon/logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    win.loadFile('src/home/index.html');
    win.menuBarVisible = false;
    win.webContents.openDevTools();
}



// Кэш для быстрого поиска категорий по расширению
const categoryCache = {};

for (const [category, extensions] of Object.entries(categories)) {
    for (const ext of extensions) {
        categoryCache[ext] = category;
    }
}

// Функция для получения категории файла
function getCategory(ext) {
    return categoryCache[ext] || 'others';
}

// Функция для создания папок категорий
async function ensureCategoryDirs(baseDir) {
    const dirs = Object.keys(categories);
    await Promise.all(
        dirs.map(category => fs.promises.mkdir(path.join(baseDir, category), { recursive: true }))
    );
}

// Функция для перемещения файла в соответствующую категорию
async function moveFile(filePath, categoryDir) {
    const fileName = path.basename(filePath);
    const targetPath = path.join(categoryDir, fileName);
    try {
        await fs.promises.rename(filePath, targetPath);
    } catch (err) {
        console.error(`Ошибка при перемещении файла ${fileName}:`, err);
    }
}

// Основная функция для сортировки файлов
async function sortFiles(directory, concurrencyLimit = os.cpus().length) {
    try {
        console.log(`Начало сортировки директории: ${directory}`);
        
        await ensureCategoryDirs(directory);

        const files = await fs.promises.readdir(directory);
        const filePaths = files.map(file => path.join(directory, file));

        let activeTasks = 0;
        const taskQueue = [];

        for (const filePath of filePaths) {
            const stat = await fs.promises.stat(filePath);
            if (!stat.isFile()) continue;

            const ext = path.extname(filePath).toLowerCase();
            const category = getCategory(ext);
            const categoryDir = path.join(directory, category);

            const task = moveFile(filePath, categoryDir);

            taskQueue.push(task);
            activeTasks++;

            if (activeTasks >= concurrencyLimit) {
                await Promise.all(taskQueue);
                taskQueue.length = 0;
                activeTasks = 0;
            }
        }

        await Promise.all(taskQueue); // Обработать оставшиеся задачи
        console.log('Сортировка завершена!');
    } catch (err) {
        console.error('Ошибка при сортировке файлов:', err);
    }
}

// Укажите путь к директории и уровень использования системы (количество параллельных операций)
const directoryPath = 'C:\\Users\\ВашеИмя\\Downloads'; // Замените на нужный путь
const concurrencyLimit = 4; // Настройте уровень производительности (по умолчанию количество ядер процессора)
sortFiles(directoryPath, concurrencyLimit);



ipcMain.on('set-load-level', async () => {
});

ipcMain.on('open-explorer', async () => {
    const downloadsPath = path.join('C:\\Users', os.userInfo().username, 'Downloads');
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'], defaultPath: downloadsPath });
    if (!result.canceled) win.webContents.send('set-path', result.filePaths[0]);
});

ipcMain.on('run-sort', async () => {

});

ipcMain.on('stop-sort', async () => {

});



app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
