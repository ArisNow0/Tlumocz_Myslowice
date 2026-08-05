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

const translations = {
  mw: {
    title: "Tłumöcz Mysłowiöcki",
    subtitle: "Oficjölny tłumöcz Wolnōgo Miösta Mysłowiöce",
    fromLang: "Z jōnzyka",
    toMs: "Na jōnzyk myślowicki",
    fromMs: "Z myślowickiōgo",
    ToLang: "Na jōnzyk",
    sourcePlaceholder: "Wpisz tōkst do tłumöczōnia...",
    translateBtn: "Tłumöcz",
    copyBtn: "Kopiuj wynik",
    translateLoading: "Tłumöczę…",
    resultLabel: "Wynik tłumöczōnia",
    resultPlaceholder: "Tłumöczōnie pojöwi się tutöj.",
    resultPlaceLoad: "Zöłödunōk…"
  },
  pl: {
    title: "Tłumacz Mysłowicki",
    subtitle: "Oficjalny Tłumacz Wolnego Miasta Mysłowice",
    fromLang: "Z języka",
    toMs: "Na język myślowicki",
    fromMs: "Z myślowickiego",
    ToLang: "Na język",
    sourcePlaceholder: "Wpisz tekst do tłumaczenia...",
    translateBtn: "Tłumacz",
    copyBtn: "Kopiuj wynik",
    translateLoading: "Tłumaczę…",
    resultLabel: "Wynik tłumaczenia",
    resultPlaceholder: "Tłumaczenie pojawi się tutaj.",
    resultPlaceLoad: "Załadunek…"
  },
  ua: {
    title: "Перекладач Мисловіце",
    subtitle: "Офіційний перекладач Вільного Міста Мисловіце",
    fromLang: "С мови",
    toMs: "На мисловіцьку",
    fromMs: "З мисловіцької",
    ToLang: "На мову",
    sourcePlaceholder: "Введіть текст для перекладу...",
    translateBtn: "Перекласти",
    copyBtn: "Копіювати результат",
    resultLabel: "Результат перекладу",
    translateLoading: "Перекладаю…",
    resultPlaceholder: "Переклад з'явиться тут.",
    resultPlaceLoad: "Завантаження…"
  },
  en: {
    title: "Myslowitze Translator",
    subtitle: "Official Translator of the Free City of Myslowitze",
    fromLang: "From Language",
    toMs: "To Myslowitze",
    fromMs: "From Myslowitze",
    ToLang: "To Language",
    sourcePlaceholder: "Enter text to translate...",
    translateBtn: "Translate",
    translateLoading: "Translating…",
    copyBtn: "Copy Result",
    resultLabel: "Translation Result",
    resultPlaceholder: "Translation will appear here.",
    resultPlaceLoad: "Loading…"
  },
  ru: {
    title: "Переводчик Мысловице",
    subtitle: "Официальный переводчик Свободного Города Мысловице",
    fromLang: "С языка",
    toMs: "На мысловицкий",
    fromMs: "С мысловицкого",
    ToLang: "На язык",
    sourcePlaceholder: "Введите текст для перевода...",
    translateBtn: "Перевести",
    translateLoading: "Перевожу…",
    copyBtn: "Копировать результат",
    resultLabel: "Результат перевода",
    resultPlaceholder: "Перевод появится здесь.",
    resultPlaceLoad: "Загрузка…"
  }
};

const GAS_URL = 'https://script.google.com/macros/s/AKfycbziUHYpo3VOsmWDh7HQeNJRaENXNDUZ396Ez4q8Q9X0TZEODO7oQ_xwDwTQkbptcXA2/exec';

const sourceLang = document.getElementById('sourceLang');
const sourceText = document.getElementById('sourceText');
const translateButton = document.getElementById('translateButton');
const copyButton = document.getElementById('copyButton');
const translatedText = document.getElementById('translatedText');
const swapButton = document.getElementById('swapButton');
const sourceLabel = document.getElementById('sourceLabel');
const targetLabel = document.getElementById('targetLabel');
const langSwitcher = document.querySelector('.lang-switcher');
const langFlag = document.querySelectorAll('.lang-option');
const langOptions = document.querySelector('.lang-options');
const langcur = document.getElementById('langcur');
const logo = document.getElementById('logo');

