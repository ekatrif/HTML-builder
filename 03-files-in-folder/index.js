// Импорт всех требуемых модулей
const fs = require('fs');
const path = require('path');

// Путь к папке
const pathToFolder = path.join(__dirname, 'secret-folder');

// Получить размер файла
async function getFileSize(pathToFile) {
  try {
    const stats = await fs.promises.stat(pathToFile);
    return stats.size;
  } catch (error) {
    throw error;
  }
}

// Получение и вывод информации о файлах
async function logFiles() {
try {
  // Получение данных о каждом объекте который содержит папка secret-folder
  const files = await fs.promises.readdir(pathToFolder, { withFileTypes: true });
  for (const file of files) {
    //Выбираем только файлы
    if (file.isFile()) {
      // Получим имя файла
      const fileName = file.name.split(".")[0];
      // Получим расширение файла
      const extName = path.extname(file.name).slice(1);
      // Получим размер файла
      const pathToFile = path.join(pathToFolder, file.name);
      const fileSize = await getFileSize(pathToFile);
      // Соберем шаблон вывода информации
      const output = `${fileName} - ${extName} - ${fileSize/1000}kb`
      console.log(output);
    }
  }
} catch (err) {
  throw err;
}
}
// Запуск основной функции получения и вывода информации о файлах
logFiles();