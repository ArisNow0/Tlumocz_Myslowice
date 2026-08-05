const fs = require('fs');
const path = require('path');

// Вспомогательная функция для безопасной записи по первой букве
function splitFileByLetter(inputFile, targetSubfolder) {
  if (!fs.existsSync(inputFile)) {
    console.log(`⚠️ Файл ${inputFile} не найден, пропускаем.`);
    return;
  }

  console.log(`⏳ Обработка ${inputFile}...`);
  const rawData = fs.readFileSync(inputFile, 'utf-8');
  const words = JSON.parse(rawData);

  // Словарь для группировки: { 'a': Set([...]), 'b': Set([...]) }
  const grouped = {};

  for (const item of words) {
    if (!item) continue;

    // Очищаем слово от лишних пробелов и приводим к нижнему регистру
    const word = String(item).trim().toLowerCase();
    if (!word) continue;

    // Берём первую букву
    const firstChar = word[0];

    // Нормализуем первую букву (для валидного имени файла)
    // Если первая буква не латинская/польская буквенная, отправляем в 'other.json'
    const letterKey = /^\p{L}$/u.test(firstChar) ? firstChar : 'other';

    if (!grouped[letterKey]) {
      grouped[letterKey] = new Set();
    }
    grouped[letterKey].add(word);
  }

  // Создаем папку назначения (например: words/slowa или words/odm)
  const outputDir = path.join(__dirname, 'words', targetSubfolder);
  fs.mkdirSync(outputDir, { recursive: true });

  // Записываем каждый буквенный файл
  let totalSaved = 0;
  for (const [letter, wordSet] of Object.entries(grouped)) {
    const filePath = path.join(outputDir, `${letter}.json`);
    const wordList = Array.from(wordSet).sort();
    
    fs.writeFileSync(filePath, JSON.stringify(wordList));
    totalSaved += wordList.length;
  }

  console.log(`✅ ${inputFile} успешно разбит! Сохранено слов: ${totalSaved} в папку "words/${targetSubfolder}"`);
}

function main() {
  // Вызываем функцию для обоих ваших файлов
  // (если файл называется obm.json, указываем его, если odm.json - тоже подхватит)
  const odmFile = fs.existsSync('obm.json') ? 'obm.json' : 'odm.json';

  splitFileByLetter('slowa.json', 'slowa');
  splitFileByLetter(odmFile, 'odm');
}

main();