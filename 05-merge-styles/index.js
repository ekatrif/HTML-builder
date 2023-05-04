// Импорт всех требуемых модулей
const fs = require('fs');
const path = require('path');
// Чтение содержимого папки styles
const pathToFolder = path.join(__dirname, 'styles');

// Массив для записи данных из файлов стилей
const stylesArray = [];

const writeToFile = () => {
  // Создать новый файл
  const pathToDeploy = path.join(__dirname, 'project-dist');
  // Запись в файл
  fs.writeFile(
    path.join(pathToDeploy, 'bundle.css'),
    '',
    (err) => {
        if (err) throw err;
    }
  );
  // Запись массива стилей в файл bundle.css
  stylesArray.forEach(item => {
    fs.appendFile(
      path.join(pathToDeploy, 'bundle.css'),
      item,
      (err) => {
        if (err) throw err;
      }    
      )
  })
  console.log('Файл перезаписан')
}

async function fileExists(path) {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

async function getBundle() {
  try {
    // Очистка bundle.css
    const pathToDeploy = path.join(__dirname, 'project-dist');
    const pathToBundle = path.join(pathToDeploy, 'bundle.css');
    const bundleExists = await fileExists(pathToBundle);
    if (bundleExists) {
      fs.truncate(pathToBundle, err => {
        if(err) throw err;
        console.log('Файл успешно очищен');
      });
    }
    // Получение данных о каждом объекте который содержит папка styles
    const styles = await fs.promises.readdir(pathToFolder, { withFileTypes: true });
    // Запись данных в массив
    for (const style of styles) {
      // Проверка является ли объект файлом и имеет ли файл нужное расширение
      if (style.isFile()) {
        // Получим расширение файла
        const extName = path.extname(style.name).slice(1);
        if (extName === 'css') {
          // Чтение файла стилей
          const pathToFile = path.join(pathToFolder, style.name);
          const readableStream = fs.createReadStream(pathToFile, 'utf-8');
          // Запись прочитанных данных в массив
          readableStream.on('data', chunk => stylesArray.push(chunk));
          readableStream.on('end', () => {
            // Данные были полностью прочитаны
            // Запись данных в файл bundle.css
            writeToFile();
          });
        }
      }
    }
  } catch (err) {
    throw err;
  }
}

getBundle();