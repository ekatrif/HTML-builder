const { stdin, stdout } = process;
const fs = require('fs');
const path = require('path');

// Вывести приветствие
stdout.write('Приветствую!\nВведите текст для записи в файл. По окончании нажмите Enter\n');
// Создать новый файл
fs.writeFile(
  path.join(__dirname, 'input.txt'),
  '',
  (err) => {
      if (err) throw err;
  }
);
// Ожидание ввода от пользователя
stdin.on('data', data => {
  // Запись в файл
    const dataStringified = data.toString();
    // Завершить процесс, если введено слово exit
    if (dataStringified.toLowerCase().includes('exit')) {
      process.exit();
    }
    fs.appendFile(
      path.join(__dirname, 'input.txt'),
      data,
      (err) => {
        if (err) throw err;
        // При сочетании клавиш ctrl+c
        process.on('SIGINT', () => process.exit());
      }    
      )
});
// При завершении процесса вывести приветствие
process.on('exit', () => stdout.write('\nХорошего дня!'));
