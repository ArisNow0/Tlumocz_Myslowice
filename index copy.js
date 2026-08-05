const languages = [
  { code: 'auto', name: 'Auto' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polski' },
  { code: 'uk', name: 'Українська' }
];

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxrqEwuzbGOfkRF2HrOufmWdbMtFrdAbWCQvJvKsMYQh35sprnVycHWYdxTHJHCkhrd/exec';

const sourceLang = document.getElementById('sourceLang');
const sourceText = document.getElementById('sourceText');
const translateButton = document.getElementById('translateButton');
const copyButton = document.getElementById('copyButton');
const translatedText = document.getElementById('translatedText');
const swapButton = document.getElementById('swapButton');
const sourceLabel = document.getElementById('sourceLabel');
const targetLabel = document.getElementById('targetLabel');

let direction = 'forward';

function populateLanguageSelectors() {
  languages.forEach(({ code, name }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    sourceLang.append(option);
  });

  sourceLang.value = 'auto';
}

function setLoading(isLoading) {
  translateButton.textContent = isLoading ? 'Перевожу…' : 'Перевести';
  translateButton.disabled = isLoading;
  copyButton.disabled = isLoading;
}

function setDirection(newDirection) {
  direction = newDirection;
  const isReversed = direction === 'reverse';

  sourceLabel.textContent = isReversed ? 'Z Mysłowiöckiego' : 'Z jonzyka';
  targetLabel.textContent = isReversed ? 'Na wybrany język' : 'Na Mysłowiöckiego';
  swapButton.title = isReversed ? 'Переключить направление на прямой' : 'Переключить направление на обратный';
  
  if (isReversed) {
    sourceContent.append(targetLangBox);
    targetContent.append(sourceLang);
  } else {
    sourceContent.append(sourceLang);
    targetContent.append(targetLangBox);
  }
}

function inventedToPolish(text) {
  const exceptions = {
    'Mysłowiöce': 'Mysłowice'
  };

  const ALWAYS_REPLACEMENTS = {
    'ō`n': 'en',
    'ö`n': 'an',
    'Ō`n': 'En',
    'Ö`n': 'An'
  };

  const MIDDLE_ONLY_REPLACEMENTS = {
    'ōn': 'ę',
    'ön': 'ą',
    'Ōn': 'Ę',
    'Ön': 'Ą',
    'ō': 'e',
    'ö': 'a',
    'Ō': 'E',
    'Ö': 'A'
  };

  let result = text;

  for (const [word, replacement] of Object.entries(exceptions)) {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'g');
    result = result.replace(wordRegex, replacement);
  }

  result = result.replace(/(ō`n|ö`n|Ō`n|Ö`n)/g, (match) => {
    return ALWAYS_REPLACEMENTS[match] || match;
  });

  result = result.replace(/(ōn|ön|Ōn|Ön|[ōöŌÖ])(?=\p{L})/gu, (match) => {
    return MIDDLE_ONLY_REPLACEMENTS[match] || match;
  });

  return result;
}


function polishToInventedLanguage(text) {
  const exceptions = {
    'Mysłowice': 'Mysłowiöce'
  };

  const ALWAYS_REPLACEMENTS = {
    'en': 'ō`n',
    'an': 'ö`n',
    'En': 'Ō`n',
    'An': 'Ö`n'
  };

  const MIDDLE_ONLY_REPLACEMENTS = {
    'ę': 'ōn',
    'ą': 'ön',
    'e': 'ō',
    'a': 'ö',
    'Ę': 'Ōn',
    'Ą': 'Ön',
    'E': 'Ō',
    'A': 'Ö'
  };

  let result = text;

  for (const [word, replacement] of Object.entries(exceptions)) {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'g');
    result = result.replace(wordRegex, replacement);
  }

  result = result.replace(/(en|an|En|An)/g, (match) => {
    return ALWAYS_REPLACEMENTS[match] || match;
  });

  result = result.replace(/([eaęąEAĘĄ])(?=\p{L})/gu, (match) => {
    return MIDDLE_ONLY_REPLACEMENTS[match] || match;
  });

  return result;
}

function initializeModeButtons() {
  modeForwardButton.addEventListener('click', () => setDirection('forward'));
  modeReverseButton.addEventListener('click', () => setDirection('reverse'));
  setDirection('forward');
}

async function translate() {
  const text = sourceText.value.trim();
  if (!text) {
    translatedText.textContent = 'Введите текст для перевода.';
    return;
  }

  setLoading(true);
  translatedText.textContent = 'Zöłödunok…';

  try {
    console.log('Translating text:', text, 'Direction:', direction, 'Source language:', sourceLang.value);
    if (direction === 'forward') {
      let polishText = text;

      if (sourceLang.value !== 'pl') {
        const response = await fetch(GAS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang.value,
            target: 'pl'
          })
        });

        if (!response.ok) {
          throw new Error(`Сервер вернул ${response.status}`);
        }

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }

        polishText = result.translatedText || 'Tłumöczonie nie zostöło otrzymöne.';
      }

      translatedText.textContent = polishToInventedLanguage(polishText);
    } else {
      const polishText = inventedToPolish(text);
      if (sourceLang.value === 'pl') {
        translatedText.textContent = polishText;
        return;
      }
      else {
      console.log('Polish text for translation:', polishText);
      const targetLang = sourceLang.value === 'auto' ? 'ru' : sourceLang.value;

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          q: polishText,
          source: 'pl',
          target: targetLang
        })
      });

      if (!response.ok) {
        throw new Error(`Сервер вернул ${response.status}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      translatedText.textContent = result.translatedText || 'Перевод не получен.';
    }}
  } catch (error) {
    console.error(error);
    translatedText.textContent = 'Błond tłumöczonia. Spröwdź połonczonie intornotowe lub spróbuj ponownie późnioj.';
  } finally {
    setLoading(false);
  }
}

function copyResult() {
  const text = translatedText.textContent.trim();
  if (!text || text === 'Tłumöczonie pojöwi się tutöj.' || text === 'Błond tłumöczonia. Spröwdź połonczonie intornotowe lub spróbuj ponownie późnioj.') {
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    copyButton.textContent = 'Skopiowöno';
    setTimeout(() => {
      copyButton.textContent = 'Skopiuj wynik';
    }, 1800);
  }).catch(() => {
    copyButton.textContent = 'Błond kopiowönia';
    setTimeout(() => {
      copyButton.textContent = 'Skopiuj wynik';
    }, 1800);
  });
}

translateButton.addEventListener('click', translate);
copyButton.addEventListener('click', copyResult);
swapButton.addEventListener('click', () => {
  if (direction === 'forward') {
    setDirection('reverse');
  } else {
    setDirection('forward');
  }});

populateLanguageSelectors();