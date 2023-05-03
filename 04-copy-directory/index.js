// Импорт всех требуемых модулей
const fs = require('fs');
const path = require('path');

// Проверка существует ли папка, в которую нужно копировать
async function isFolderExist(path) {
  try {
    await fs.promises.stat(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    } else {
      throw error;
    }
  }
}

// Удаление папки copy-files, если она существует
async function deleteFolderRecursive(folderPath) {
  console.log(folderPath)
  try {
    const files = await fs.promises.readdir(folderPath, err => {
      throw new Error(err);
    })
    for (const file of files) {
      const curPath = path.join(folderPath, file);
      const stats = await fs.promises.stat(curPath);
      if (stats.isDirectory()) {
        await deleteFolderRecursive(curPath);
      } else {
        await fs.promises.unlink(curPath);
      }
    }
    await fs.promises.rmdir(folderPath);
  } catch (error) {
    throw error;
  }
}

// Копирование файлов
async function copyDir() {
  try {
    // Пути к папкам, из которой копируются файлы и в которую копируются файлы
    const pathToFolder = path.join(__dirname, 'files');
    const pathToCopyFolder = path.join(__dirname, 'files-copy');
    // Проверка, существует ли папка /files-copy
    const folderExist = await isFolderExist(pathToCopyFolder);
    if (folderExist) {
      // Если существует, удаляем папку с файлами
      const deleteFolder = await deleteFolderRecursive(pathToCopyFolder);
    }
    // Создание папки files-copy в случае если она ещё не существует
    const createDir = await fs.promises.mkdir(pathToCopyFolder, { recursive: true });
    // Чтение содержимого папки files
    const files = await fs.promises.readdir(pathToFolder, { withFileTypes: true });
    for (const file of files) {
      //Выбираем только файлы
      if (file.isFile()) {
        const pathToFile = path.join(pathToFolder, file.name);
        const pathToCopyFile = path.join(pathToCopyFolder, file.name);
        // Копирование файлов из папки files в папку files-copy
        fs.copyFile(pathToFile, pathToCopyFile, (err) => {
          if (err) {
            throw new Error(err);
          }
        });
      }
    }
  } catch (err) {
    throw new Error(err);
  } 
}

copyDir();