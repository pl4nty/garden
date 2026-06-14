import { createRequire } from 'module';

const require$1 = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x2) => typeof require$1 !== "undefined" ? require$1 : typeof Proxy !== "undefined" ? new Proxy(x2, {
  get: (a2, b2) => (typeof require$1 !== "undefined" ? require$1 : a2)[b2]
}) : x2)(function(x2) {
  if (typeof require$1 !== "undefined") return require$1.apply(this, arguments);
  throw Error('Dynamic require of "' + x2 + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));

// node_modules/reading-time/lib/reading-time.js
var require_reading_time = __commonJS({
  "node_modules/reading-time/lib/reading-time.js"(exports, module) {
    function codeIsInRanges(number, arrayOfRanges) {
      return arrayOfRanges.some(
        ([lowerBound, upperBound]) => lowerBound <= number && number <= upperBound
      );
    }
    function isCJK(c2) {
      if ("string" !== typeof c2) {
        return false;
      }
      const charCode = c2.charCodeAt(0);
      return codeIsInRanges(
        charCode,
        [
          // Hiragana (Katakana not included on purpose,
          // context: https://github.com/ngryman/reading-time/pull/35#issuecomment-853364526)
          // If you think Katakana should be included and have solid reasons, improvement is welcomed
          [12352, 12447],
          // CJK Unified ideographs
          [19968, 40959],
          // Hangul
          [44032, 55203],
          // CJK extensions
          [131072, 191456]
        ]
      );
    }
    function isAnsiWordBound(c2) {
      return " \n\r	".includes(c2);
    }
    function isPunctuation(c2) {
      if ("string" !== typeof c2) {
        return false;
      }
      const charCode = c2.charCodeAt(0);
      return codeIsInRanges(
        charCode,
        [
          [33, 47],
          [58, 64],
          [91, 96],
          [123, 126],
          // CJK Symbols and Punctuation
          [12288, 12351],
          // Full-width ASCII punctuation variants
          [65280, 65519]
        ]
      );
    }
    function readingTime2(text, options = {}) {
      let words = 0, start = 0, end = text.length - 1;
      const wordsPerMinute = options.wordsPerMinute || 200;
      const isWordBound = options.wordBound || isAnsiWordBound;
      while (isWordBound(text[start])) start++;
      while (isWordBound(text[end])) end--;
      const normalizedText = `${text}
`;
      for (let i2 = start; i2 <= end; i2++) {
        if (isCJK(normalizedText[i2]) || !isWordBound(normalizedText[i2]) && (isWordBound(normalizedText[i2 + 1]) || isCJK(normalizedText[i2 + 1]))) {
          words++;
        }
        if (isCJK(normalizedText[i2])) {
          while (i2 <= end && (isPunctuation(normalizedText[i2 + 1]) || isWordBound(normalizedText[i2 + 1]))) {
            i2++;
          }
        }
      }
      const minutes = words / wordsPerMinute;
      const time = Math.round(minutes * 60 * 1e3);
      const displayed = Math.ceil(minutes.toFixed(2));
      return {
        text: displayed + " min read",
        minutes,
        time,
        words
      };
    }
    module.exports = readingTime2;
  }
});

// node_modules/reading-time/lib/stream.js
var require_stream = __commonJS({
  "node_modules/reading-time/lib/stream.js"(exports, module) {
    var readingTime2 = require_reading_time();
    var Transform = __require("stream").Transform;
    var util = __require("util");
    function ReadingTimeStream(options) {
      if (!(this instanceof ReadingTimeStream)) {
        return new ReadingTimeStream(options);
      }
      Transform.call(this, { objectMode: true });
      this.options = options || {};
      this.stats = {
        minutes: 0,
        time: 0,
        words: 0
      };
    }
    util.inherits(ReadingTimeStream, Transform);
    ReadingTimeStream.prototype._transform = function(chunk, encoding, callback) {
      const stats = readingTime2(chunk.toString(encoding), this.options);
      this.stats.minutes += stats.minutes;
      this.stats.time += stats.time;
      this.stats.words += stats.words;
      callback();
    };
    ReadingTimeStream.prototype._flush = function(callback) {
      this.stats.text = Math.ceil(this.stats.minutes.toFixed(2)) + " min read";
      this.push(this.stats);
      callback();
    };
    module.exports = ReadingTimeStream;
  }
});

// node_modules/reading-time/index.js
var require_reading_time2 = __commonJS({
  "node_modules/reading-time/index.js"(exports, module) {
    module.exports.default = module.exports = require_reading_time();
    module.exports.readingTimeStream = require_stream();
  }
});

// src/components/ContentMeta.tsx
var import_reading_time = __toESM(require_reading_time2());

// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/i18n/locales/en-US.ts
var en_US_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => {
        if (minutes === 1) {
          return "1 min read";
        }
        return `${minutes} min read`;
      }
    }
  }
};

