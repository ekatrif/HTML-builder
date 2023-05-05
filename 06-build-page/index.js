// Импорт всех требуемых модулей
const fs = require('fs');
const path = require('path');

// Поиск подстроки, содержащий {{content}}
const findTemplateComponent = (arr) => {
    let result = [];
    arr.forEach((element) => {
      const regex = /{{(.*?)}}/g;
      let match;
      while ((match = regex.exec(element))) {
        result.push(match[1].replace(/[{}]/g, ''));
      }
    });
    return result;
}

// Замена {{tag}} на контент из файла
const insertTagContent = (arr, str1, str2) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].includes(str1)) {
      arr[i] = arr[i].replace(str1, str2);
    }
  }
}

// Создание css bundle
async function createBundle (source, target) {
  // Массив для записи данных из файлов стилей
  const stylesArray = [];

  async function writeToFile() {
    // Создать новый файл
    // Запись в файл
    await fs.promises.writeFile(
      path.join(target, 'style.css'),
      '');
    // Запись массива стилей в файл style.css
    stylesArray.forEach(item => {
      fs.appendFile(
        path.join(target, 'style.css'),
        item,
        (err) => {
          if (err) throw err;
        }    
        )
    })
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
      const pathToBundle = path.join(target, 'style.css');
      const bundleExists = await fileExists(pathToBundle);
      if (bundleExists) {
        fs.truncate(pathToBundle, err => {
          if(err) throw err;
        });
      }
      // Получение данных о каждом объекте который содержит папка styles
      const styles = await fs.promises.readdir(source, { withFileTypes: true });
      // Запись данных в массив
      for (const style of styles) {
        // Проверка является ли объект файлом и имеет ли файл нужное расширение
        if (style.isFile()) {
          // Получим расширение файла
          const extName = path.extname(style.name).slice(1);
          if (extName === 'css') {
            // Чтение файла стилей
            const pathToFile = path.join(source, style.name);
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
}

// Копирование файлов
async function copyFolder(source, target) {
    // Создаем целевую папку, если ее еще нет
    await fs.promises.mkdir(target, { recursive: true });

    // Получаем список файлов и папок в исходной папке
    const files = await fs.promises.readdir(source);
  
    // Копируем каждый файл или папку в целевую папку
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
  
      const fileStat = await fs.promises.stat(sourcePath);
  
      if (fileStat.isDirectory()) {
        // Если это папка, вызываем функцию рекурсивно для копирования ее содержимого
        await copyFolder(sourcePath, targetPath);
      } else {
        // Если это файл, копируем его в целевую папку
        await fs.promises.copyFile(sourcePath, targetPath);
      }
    }
}

async function buildPage() {
  // Прочтение и сохранение в переменной файла-шаблона
  const templateContent = [];

  // Создаем папку project-dist, если ее еще нет
  fs.mkdir(path.join(__dirname, 'project-dist'), { recursive: true }, (error) => {
    if (error) {
      console.error(error);
    }
  });

  const templatePath = path.join(__dirname, 'template.html');
  // Cоздаем поток для чтения файла
  const readableStream = fs.createReadStream(templatePath, 'utf-8');
  // Запись прочитанных данных в массив
  readableStream.on('data', chunk => templateContent.push(chunk));
  readableStream.on('end', () => {
    // Данные были полностью прочитаны
    // Нахождение всех имён тегов в файле шаблона
    const tags = findTemplateComponent(templateContent);
    // Замена шаблонных тегов содержимым файлов-компонентов
    const changedContent = [];
    tags.forEach(async tag => {
      // Путь к файлу с содердимым тега
      const filePath = path.join(__dirname, 'components', `${tag}.html`);
    
      try {
        const tagContent = await fs.promises.readFile(filePath, 'utf-8');
        insertTagContent(templateContent, `{{${tag}}}`, tagContent);
    
        const allProcessed = tags.every(async tag => {
          const newFilePath = path.join(__dirname, 'components', `${tag}.html`);
          const compareContent = await fs.promises.readFile(newFilePath, 'utf8');
          return compareContent.trim() === tagContent.trim();
        })
    
        if (await allProcessed) {
          const distPath = path.join(__dirname, 'project-dist');
          await fs.promises.writeFile(
            path.join(distPath, 'index.html'),
            templateContent.join(""),
          );
        }
      } catch (error) {
        console.error(error);
      }
    })
    
  });

  // Использовать скрипт написанный в задании 05-merge-styles для создания файла style.css
  sourceStyleFolder = path.join(__dirname, 'styles');
  targetStyleFolder = path.join(__dirname, 'project-dist');
  console.log(sourceStyleFolder,targetStyleFolder)
  createBundle(sourceStyleFolder, targetStyleFolder);

  // Использовать скрипт из задания 04-copy-directory для переноса папки assets в папку project-dist
  sourceFolder = path.join(__dirname, 'assets');
  targetFolder = path.join(__dirname, 'project-dist','assets');
  copyFolder(sourceFolder, targetFolder);
}

buildPage();