let direction = 'forward';
let currentLanguage = null;

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
    translateButton.textContent = isLoading ? translations[currentLanguage].translateLoading : translations[currentLanguage].translateBtn;
    translateButton.disabled = isLoading;
    copyButton.disabled = isLoading;
}

function setDirection(newDirection) {
    direction = newDirection;
    const isReversed = direction === 'reverse';


sourceLabel.textContent = isReversed
  ? (translations[currentLanguage].fromMs)
  : (translations[currentLanguage].fromLang);

    targetLabel.textContent = !isReversed
  ? (translations[currentLanguage].toMs)
  : (translations[currentLanguage].ToLang);
    swapButton.title = isReversed ? 'Zmiōń kiōrunōk na prosty' : 'Zmiōń kiōrunōk na wstōczny';

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
  'Mysłowiöce': 'Mysłowice',
  'Mysłowiöc': 'Mysłowic',
  'Mysłowiöcom': 'Mysłowicom',
  'Mysłowiöcami': 'Mysłowicami',
  'Mysłowiöcach': 'Mysłowicach',
  'Mysłowiöcki': 'Mysłowicki'
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
    'Mysłowice': 'Mysłowiöce',
    'Mysłowic': 'Mysłowiöc',
    'Mysłowicom': 'Mysłowiöcom',
    'Mysłowice': 'Mysłowiöce',
    'Mysłowicami': 'Mysłowiöcami',
    'Mysłowicach': 'Mysłowiöcach',
    'Mysłowicki': 'Mysłowiöcki'
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
        translatedText.textContent = translations[currentLanguage].sourcePlaceholder;
        return;
    }

    setLoading(true);
    translatedText.textContent = translations[currentLanguage].resultPlaceLoad;

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

async function getlang() {
    const savedLang = localStorage.getItem('user_language');
    if (savedLang) {
        return savedLang;
    }

    const userLangs = navigator.languages || [navigator.language || navigator.userLanguage];
    const supportedLangs = ['ua', 'ru', 'pl', 'en'];

    for (const lang of userLangs) {
        const code = lang.toLowerCase().slice(0, 2);

        if (code === 'uk' || code === 'ua') {
            return 'ua';
        }

        if (supportedLangs.includes(code)) {
            return code;
        }
    }

    return 'mw';
}

function setCurrentLanguage(lang) {
    if (langOptions) {
        langOptions.classList.add('hidden');
    }
 
    if (langcur) {
        langcur.src = lang === 'mw' ? 'flag.jpg' :
            lang === 'ua' ? 'ua.png' :
            lang === 'ru' ? 'ZOv.jpg' :
            lang === 'pl' ? 'pl.png' :
            lang === 'en' ? 'en.png' : '';
    }

    currentLanguage = lang;
    
    localStorage.setItem('user_language', lang);
    
    switchLanguage(lang);
}

function switchLanguage(lang) {
    const dict = translations[lang] || translations.mw;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    const sourceText = document.getElementById('sourceText');
    if (sourceText && dict.sourcePlaceholder) {
        sourceText.placeholder = dict.sourcePlaceholder;
    }

    const translatedText = document.getElementById('translatedText');
    if (translatedText) {
        const isPlaceholder = Object.values(translations).some(t => t.resultPlaceholder === translatedText.textContent);
        if (!translatedText.textContent.trim() || isPlaceholder) {
            translatedText.textContent = dict.resultPlaceholder;
        }
    }

    document.documentElement.lang = lang === 'mw' ? 'pl' : lang;

    if (typeof setDirection === 'function') {
        setDirection(direction);
    }
}

translateButton.addEventListener('click', translate);
copyButton.addEventListener('click', copyResult);
logo.addEventListener('click', () => {const sound = new Audio('./nya.mp3'); sound.play();});
swapButton.addEventListener('click', () => {
    if (direction === 'forward') {
        setDirection('reverse');
    } else {
        setDirection('forward');
    }
});

langFlag.forEach(flag => {
    flag.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const selectedLang = flag.getAttribute('data-lang');
        setCurrentLanguage(selectedLang);
    });
});
langSwitcher.addEventListener('click', () => {
    langOptions.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
  if (!langSwitcher.contains(e.target)) {
    langOptions.classList.add('hidden');
  }
});
populateLanguageSelectors();
getlang().then(lang => {
    currentLanguage = lang;
    setCurrentLanguage(currentLanguage);
});