// src/i18n/locales/ar-SA.ts
var ar_SA_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => minutes == 1 ? `\u062F\u0642\u064A\u0642\u0629 \u0623\u0648 \u0623\u0642\u0644 \u0644\u0644\u0642\u0631\u0627\u0621\u0629` : minutes == 2 ? `\u062F\u0642\u064A\u0642\u062A\u0627\u0646 \u0644\u0644\u0642\u0631\u0627\u0621\u0629` : `${minutes} \u062F\u0642\u0627\u0626\u0642 \u0644\u0644\u0642\u0631\u0627\u0621\u0629`
    }
  }
};

// src/i18n/locales/ca-ES.ts
var ca_ES_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `Es llegeix en ${minutes} min`
    }
  }
};

// src/i18n/locales/cs-CZ.ts
var cs_CZ_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min \u010Dten\xED`
    }
  }
};

// src/i18n/locales/de-DE.ts
var de_DE_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} Min. Lesezeit`
    }
  }
};

// src/i18n/locales/en-GB.ts
var en_GB_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min read`
    }
  }
};

// src/i18n/locales/es-ES.ts
var es_ES_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `Se lee en ${minutes} min`
    }
  }
};

// src/i18n/locales/fa-IR.ts
var fa_IR_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `\u0632\u0645\u0627\u0646 \u062A\u0642\u0631\u06CC\u0628\u06CC \u0645\u0637\u0627\u0644\u0639\u0647: ${minutes} \u062F\u0642\u06CC\u0642\u0647`
    }
  }
};

// src/i18n/locales/fi-FI.ts
var fi_FI_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min lukuaika`
    }
  }
};

// src/i18n/locales/fr-FR.ts
var fr_FR_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min de lecture`
    }
  }
};

// src/i18n/locales/he-IL.ts
var he_IL_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} \u05D3\u05E7\u05D5\u05EA \u05E7\u05E8\u05D9\u05D0\u05D4`
    }
  }
};

// src/i18n/locales/hu-HU.ts
var hu_HU_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} perces olvas\xE1s`
    }
  }
};

// src/i18n/locales/id-ID.ts
var id_ID_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} menit baca`
    }
  }
};

// src/i18n/locales/it-IT.ts
var it_IT_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => minutes === 1 ? "1 minuto" : `${minutes} minuti`
    }
  }
};

// src/i18n/locales/ja-JP.ts
var ja_JP_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min read`
    }
  }
};

// src/i18n/locales/kk-KZ.ts
var kk_KZ_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} \u043C\u0438\u043D \u043E\u049B\u0443`
    }
  }
};

// src/i18n/locales/ko-KR.ts
var ko_KR_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min read`
    }
  }
};

// src/i18n/locales/lt-LT.ts
var lt_LT_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min skaitymo`
    }
  }
};

// src/i18n/locales/nb-NO.ts
var nb_NO_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min lesning`
    }
  }
};

// src/i18n/locales/nl-NL.ts
var nl_NL_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => minutes === 1 ? "1 minuut leestijd" : `${minutes} minuten leestijd`
    }
  }
};

// src/i18n/locales/pl-PL.ts
var pl_PL_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min. czytania `
    }
  }
};

// src/i18n/locales/pt-BR.ts
var pt_BR_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `Leitura de ${minutes} min`
    }
  }
};

// src/i18n/locales/ro-RO.ts
var ro_RO_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => minutes == 1 ? `lectur\u0103 de 1 minut` : `lectur\u0103 de ${minutes} minute`
    }
  }
};

// src/i18n/locales/ru-RU.ts
var ru_RU_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `\u0432\u0440\u0435\u043C\u044F \u0447\u0442\u0435\u043D\u0438\u044F ~${minutes} \u043C\u0438\u043D.`
    }
  }
};

// src/i18n/locales/th-TH.ts
var th_TH_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `\u0E2D\u0E48\u0E32\u0E19\u0E23\u0E32\u0E27 ${minutes} \u0E19\u0E32\u0E17\u0E35`
    }
  }
};

// src/i18n/locales/tr-TR.ts
var tr_TR_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} dakika okuma s\xFCresi`
    }
  }
};

// src/i18n/locales/uk-UA.ts
var uk_UA_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} \u0445\u0432 \u0447\u0438\u0442\u0430\u043D\u043D\u044F`
    }
  }
};

// src/i18n/locales/vi-VN.ts
var vi_VN_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} ph\xFAt \u0111\u1ECDc`
    }
  }
};

// src/i18n/locales/zh-CN.ts
var zh_CN_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes}\u5206\u949F\u9605\u8BFB`
    }
  }
};

