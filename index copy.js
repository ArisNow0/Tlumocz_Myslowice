const languages = [{
        code: 'auto',
        name: 'Auto'
    },
    {
        code: 'ru',
        name: 'Русский'
    },
    {
        code: 'en',
        name: 'English'
    },
    {
        code: 'pl',
        name: 'Polski'
    },
    {
        code: 'uk',
        name: 'Українська'
    }
];

const GAS_URL = 'https://script.google.com/macros/s/AKfycbziUHYpo3VOsmWDh7HQeNJRaENXNDUZ396Ez4q8Q9X0TZEODO7oQ_xwDwTQkbptcXA2/exec';

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
    languages.forEach(({
        code,
        name
    }) => {
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
        if (sourceLang.value === 'auto') sourceLang.value = 'en';
        sourceLang.children[0].style.display = 'none';
    } else {
        sourceLang.children[0].style.display = 'block';
        sourceContent.append(sourceLang);
        targetContent.append(targetLangBox);
    }
}

async function loadLetterDictionary(letter, category = 'slowa') {
    try {
        const response = await fetch(`./words/${category}/${letter.toLowerCase()}.json`);
        if (!response.ok) return new Set();
        const data = await response.json();
        return new Set(data);
    } catch (e) {
        return new Set();
    }
}

const dictionaryCache = {};

async function getLetterSet(letter, category = 'slowa') {
    const key = `${category}_${letter.toLowerCase()}`;
    if (!dictionaryCache[key]) {
        dictionaryCache[key] = await loadLetterDictionary(letter, category);
    }
    return dictionaryCache[key];
}

function generatePolishCandidates(word) {

    if (word.length === 2 || ['ōn', 'ön', 'ōn', 'ön'].includes(word.toLowerCase())) {
        return [word];
    }

    const rules = [{
            target: 'Ōn',
            replacements: ['En', 'Ę']
        },
        {
            target: 'Ön',
            replacements: ['An', 'Ą']
        },
        {
            target: 'ōn',
            replacements: ['en', 'ę']
        },
        {
            target: 'ön',
            replacements: ['an', 'ą']
        },
        {
            target: 'Ō',
            replacements: ['E']
        },
        {
            target: 'Ö',
            replacements: ['A']
        },
        {
            target: 'ō',
            replacements: ['e']
        },
        {
            target: 'ö',
            replacements: ['a']
        }
    ];

    let candidates = [word];

    for (const rule of rules) {
        const nextCandidates = [];
        for (const cand of candidates) {
            if (cand.includes(rule.target)) {
                for (const repl of rule.replacements) {
                    nextCandidates.push(cand.replaceAll(rule.target, repl));
                }
            } else {
                nextCandidates.push(cand);
            }
        }
        candidates = [...new Set(nextCandidates)];
    }

    return candidates;
}


async function inventedToPolish(text) {
    const exceptions = {
        'Mysłowiöce': 'Mysłowice'
    };

    let processedText = text;
    for (const [word, replacement] of Object.entries(exceptions)) {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'g');
        processedText = processedText.replace(wordRegex, replacement);
    }

    const tokens = processedText.split(/(\s+|[^\p{L}]+)/u);

    const translatedTokens = await Promise.all(tokens.map(async (token) => {
        if (!/^\p{L}+$/u.test(token)) return token;

        const candidates = generatePolishCandidates(token);

        if (candidates.length === 1) return candidates[0];

        const firstLetters = [...new Set(candidates.map(c => c[0].toLowerCase()))];

        const sets = await Promise.all(
            firstLetters.flatMap(l => [getLetterSet(l, 'slowa'), getLetterSet(l, 'odm')])
        );

        for (const cand of candidates) {
            const lowerCand = cand.toLowerCase();
            const hasMatch = sets.some(dictSet => dictSet.has(lowerCand));
            if (hasMatch) {
                return cand;
            }
        }
        return candidates[0];
    }));

    return translatedTokens.join('');
}


function initializeModeButtons() {
    modeForwardButton.addEventListener('click', () => setDirection('forward'));
    modeReverseButton.addEventListener('click', () => setDirection('reverse'));
    setDirection('forward');
}

function polishToInventedLanguage(text) {
  const exceptions = {
    'Mysłowice': 'Mysłowiöce'
  };

  const ALWAYS_REPLACEMENTS = {
    'en': 'ōn',
    'an': 'ön',
    'En': 'Ōn',
    'An': 'Ön'
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

  result = result.replace(/([eaęąEAĘĄ])(?=\p{L})/gu, (match) => {
    return MIDDLE_ONLY_REPLACEMENTS[match] || match;
  });

  result = result.replace(/(en|an|En|An)/g, (match) => {
    return ALWAYS_REPLACEMENTS[match] || match;
  });

  return result;
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
            const polishText = await inventedToPolish(text);

            if (sourceLang.value === 'pl') {
                translatedText.textContent = polishText;
                console.log('Polish text for translation:', polishText);
                return;
            } else {

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
            }
        }
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
    }
});

populateLanguageSelectors();