// src/i18n/locales/zh-TW.ts
var zh_TW_default = {
  components: {
    contentMeta: {
      readingTime: ({ minutes }) => `\u95B1\u8B80\u6642\u9593\u7D04 ${minutes} \u5206\u9418`
    }
  }
};

// src/i18n/index.ts
var locales = {
  "en-US": en_US_default,
  "ar-SA": ar_SA_default,
  "ca-ES": ca_ES_default,
  "cs-CZ": cs_CZ_default,
  "de-DE": de_DE_default,
  "en-GB": en_GB_default,
  "es-ES": es_ES_default,
  "fa-IR": fa_IR_default,
  "fi-FI": fi_FI_default,
  "fr-FR": fr_FR_default,
  "he-IL": he_IL_default,
  "hu-HU": hu_HU_default,
  "id-ID": id_ID_default,
  "it-IT": it_IT_default,
  "ja-JP": ja_JP_default,
  "kk-KZ": kk_KZ_default,
  "ko-KR": ko_KR_default,
  "lt-LT": lt_LT_default,
  "nb-NO": nb_NO_default,
  "nl-NL": nl_NL_default,
  "pl-PL": pl_PL_default,
  "pt-BR": pt_BR_default,
  "ro-RO": ro_RO_default,
  "ru-RU": ru_RU_default,
  "th-TH": th_TH_default,
  "tr-TR": tr_TR_default,
  "uk-UA": uk_UA_default,
  "vi-VN": vi_VN_default,
  "zh-CN": zh_CN_default,
  "zh-TW": zh_TW_default
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}

// node_modules/@quartz-community/utils/dist/date.js
function formatDate(d2, locale = "en-US") {
  return d2.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

// node_modules/@quartz-community/utils/dist/sort.js
function getDate(data) {
  const defaultDateType = data.defaultDateType;
  if (!defaultDateType) {
    return void 0;
  }
  const dates = data.dates;
  return dates?.[defaultDateType];
}
var l;
l = { __e: function(n2, l2, u3, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/util/date.tsx
function DateComponent({ date, locale }) {
  return /* @__PURE__ */ u2("time", { datetime: date.toISOString(), children: formatDate(date, locale) });
}

// src/components/styles/contentMeta.scss
var contentMeta_default = '.content-meta {\n  margin-top: 0;\n  color: var(--darkgray);\n}\n.content-meta[show-comma=true] > *:not(:last-child) {\n  margin-right: 8px;\n}\n.content-meta[show-comma=true] > *:not(:last-child)::after {\n  content: ",";\n}';

// src/components/ContentMeta.tsx
var defaultOptions = {
  showReadingTime: true,
  showComma: true
};
var ContentMeta_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  function ContentMetadata({ cfg, fileData, displayClass }) {
    const text = fileData.text;
    if (text) {
      const segments = [];
      if (fileData.dates) {
        const locale = cfg.locale || "en-US";
        const defaultDateType = fileData.defaultDateType ?? cfg.defaultDateType;
        if (defaultDateType) {
          const dataWithDefaultDateType = {
            ...fileData,
            defaultDateType
          };
          const date = getDate(dataWithDefaultDateType);
          if (date) {
            segments.push(/* @__PURE__ */ u2(DateComponent, { date, locale }));
          }
        }
      }
      if (options.showReadingTime) {
        const { minutes, words: _words } = (0, import_reading_time.default)(text);
        const locale = cfg.locale || "en-US";
        const i18nData = i18n(locale);
        const displayedTime = i18nData.components.contentMeta.readingTime({
          minutes: Math.ceil(minutes)
        });
        segments.push(/* @__PURE__ */ u2("span", { children: displayedTime }));
      }
      if (fileData.filePath) {
        segments.push(
          /* @__PURE__ */ u2(
            "a",
            {
              href: `https://github.com/pl4nty/garden/commits/main/${fileData.filePath}`,
              target: "_blank",
              rel: "noopener noreferrer",
              children: "history"
            }
          )
        );
      }
      return /* @__PURE__ */ u2("p", { "show-comma": options.showComma, class: classNames(displayClass, "content-meta"), children: segments });
    } else {
      return null;
    }
  }
  ContentMetadata.css = contentMeta_default;
  return ContentMetadata;
});
/*! Bundled license information:

reading-time/lib/reading-time.js:
reading-time/lib/stream.js:
  (*!
   * reading-time
   * Copyright (c) Nicolas Gryman <ngryman@gmail.com>
   * MIT Licensed
   *)
*/

export { ContentMeta_default as ContentMeta };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map