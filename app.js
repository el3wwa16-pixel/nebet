/* ============ SETTINGS: put your YouTube video IDs here ============
   Example: for https://www.youtube.com/watch?v=ABC123xyz  the id is "ABC123xyz".
   If id is empty, the card opens YouTube search results for that recipe. */
const VIDEOS = [
  { id: "", q: "طريقة عمل الكشري المصري", img: "vid-1",
    ar: { title: "سر الكشري المصري زي المحلات", desc: "خطوات الكشري الأصيل مع الصلصة والدقة والبصل المقرمش." },
    en: { title: "Restaurant-Style Egyptian Koshary", desc: "Authentic koshary with tomato sauce, daqqa and crispy onions." } },
  { id: "", q: "طريقة عمل الملوخية بالتقلية", img: "vid-2",
    ar: { title: "الملوخية بالتقلية والشهقة", desc: "أسرار الملوخية الخضرا وإزاي تعمل التقلية مظبوطة." },
    en: { title: "Molokhia with Taqliya", desc: "Secrets of green molokhia and the perfect garlic sizzle." } },
  { id: "", q: "طريقة تدميس الفول في البيت", img: "vid-3",
    ar: { title: "تدميس الفول في البيت", desc: "إزاي تدمّس الفول في البيت ويطلع زبدة بلون فاتح." },
    en: { title: "Slow-Cooking Ful at Home", desc: "How to slow-cook fava beans until creamy and light." } }
];

/* Your name or team, shown in "About the Project". Leave empty to hide. */
const ABOUT_AUTHOR = { ar: "", en: "" };

/* ============ HELPERS ============ */
let lang = 'ar';
const EDIT = (() => {
  const on = new URLSearchParams(location.search).has('edit') || location.hash === '#edit';
  try { if (on) sessionStorage.setItem('editMode', '1'); return on || sessionStorage.getItem('editMode') === '1'; } catch (e) { return on; }
})();
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};
const T = (ar, en) => lang === 'ar' ? ar : en;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = (q, u, ar, en) => ({ q, u, ar, en });

const UNITS = {
  cup: ["كوب", "cup", "cups"], tbsp: ["ملعقة كبيرة", "tbsp", "tbsp"], tsp: ["ملعقة صغيرة", "tsp", "tsp"],
  g: ["جم", "g", "g"], kg: ["كجم", "kg", "kg"], clove: ["فص", "clove", "cloves"],
  loaf: ["رغيف", "loaf", "loaves"], l: ["لتر", "L", "L"], pc: ["", "", ""]
};
function fmtQ(q) {
  if (q >= 10) return String(Math.round(q));
  const w = Math.floor(q), f = q - w;
  const fr = [[0, ''], [0.25, '¼'], [0.333, '⅓'], [0.5, '½'], [0.667, '⅔'], [0.75, '¾'], [1, '']];
  let best = fr[0];
  for (const x of fr) if (Math.abs(x[0] - f) < Math.abs(best[0] - f)) best = x;
  const whole = w + (best[0] === 1 ? 1 : 0);
  return (whole ? whole : '') + best[1] || '¼';
}
function ingText(i, factor) {
  const name = i[lang];
  if (i.q == null) return name + T(" (حسب الرغبة)", " (to taste)");
  const q = i.q * factor, u = UNITS[i.u || 'pc'];
  const unit = lang === 'ar' ? u[0] : (q > 1 ? u[2] : u[1]);
  return (fmtQ(q) + ' ' + unit + ' ' + name).replace(/\s+/g, ' ');
}
function fmtTime(m) {
  if (m < 60) return T(m + " د", m + " min");
  const h = Math.floor(m / 60), r = m % 60;
  return r ? T(h + " س " + r + " د", h + "h " + r + "m") : T(h + " ساعة", h + "h");
}
const DIFF = { ar: ["سهل", "متوسط", "صعب"], en: ["Easy", "Medium", "Hard"] };

const CATS = {
  rare: { ar: "وصفات نادرة", en: "Rare recipes", icon: "fa-gem" },
  pharaonic: { ar: "العصر الفرعوني", en: "Pharaonic Era", icon: "fa-ankh" },
  greco: { ar: "العصر اليوناني والروماني", en: "Greco-Roman Era", icon: "fa-landmark" },
  islamic: { ar: "العصور الإسلامية والوسطى", en: "Islamic & Middle Ages", icon: "fa-mosque" },
  modern: { ar: "المطبخ المعاصر", en: "Contemporary Cuisine", icon: "fa-utensils" },
  dessert: { ar: "الحلويات", en: "Desserts", icon: "fa-cookie-bite" },
  drink: { ar: "المشروبات", en: "Drinks", icon: "fa-mug-hot" }
};

/* ============ RECIPES ============ */
const R = {
  shalwlw: { cat: "rare", time: 15, diff: 0, veg: true, serves: 4, icon: "fa-bowl-food", tm: [0, 0, 0, 10],
    ing: [I(1, "cup", "ملوخية ناشفة مطحونة", "dried ground molokhia"), I(3, "cup", "مية ساقعة", "cold water"), I(4, "clove", "ثوم مهروس", "crushed garlic"), I(1, "pc", "بصلة صغيرة مفرومة", "small onion, minced"), I(1, "pc", "ليمونة (عصيرها)", "lemon, juiced"), I(1, "pc", "شطة خضرا (اختياري)", "green chili (optional)"), I(null, null, "ملح وكمون", "salt and cumin")],
    ar: { title: "الشلولو الصعيدي", era: "تراث الصعيد", short: "حساء بارد من الصعيد ما بيدخلش النار خالص!", story: "طبق بارد من الصعيد بيتعمل من غير نار، من الملوخية الناشفة والثوم والليمون. بيتاكل في عز الحر مع العيش الشمسي.",
      steps: ["اهرس الثوم مع الملح والكمون والبصل والشطة.", "ضيف الملوخية الناشفة وقلّب.", "ضيف المية الساقعة تدريجياً مع الخفق السريع لحد ما يتجانس.", "ضيف الليمون وسيبه في التلاجة شوية قبل التقديم مع العيش الشمسي."] },
    en: { title: "Saidi Shalawlaw", era: "Upper Egypt Heritage", short: "A cold Upper Egyptian soup that never touches a flame!", story: "A cold dish from Upper Egypt made without any cooking, from dried molokhia, garlic and lemon. Eaten in the summer heat with sun bread (aish shamsi).",
      steps: ["Crush the garlic with salt, cumin, onion and chili.", "Add the dried molokhia and stir.", "Gradually add cold water, whisking quickly until smooth.", "Add the lemon juice and chill briefly before serving with sun bread."] } },
  sakhina: { cat: "rare", time: 40, diff: 0, veg: true, serves: 4, icon: "fa-bowl-food", tm: [0, 25, 10, 0],
    ing: [I(4, "pc", "بصل", "onions"), I(3, "tbsp", "سمنة بلدي", "ghee"), I(4, "cup", "مية أو مرقة", "water or broth"), I(2, "loaf", "عيش بلدي محمّص", "toasted baladi bread"), I(null, null, "ملح وفلفل", "salt and pepper")],
    ar: { title: "السخينة", era: "طعام الريف القديم", short: "أكلة الشتا للبسطاء زمان، أساسها البصل المكرمل.", story: "شوربة شتوية بسيطة من الريف القديم، أساسها البصل المكرمل في السمنة البلدي، وبتتصب على العيش المحمص.",
      steps: ["قطّع البصل شرائح رفيعة.", "سيّح السمنة وقلّب البصل على نار هادية لحد ما يتكرمل ويبقى بني غامق.", "ضيف المية السخنة أو المرقة وتبّل بالملح والفلفل وسيبه يغلي.", "اغرف الشوربة على العيش المحمّص وقدّمها سخنة."] },
    en: { title: "Sakhina", era: "Old Rural Food", short: "Winter food of humble homes, built on caramelized onions.", story: "A simple winter soup from the old countryside, built on onions caramelized in ghee and poured over toasted bread.",
      steps: ["Slice the onions thinly.", "Melt the ghee and cook the onions over low heat until deep brown.", "Add hot water or broth, season and bring to a boil.", "Ladle over the toasted bread and serve hot."] } },
  kishk: { cat: "rare", time: 90, diff: 1, veg: false, serves: 4, icon: "fa-bowl-rice", tm: [60, 1, 15, 5, 0],
    ing: [I(1, "cup", "كشك صعيدي", "Saidi kishk"), I(4, "cup", "مرقة فراخ", "chicken broth"), I(2, "cup", "فراخ مسلوقة مفتتة", "shredded cooked chicken"), I(1, "cup", "لبن", "milk"), I(2, "tbsp", "دقيق", "flour"), I(2, "tbsp", "زبدة", "butter"), I(0.5, "cup", "كريمة", "cream"), I(2, "pc", "بصل محمّر", "fried onions")],
    ar: { title: "كشك ألماظ", era: "مطبخ القصور", short: "طبق فاخر بيجمع الكشك الصعيدي مع الفراخ والكريمة.", story: "نسخة فاخرة من الكشك الصعيدي، بتتطبخ بمرقة الفراخ والكريمة وبتتزين بالبصل المقرمش.",
      steps: ["انقع الكشك في المرقة.", "سيّح الزبدة وقلّب فيها الدقيق دقيقة.", "ضيف اللبن والكشك بالمرقة وقلّب باستمرار لحد ما يتقل.", "ضيف الفراخ والكريمة وقلّب.", "زيّن بالبصل المقرمش وقدّمه سخن."] },
    en: { title: "Kishk Almaz", era: "Palace Kitchens", short: "A luxurious dish merging Saidi kishk with chicken and cream.", story: "A refined take on Upper Egyptian kishk, cooked with chicken broth and cream and topped with crispy onions.",
      steps: ["Soak the kishk in the broth.", "Melt the butter and stir in the flour for a minute.", "Add the milk and kishk mixture, stirring constantly until thick.", "Add the chicken and cream.", "Top with crispy onions and serve hot."] } },

  bread: { cat: "pharaonic", time: 120, diff: 1, veg: true, serves: 4, icon: "fa-bread-slice", tm: [0, 10, 60, 20, 15],
    ing: [I(2, "cup", "دقيق قمح كامل", "whole wheat flour"), I(1, "cup", "دقيق شعير", "barley flour"), I(1.25, "cup", "مية دافية", "lukewarm water"), I(1, "tsp", "ملح", "salt"), I(1, "tsp", "خميرة", "yeast")],
    ar: { title: "خبز الحبوب القديمة", short: "إعادة تخيّل لخبز القمح الكامل والشعير.", story: "محاولة لإعادة تخيّل خبز المصريين القدماء من القمح والشعير. المصري القديم كان بيعرف التخمير وعنده أنواع كتير من الخبز.",
      steps: ["اخلط الدقيق مع الملح والخميرة.", "ضيف المية واعجن لحد ما العجينة تبقى ناعمة.", "غطّيها وسيبها تخمر.", "شكّلها أقراص وسيبها ترتاح.", "اخبزها في فرن حامي جداً."] },
    en: { title: "Ancient Grain Bread", short: "A reimagining of whole wheat and barley bread.", story: "An attempt to reimagine ancient Egyptian bread from wheat and barley. Ancient Egyptians knew fermentation and baked many types of bread.",
      steps: ["Mix the flours with salt and yeast.", "Add water and knead until smooth.", "Cover and let rise.", "Shape into rounds and let rest.", "Bake in a very hot oven."] } },
  porridge: { cat: "pharaonic", time: 50, diff: 0, veg: true, serves: 4, icon: "fa-bowl-food", tm: [0, 40, 5, 0],
    ing: [I(1, "cup", "شعير مجروش", "cracked barley"), I(4, "cup", "مية", "water"), I(6, "pc", "تين مجفف", "dried figs"), I(2, "tbsp", "عسل", "honey"), I(null, null, "رشة ملح", "a pinch of salt")],
    ar: { title: "عصيدة الشعير والتين", short: "وجبة طاقة للعمال والفلاحين في مصر القديمة.", story: "الشعير والتين والعسل كانوا من أساسيات المائدة في مصر القديمة، والعصيدة دي وجبة طاقة بسيطة.",
      steps: ["اغسل الشعير.", "اطبخه في المية على نار هادية مع التقليب.", "ضيف التين المقطع والعسل.", "قدّمها دافية."] },
    en: { title: "Barley & Fig Porridge", short: "An energy meal for workers and farmers in ancient Egypt.", story: "Barley, figs and honey were staples in ancient Egypt, and this porridge is a simple energy meal.",
      steps: ["Rinse the barley.", "Simmer in water, stirring often.", "Add the chopped figs and honey.", "Serve warm."] } },
  lentil: { cat: "greco", time: 45, diff: 0, veg: true, serves: 4, icon: "fa-bowl-food", tm: [5, 0, 30, 0],
    ing: [I(1.5, "cup", "عدس بني", "brown lentils"), I(1, "pc", "بصلة", "onion"), I(2, "clove", "ثوم", "garlic"), I(3, "tbsp", "زيت زيتون", "olive oil"), I(6, "cup", "مية", "water"), I(1, "tsp", "كمون", "cumin"), I(0.5, "cup", "كزبرة وشبت", "cilantro and dill")],
    ar: { title: "حساء العدس والأعشاب", short: "دفا الشتا بزيت الزيتون والأعشاب.", story: "العدس كان من أشهر صادرات مصر، وزيت الزيتون والأعشاب جم مع تأثير البحر المتوسط.",
      steps: ["شوّح البصل والثوم في زيت الزيتون.", "ضيف العدس والمية.", "سيبه على نار هادية لحد ما يستوي.", "تبّل بالكمون والملح وضيف الأعشاب."] },
    en: { title: "Lentil & Herb Soup", short: "Winter warmth with olive oil and herbs.", story: "Lentils were a famous Egyptian export, and olive oil and herbs arrived with Mediterranean influence.",
      steps: ["Sauté onion and garlic in olive oil.", "Add lentils and water.", "Simmer until tender.", "Season with cumin and salt and stir in the herbs."] } },
  fish: { cat: "greco", time: 50, diff: 1, veg: false, serves: 4, icon: "fa-fish", tm: [0, 0, 20, 25],
    ing: [I(1, "kg", "سمك (بلطي أو دنيس)", "fish (tilapia or bream)"), I(4, "tbsp", "زيت زيتون", "olive oil"), I(4, "clove", "ثوم", "garlic"), I(0.5, "cup", "أعشاب مفرومة", "chopped herbs"), I(1, "pc", "ليمونة", "lemon"), I(1, "tsp", "كمون", "cumin"), I(null, null, "ملح", "salt")],
    ar: { title: "السمك بالأعشاب", short: "تأثير الإسكندرية الساحلية.", story: "إسكندرية كانت عاصمة البحر المتوسط، والسمك بالأعشاب وزيت الزيتون من روح المطبخ الساحلي.",
      steps: ["اخلط الزيت والثوم والأعشاب والليمون والكمون والملح.", "اعمل شقوق في السمك واحشيها بالخلطة.", "سيبه يتتبل.", "اخبزه في فرن 200 درجة."] },
    en: { title: "Herb-Crusted Fish", short: "Coastal Alexandrian influence.", story: "Alexandria was a Mediterranean capital, and fish with herbs and olive oil captures its coastal spirit.",
      steps: ["Mix the oil, garlic, herbs, lemon, cumin and salt.", "Score the fish and rub in the mixture.", "Let it marinate.", "Bake at 200°C (400°F)."] } },
  seed_bread: { cat: "islamic", time: 90, diff: 1, veg: true, serves: 6, icon: "fa-bread-slice", tm: [0, 10, 45, 0, 20],
    ing: [I(3, "cup", "دقيق", "flour"), I(1, "cup", "مية", "water"), I(3, "tbsp", "زيت", "oil"), I(1, "tsp", "خميرة", "yeast"), I(1, "tsp", "ملح", "salt"), I(2, "tbsp", "سمسم", "sesame seeds"), I(1, "tbsp", "حبة البركة", "nigella seeds"), I(1, "tsp", "يانسون", "anise seeds")],
    ar: { title: "خبز متبل بالبذور", short: "خبز فاخر بالسمسم وحبة البركة.", story: "خبز مزيّن بالسمسم وحبة البركة واليانسون، من روح موائد العصور الإسلامية.",
      steps: ["اخلط الدقيق والخميرة والملح واليانسون.", "ضيف المية والزيت واعجن.", "سيبها تخمر.", "افردها وادهن الوش بمية ورش السمسم وحبة البركة.", "اخبز لحد ما تحمر."] },
    en: { title: "Spiced Seed Bread", short: "A rich bread with sesame and nigella seeds.", story: "Bread topped with sesame, nigella and anise, in the spirit of medieval Islamic tables.",
      steps: ["Mix flour, yeast, salt and anise.", "Add water and oil and knead.", "Let rise.", "Roll out, brush with water and sprinkle the seeds.", "Bake until golden."] } },
  stew: { cat: "islamic", time: 60, diff: 0, veg: true, serves: 4, icon: "fa-bowl-food", tm: [8, 0, 30, 10, 0],
    ing: [I(1, "cup", "عدس", "lentils"), I(1.5, "cup", "حمص مسلوق", "cooked chickpeas"), I(2, "pc", "بصل", "onions"), I(3, "tbsp", "زيت", "oil"), I(1, "tsp", "كمون", "cumin"), I(1, "tsp", "كزبرة ناشفة", "ground coriander"), I(0.5, "tsp", "قرفة", "cinnamon"), I(5, "cup", "مية", "water"), I(1, "tbsp", "خل", "vinegar")],
    ar: { title: "يخنة العدس والحمص", short: "يخنة غنية بتوابل طرق التجارة.", story: "يخنة غنية بالتوابل اللي جت مع تجارة البحر الأحمر، والحامض (الخل) كان لمسة شائعة في وصفات العصر.",
      steps: ["شوّح البصل في الزيت لحد ما يدبل.", "ضيف العدس والتوابل والمية.", "سيبه على نار هادية.", "ضيف الحمص وسيبه يتسبك.", "ضيف رشة خل قبل التقديم."] },
    en: { title: "Lentil & Chickpea Stew", short: "A rich stew spiced by the trade routes.", story: "A stew rich with spices brought by Red Sea trade, with a sour touch of vinegar common in recipes of the era.",
      steps: ["Sauté onions in oil until soft.", "Add lentils, spices and water.", "Simmer.", "Add chickpeas and let thicken.", "Finish with a splash of vinegar."] } },

  koshary: { cat: "modern", time: 75, diff: 1, veg: true, serves: 4, icon: "fa-bowl-rice", tm: [20, 15, 0, 20, 10, 15, 0, 0],
    ing: [I(1, "cup", "رز مصري", "Egyptian rice"), I(1, "cup", "عدس بني (أسود)", "brown lentils"), I(250, "g", "مكرونة (قلم وخواتم)", "pasta (elbow & small shapes)"), I(0.5, "cup", "شعرية", "vermicelli"), I(1, "cup", "حمص مسلوق", "cooked chickpeas"), I(3, "pc", "بصل كبير", "large onions"), I(1, "cup", "زيت للقلي", "oil for frying"), I(500, "g", "صلصة طماطم", "tomato sauce"), I(8, "clove", "ثوم", "garlic"), I(0.5, "cup", "خل", "vinegar"), I(2, "tsp", "كمون", "cumin"), I(0.5, "tsp", "شطة", "chili flakes"), I(null, null, "ملح", "salt")],
    ar: { title: "الكشري المصري", short: "أشهر أكلة شارع في مصر، كاملة بالصلصة والدقة.", story: "مزيج الرز والعدس والمكرونة والحمص، مع صلصة الطماطم الحارة والدقة والبصل المقرمش. أكلة شعبية من أشهر رموز مطبخ الشارع المصري.",
      steps: ["قطّع البصل شرائح رفيعة واقليه في الزيت لحد ما يحمر ويقرمش، وشيله على ورق.", "اسلق العدس لنص استوا.", "حمّر الشعرية في 3 معالق من زيت البصل، وضيف الرز والعدس والمية والملح.", "سيبهم على نار هادية لحد ما يستووا.", "اسلق المكرونة في مية بملح.", "الصلصة: شوّح نص الثوم في زيت البصل، ضيف الصلصة ونص الكمون والشطة والملح ورشة خل.", "الدقة: اخلط باقي الثوم مع باقي الخل والكمون وشوية مية وملح.", "غرّف: رز وعدس، مكرونة، حمص، صلصة، دقة، وبصل مقرمش فوق الكل."] },
    en: { title: "Egyptian Koshary", short: "Egypt's most famous street food, complete with sauce and daqqa.", story: "Rice, lentils, pasta and chickpeas with spicy tomato sauce, daqqa and crispy onions. One of the great icons of Egyptian street food.",
      steps: ["Thinly slice the onions and fry until deep golden and crisp; drain on paper.", "Parboil the lentils.", "Toast the vermicelli in 3 tbsp of the onion oil, then add rice, lentils, water and salt.", "Simmer until cooked.", "Boil the pasta in salted water.", "Sauce: sauté half the garlic in onion oil, add tomato sauce, half the cumin, chili, salt and a splash of vinegar.", "Daqqa: mix the remaining garlic with the remaining vinegar, cumin, a little water and salt.", "Layer: rice & lentils, pasta, chickpeas, sauce, daqqa, and crispy onions on top."] } },
  ful: { cat: "modern", time: 480, diff: 0, veg: true, serves: 4, icon: "fa-bowl-food", tm: [0, 0, 480, 0],
    ing: [I(2, "cup", "فول ناشف", "dried fava beans"), I(2, "tbsp", "عدس أصفر", "yellow lentils"), I(8, "cup", "مية", "water"), I(3, "tbsp", "زيت (زيتون أو حار)", "oil (olive or spicy)"), I(1, "tsp", "كمون", "cumin"), I(1, "pc", "ليمونة", "lemon"), I(null, null, "ملح", "salt")],
    ar: { title: "الفول المدمس", short: "فطار مصر الأول، بيتطبخ ببطء في القدرة.", story: "الفول بيتدمّس ببطء شديد في القدرة أو الدمّاسة لساعات طويلة، وحفنة العدس الأصفر بتديله القوام الكريمي.",
      steps: ["انقع الفول طول الليل وغيّر المية.", "حط الفول والعدس الأصفر في الدمّاسة أو حلة تقيلة بالمية.", "سيبه على نار هادية جداً لحد ما يدمّس.", "اهرسه خفيف وتبّله بالزيت والكمون والليمون والملح."] },
    en: { title: "Ful Medames", short: "Egypt's national breakfast, slow-cooked in a qedra.", story: "Fava beans are slow-cooked for hours in a qedra (dammasa), and a handful of yellow lentils gives them a creamy texture.",
      steps: ["Soak the beans overnight and change the water.", "Put beans and yellow lentils in a dammasa or heavy pot with water.", "Cook over very low heat until creamy.", "Mash lightly and dress with oil, cumin, lemon and salt."] } },
  molokhia: { cat: "modern", time: 45, diff: 1, veg: false, serves: 4, icon: "fa-leaf", tm: [0, 3, 3, 0],
    ing: [I(500, "g", "ملوخية خضرا مخروطة", "fresh minced molokhia"), I(4, "cup", "مرقة فراخ أو أرانب", "chicken or rabbit broth"), I(8, "clove", "ثوم", "garlic"), I(1, "tbsp", "كزبرة ناشفة", "ground coriander"), I(2, "tbsp", "سمنة", "ghee"), I(null, null, "ملح", "salt")],
    ar: { title: "الملوخية بالتقلية", short: "الأكلة اللي ليها شهقة مخصوص.", story: "الملوخية الخضرا في المرقة مع التقلية، والشهقة وقت ما التقلية تنزل جزء من التراث نفسه.",
      steps: ["سخّن المرقة لحد ما تغلي.", "ضيف الملوخية وقلّب لحد ما تغلي تاني ومتغطيهاش.", "التقلية: حمّر الثوم في السمنة لحد ما يدهّب وضيف الكزبرة.", "طشّ التقلية على الملوخية، والشهقة جزء من الوصفة!"] },
    en: { title: "Molokhia with Taqliya", short: "The dish that comes with its own gasp.", story: "Green molokhia in broth with garlic taqliya. The gasp (shahqa) as the taqliya hits the pot is part of the tradition.",
      steps: ["Bring the broth to a boil.", "Add the molokhia and stir until it boils again; don't cover.", "Taqliya: fry garlic in ghee until golden, then add coriander.", "Pour the sizzling taqliya over the molokhia, and gasp!"] } },
  taameya: { cat: "modern", time: 60, diff: 1, veg: true, serves: 4, icon: "fa-circle", tm: [0, 0, 30, 0, 4],
    ing: [I(2, "cup", "فول مدشوش مقشور (منقوع)", "split peeled fava beans (soaked)"), I(1, "cup", "كزبرة وبقدونس وشبت", "cilantro, parsley and dill"), I(1, "pc", "بصلة", "onion"), I(4, "clove", "ثوم", "garlic"), I(1, "tsp", "كمون", "cumin"), I(1, "tsp", "كزبرة ناشفة", "ground coriander"), I(0.5, "tsp", "بيكنج صودا", "baking soda"), I(2, "tbsp", "سمسم", "sesame seeds"), I(null, null, "ملح وزيت للقلي", "salt and frying oil")],
    ar: { title: "الطعمية", short: "الطعمية المصرية بالفول مش بالحمص!", story: "على عكس الفلافل في الشام، الطعمية المصرية بتتعمل من الفول المقشور مع خضرة كتير، وده اللي بيديها لونها الأخضر.",
      steps: ["انقع الفول المقشور 12 ساعة وصفّيه كويس.", "افرمه مع الخضرة والبصل والثوم.", "ضيف التوابل والملح وسيبه يرتاح.", "قبل القلي ضيف البيكنج صودا، شكّل أقراص ورش سمسم.", "اقليها في زيت غزير سخن لحد ما تحمر."] },
    en: { title: "Ta'ameya", short: "Egyptian falafel is made with fava beans, not chickpeas!", story: "Unlike Levantine falafel, Egyptian ta'ameya is made from peeled fava beans with lots of herbs, which gives it its green color.",
      steps: ["Soak the peeled fava beans 12 hours and drain well.", "Grind with herbs, onion and garlic.", "Add spices and salt and let rest.", "Just before frying, add baking soda, shape patties and sprinkle sesame.", "Deep-fry in hot oil until golden."] } },
  mahshi: { cat: "modern", time: 120, diff: 2, veg: true, serves: 6, icon: "fa-pepper-hot", tm: [0, 0, 0, 0, 40],
    ing: [I(1, "kg", "كوسة وباذنجان وفلفل", "zucchini, eggplant and peppers"), I(2, "cup", "رز مصري", "Egyptian rice"), I(2, "cup", "عصير طماطم", "tomato juice"), I(1, "cup", "بقدونس وشبت وكزبرة", "parsley, dill and cilantro"), I(1, "pc", "بصلة مبشورة", "grated onion"), I(4, "tbsp", "سمنة أو زيت", "ghee or oil"), I(2, "cup", "مرقة أو مية", "broth or water"), I(null, null, "ملح وفلفل", "salt and pepper")],
    ar: { title: "المحشي المشكّل", short: "ملك سفرة يوم الجمعة.", story: "المحشي أكلة لمّة بامتياز، وتقوير الخضار وحشيه غالباً شغل جماعي للعيلة كلها.",
      steps: ["قوّر الخضار.", "اخلط الرز المغسول مع الخضرة والبصل وعصير الطماطم والسمنة والتوابل.", "احشي الخضار لتلات أرباعها بس، عشان الرز بيكبر.", "رصّه في حلة وضيف المرقة لحد قربه يغطيه.", "سيبه يغلي على نار عالية، وبعدين هادية لحد ما يستوي."] },
    en: { title: "Mixed Mahshi", short: "The king of the Friday family table.", story: "Mahshi is the ultimate gathering dish; coring and stuffing vegetables is often a whole-family effort.",
      steps: ["Core the vegetables.", "Mix rinsed rice with herbs, onion, tomato juice, ghee and spices.", "Stuff vegetables only three-quarters full, as rice expands.", "Pack into a pot and add broth almost to cover.", "Boil on high, then simmer until cooked."] } },
  fatta: { cat: "modern", time: 120, diff: 1, veg: false, serves: 6, icon: "fa-drumstick-bite", tm: [90, 20, 10, 10, 0],
    ing: [I(1, "kg", "لحمة بالعضم", "bone-in beef or lamb"), I(2, "cup", "رز مصري", "Egyptian rice"), I(3, "loaf", "عيش بلدي", "baladi bread"), I(8, "clove", "ثوم", "garlic"), I(0.5, "cup", "خل", "vinegar"), I(2, "cup", "صلصة طماطم", "tomato sauce"), I(3, "tbsp", "سمنة", "ghee"), I(1, "pc", "بصلة وحبهان وورق لورا", "onion, cardamom and bay leaf")],
    ar: { title: "الفتة المصرية", short: "سيدة سفرة العيد الكبير.", story: "الفتة طبق الاحتفالات، خصوصاً في عيد الأضحى: طبقات عيش محمص ورز وخلطة الخل والثوم واللحمة.",
      steps: ["اسلق اللحمة مع البصل والحبهان وورق اللورا.", "اطبخ الرز.", "قطّع العيش وحمّصه في الفرن.", "شوّح الثوم في السمنة، ضيف الخل وسيبه يغلي، وبعدين الصلصة.", "رصّ: عيش مبلول بالشوربة وشوية خل بالثوم، رز، صلصة، واللحمة فوق."] },
    en: { title: "Egyptian Fatta", short: "The star of the Grand Eid table.", story: "Fatta is a celebration dish, especially at Eid al-Adha: layers of toasted bread, rice, garlic-vinegar sauce and meat.",
      steps: ["Boil the meat with onion, cardamom and bay leaf.", "Cook the rice.", "Cut and toast the bread in the oven.", "Fry garlic in ghee, add vinegar and boil, then add tomato sauce.", "Layer: bread soaked in broth and garlic vinegar, rice, sauce, meat on top."] } },
  hawawshi: { cat: "modern", time: 45, diff: 0, veg: false, serves: 4, icon: "fa-burger", tm: [0, 0, 0, 20],
    ing: [I(500, "g", "لحمة مفرومة", "minced meat"), I(4, "loaf", "عيش بلدي", "baladi bread"), I(1, "pc", "بصلة", "onion"), I(1, "pc", "فلفل أخضر", "green pepper"), I(1, "pc", "شطة خضرا", "hot chili"), I(2, "tbsp", "بقدونس", "parsley"), I(2, "tbsp", "زيت أو سمنة", "oil or ghee"), I(null, null, "ملح وكمون وبهارات", "salt, cumin and spices")],
    ar: { title: "الحواوشي", short: "عيش بلدي محشي لحمة ومقرمش في الفرن.", story: "أكلة شعبية من القرن العشرين، وكتير بينسبوا اسمها لجزار اسمه «الحاوشي». لحمة متبلة جوه العيش البلدي ومخبوزة لحد ما تقرمش.",
      steps: ["اخلط اللحمة مع البصل والفلفل المفرومين والبقدونس والتوابل.", "افتح العيش واحشيه بطبقة رفيعة.", "ادهن الوش بالزيت.", "اخبزه في فرن حامي لحد ما يقرمش."] },
    en: { title: "Hawawshi", short: "Baladi bread stuffed with spiced meat and baked crisp.", story: "A 20th-century street classic whose name is often traced to a butcher called al-Hawawshi. Spiced meat inside baladi bread, baked until crisp.",
      steps: ["Mix the meat with minced onion, peppers, parsley and spices.", "Open the bread and fill with a thin layer.", "Brush the top with oil.", "Bake in a hot oven until crisp."] } },

  roqaq: { cat: "modern", time: 60, diff: 1, veg: false, serves: 6, icon: "fa-layer-group", tm: [15, 0, 0, 0, 30],
    ing: [I(500, "g", "رقاق", "roqaq sheets"), I(500, "g", "لحمة مفرومة", "minced meat"), I(2, "pc", "بصل مفروم", "onions, chopped"), I(1, "cup", "مرقة", "broth"), I(5, "tbsp", "سمنة", "ghee"), I(null, null, "ملح وفلفل وبهارات", "salt, pepper and spices")],
    ar: { title: "الرقاق باللحمة", era: "عيد الأضحى", short: "طبقات رقاق مقرمشة ولحمة مفرومة.", story: "الرقاق عجينة رفيعة جداً بتتخبز على الصاج، ومحشي باللحمة المفرومة من أشهر أطباق عيد الأضحى في مصر.",
      steps: ["شوّح البصل في معلقة سمنة، ضيف اللحمة وقلّب لحد ما تستوي وتبّلها.", "ادهن صينية بالسمنة ورصّ نص الرقاق طبقات، مع رشة سمنة ومرقة بين كل طبقة.", "افرد اللحمة فوق الطبقات.", "غطّيها بباقي الرقاق، وادهن الوش بالسمنة ورش باقي المرقة.", "اخبز في فرن 180 درجة لحد ما يحمر ويقرمش."] },
    en: { title: "Roqaq with Meat", era: "Eid al-Adha", short: "Crisp layered roqaq with minced meat.", story: "Roqaq is a paper-thin dough baked on a griddle; layered with minced meat it is one of Egypt's best-known Eid al-Adha dishes.",
      steps: ["Sauté onion in a spoon of ghee, add the meat, cook through and season.", "Grease a tray and layer half the roqaq, with a little ghee and broth between layers.", "Spread the meat over the layers.", "Cover with the remaining roqaq, brush with ghee and sprinkle the rest of the broth.", "Bake at 180°C (350°F) until golden and crisp."] } },
  feseekh: { cat: "modern", time: 15, diff: 0, veg: false, serves: 4, icon: "fa-fish", tm: [0, 0, 0, 0],
    ing: [I(500, "g", "فسيخ من محل موثوق ومرخّص", "feseekh from a trusted, licensed shop"), I(3, "pc", "ليمون", "lemons"), I(2, "pc", "بصل شرائح", "onions, sliced"), I(3, "tbsp", "زيت", "oil"), I(4, "loaf", "عيش بلدي", "baladi bread"), I(null, null, "بصل أخضر وخس", "green onions and lettuce")],
    ar: { title: "الفسيخ (طريقة التقديم)", era: "شم النسيم", short: "طبق شم النسيم الأشهر، وإزاي تقدّمه بأمان.", story: "الفسيخ سمك بوري متخمّر في الملح، وأكله في شم النسيم عادة قديمة جداً. ⚠️ تنبيه مهم: الفسيخ اللي بيتعمل بطريقة غلط ممكن يسبّب تسمم خطير (البوتيوليزم)، عشان كده الوصفة هنا للتقديم بس، مش لتصنيعه في البيت.",
      steps: ["اشتري الفسيخ من محل معروف ومرخّص، ومتعملوش في البيت، وما تاكلوش لو ريحته أو شكله غريب.", "نضّفه وشيل الجلد والشوك.", "قطّعه في طبق وضيف عصير الليمون والزيت والبصل الشرايح.", "قدّمه مع العيش البلدي والبصل الأخضر والخس."] },
    en: { title: "Feseekh (How to Serve)", era: "Sham Ennessim", short: "Sham Ennessim's signature dish, and how to serve it safely.", story: "Feseekh is fermented, salted mullet, and eating it at Sham Ennessim is a very old custom. ⚠️ Important: improperly prepared feseekh can cause serious poisoning (botulism), so this is a serving guide only, not a home-curing recipe.",
      steps: ["Buy feseekh from a known, licensed shop; never make it at home, and don't eat it if it smells or looks unusual.", "Clean it, removing the skin and bones.", "Cut into a dish and dress with lemon juice, oil and sliced onions.", "Serve with baladi bread, green onions and lettuce."] } },

  om_ali: { cat: "dessert", time: 40, diff: 0, veg: true, serves: 6, icon: "fa-cookie-bite", tm: [15, 0, 5, 15],
    ing: [I(250, "g", "عجينة باف باستري أو رقاق", "puff pastry or roqaq"), I(4, "cup", "لبن", "milk"), I(0.5, "cup", "سكر", "sugar"), I(1, "cup", "مكسرات مشكلة", "mixed nuts"), I(0.5, "cup", "زبيب", "raisins"), I(0.5, "cup", "جوز هند", "coconut"), I(1, "cup", "قشطة أو كريمة", "cream"), I(1, "tsp", "فانيليا", "vanilla")],
    ar: { title: "أم علي", short: "أشهر حلو مصري ساخن، وليه حكاية شعبية.", story: "تقول الحكاية الشعبية إنها اتعملت في العصر المملوكي احتفالاً من «أم علي»، زوجة السلطان عز الدين أيبك. الحكاية مش موثّقة تاريخياً، لكنها الأشهر.",
      steps: ["اخبز العجين أو الرقاق لحد ما يحمر وكسّره.", "رصّه في صينية مع المكسرات والزبيب وجوز الهند.", "سخّن اللبن مع السكر والفانيليا وصبّه على الخليط.", "غطّي الوش بالقشطة واخبز لحد ما يحمر."] },
    en: { title: "Om Ali", short: "Egypt's favorite hot dessert, with a folk legend behind it.", story: "Folk legend says it was made in the Mamluk era to celebrate by \"Om Ali,\" wife of Sultan Izz al-Din Aybak. The story isn't historically documented, but it's the best-known one.",
      steps: ["Bake the pastry until golden and break into pieces.", "Layer in a dish with nuts, raisins and coconut.", "Heat milk with sugar and vanilla and pour over.", "Top with cream and bake until golden."] } },
  basbousa: { cat: "dessert", time: 50, diff: 0, veg: true, serves: 8, icon: "fa-cookie-bite", tm: [10, 0, 0, 0, 30, 0],
    ing: [I(2, "cup", "سميد", "semolina"), I(1, "cup", "زبادي", "yogurt"), I(0.5, "cup", "سكر", "sugar"), I(0.5, "cup", "سمنة مسيّحة", "melted ghee"), I(1, "tsp", "بيكنج باودر", "baking powder"), I(0.5, "cup", "جوز هند", "coconut"), I(20, "pc", "لوز", "almonds"), I(1.5, "cup", "سكر (للشربات)", "sugar (for syrup)"), I(1, "cup", "مية (للشربات)", "water (for syrup)")],
    ar: { title: "البسبوسة", short: "السميد والشربات في أشهر حلو شعبي.", story: "من أشهر الحلويات في مصر والمنطقة كلها، أساسها السميد والسمنة والشربات.",
      steps: ["الشربات: اغلي السكر والمية وضيف نقط ليمون وسيبه يبرد.", "اخلط السميد مع السمنة كويس.", "ضيف الزبادي والسكر والبيكنج باودر وجوز الهند.", "افرده في صينية مدهونة وقطّعه وحط اللوز.", "اخبز في فرن 180 درجة.", "صبّ الشربات البارد على البسبوسة السخنة."] },
    en: { title: "Basbousa", short: "Semolina and syrup in a beloved classic.", story: "One of the most popular sweets in Egypt and the region, built on semolina, ghee and syrup.",
      steps: ["Syrup: boil sugar and water with a few drops of lemon; let cool.", "Rub the semolina well with the ghee.", "Add yogurt, sugar, baking powder and coconut.", "Spread in a greased tray, score and top with almonds.", "Bake at 180°C (350°F).", "Pour the cool syrup over the hot basbousa."] } },
  roz_laban: { cat: "dessert", time: 45, diff: 0, veg: true, serves: 6, icon: "fa-ice-cream", tm: [10, 25, 5, 0],
    ing: [I(0.5, "cup", "رز مصري", "Egyptian rice"), I(1, "cup", "مية", "water"), I(4, "cup", "لبن", "milk"), I(0.5, "cup", "سكر", "sugar"), I(2, "tbsp", "نشا", "cornstarch"), I(1, "tsp", "فانيليا", "vanilla"), I(null, null, "قرفة أو مكسرات للتزيين", "cinnamon or nuts to garnish")],
    ar: { title: "الرز باللبن", short: "حلو البيوت المصرية البسيط.", story: "حلو بسيط موجود في كل بيت مصري، بيتاكل بارد أو دافي ومعاه قرفة أو مكسرات.",
      steps: ["اسلق الرز في المية لحد ما يشربها.", "ضيف اللبن وسيبه على نار هادية مع التقليب.", "ضيف السكر والنشا المذاب في شوية لبن وقلّب لحد ما يتقل.", "صبّه في سلاطين وسيبه يبرد، وزيّنه."] },
    en: { title: "Roz bel Laban", short: "The simple rice pudding of every Egyptian home.", story: "A simple dessert found in every Egyptian home, served cold or warm with cinnamon or nuts.",
      steps: ["Cook the rice in water until absorbed.", "Add milk and simmer, stirring.", "Add sugar and cornstarch dissolved in a little milk; stir until thick.", "Pour into bowls, cool and garnish."] } },
  mahalabia: { cat: "dessert", time: 20, diff: 0, veg: true, serves: 6, icon: "fa-ice-cream", tm: [0, 8, 0, 120],
    ing: [I(4, "cup", "لبن", "milk"), I(0.5, "cup", "سكر", "sugar"), I(6, "tbsp", "نشا", "cornstarch"), I(1, "tsp", "ماء ورد أو زهر", "rose or orange-blossom water"), I(2, "tbsp", "فستق مجروش", "crushed pistachios")],
    ar: { title: "المهلبية", short: "ناعمة وبريحة ماء الورد.", story: "الحكاية المتداولة بتنسب اسمها للقائد المهلّب بن أبي صفرة، لكنها رواية غير مؤكدة. حلو ناعم بريحة ماء الورد.",
      steps: ["ذوّب النشا في كوب لبن بارد.", "سخّن باقي اللبن بالسكر وضيف النشا مع التقليب لحد ما يتقل.", "ضيف ماء الورد وصبّه في سلاطين.", "برّده في التلاجة وزيّنه بالفستق."] },
    en: { title: "Mahalabia", short: "Silky milk pudding scented with rose water.", story: "A popular tale links its name to the commander al-Muhallab ibn Abi Sufra, though it's unconfirmed. A silky pudding scented with rose water.",
      steps: ["Dissolve the cornstarch in a cup of cold milk.", "Heat the rest of the milk with sugar, add the starch and stir until thick.", "Add rose water and pour into bowls.", "Chill and garnish with pistachios."] } },

  kunafa: { cat: "dessert", time: 60, diff: 1, veg: true, serves: 8, icon: "fa-cookie-bite", tm: [10, 8, 0, 0, 40, 0],
    ing: [I(500, "g", "كنافة شعر", "shredded kunafa dough"), I(1, "cup", "سمنة مسيّحة", "melted ghee"), I(2, "cup", "لبن (للحشو)", "milk (for filling)"), I(3, "tbsp", "نشا (للحشو)", "cornstarch (for filling)"), I(2, "tbsp", "سكر (للحشو)", "sugar (for filling)"), I(2, "cup", "سكر (للشربات)", "sugar (for syrup)"), I(1, "cup", "مية (للشربات)", "water (for syrup)"), I(null, null, "مكسرات للتزيين", "nuts to garnish")],
    ar: { title: "الكنافة بالقشطة", short: "ملكة حلويات رمضان.", story: "كنافة الشعر بالسمنة، محشية قشطة أو مكسرات ومسقية بالشربات. فيه حكايات كتير عن أصلها في العصر الأموي أو الفاطمي، لكنها روايات مش مؤكدة.",
      steps: ["اعمل الشربات: اغلي السكر والمية وضيف نقط ليمون، وسيبه يبرد.", "حشو القشطة: سخّن اللبن بالسكر وضيف النشا المذاب في شوية لبن بارد، وقلّب لحد ما يتقل، وسيبه يبرد.", "فكّك الكنافة بإيدك وقلّبها في السمنة كويس.", "افرد نصها في صينية واضغطها، حط الحشو، وغطّيه بباقي الكنافة.", "اخبزها في فرن 180 درجة لحد ما تحمر.", "صبّ الشربات البارد عليها وهي سخنة، وزيّنها بالمكسرات."] },
    en: { title: "Kunafa with Cream", short: "The queen of Ramadan sweets.", story: "Shredded kunafa dough with ghee, filled with cream or nuts and soaked in syrup. Many tales place its origin in the Umayyad or Fatimid era, but they are unconfirmed legends.",
      steps: ["Syrup: boil sugar and water with a few drops of lemon; let cool.", "Cream filling: heat milk with sugar, add cornstarch dissolved in a little cold milk, stir until thick; let cool.", "Loosen the kunafa by hand and toss well with the ghee.", "Press half into a tray, add the filling, and cover with the rest.", "Bake at 180°C (350°F) until golden.", "Pour the cool syrup over the hot kunafa and garnish with nuts."] } },
  qatayef: { cat: "dessert", time: 70, diff: 2, veg: true, serves: 6, icon: "fa-cookie-bite", tm: [0, 30, 2, 0, 5],
    ing: [I(2, "cup", "دقيق", "flour"), I(0.5, "cup", "سميد", "semolina"), I(1, "tbsp", "سكر", "sugar"), I(1, "tsp", "خميرة", "yeast"), I(0.5, "tsp", "بيكنج باودر", "baking powder"), I(2.5, "cup", "مية دافية", "lukewarm water"), I(1, "cup", "مكسرات مفرومة", "chopped nuts"), I(0.5, "cup", "جوز هند", "coconut"), I(1.5, "cup", "سكر (للشربات)", "sugar (for syrup)"), I(null, null, "زيت للقلي", "oil for frying")],
    ar: { title: "القطايف", short: "أقراص رمضان المحشية بالمكسرات.", story: "القطايف من علامات رمضان في مصر، وبائع القطايف بصاجه الكبير منظر مألوف في الشوارع قبل الفطار.",
      steps: ["اخلط الدقيق والسميد والسكر والخميرة والبيكنج باودر، وضيف المية واخفق لحد ما يبقى خليط ناعم سايل.", "سيبه يخمر.", "صبّ دواير صغيرة على طاسة سخنة من غير زيت، وسيبها لحد ما الوش يتملي خرم وينشف، ومتقلبهاش.", "احشي كل قرص بالمكسرات وجوز الهند واقفله نص دايرة واضغط الأطراف.", "اقليها أو اخبزها لحد ما تحمر، وغطّسها في الشربات البارد."] },
    en: { title: "Qatayef", short: "Ramadan pancakes stuffed with nuts.", story: "Qatayef are a hallmark of Ramadan in Egypt, and the qatayef seller with his big griddle is a familiar sight before Iftar.",
      steps: ["Mix flour, semolina, sugar, yeast and baking powder; add water and whisk to a smooth, runny batter.", "Let it rise.", "Pour small rounds on a hot dry pan and cook until the top is full of holes and dry; don't flip.", "Fill each with nuts and coconut, fold into a half-moon and press the edges.", "Fry or bake until golden, then dip in cool syrup."] } },
  kahk: { cat: "dessert", time: 90, diff: 2, veg: true, serves: 10, icon: "fa-cookie", tm: [0, 0, 0, 30, 0, 15, 0],
    ing: [I(4, "cup", "دقيق", "flour"), I(1.5, "cup", "سمنة", "ghee"), I(1, "tsp", "خميرة", "yeast"), I(1, "tbsp", "سكر", "sugar"), I(0.5, "cup", "لبن دافي", "warm milk"), I(2, "tbsp", "سمسم", "sesame seeds"), I(1, "tsp", "ريحة الكحك", "kahk spice blend"), I(1, "cup", "عجمية أو ملبن (للحشو)", "agameya or malban (filling)"), I(null, null, "سكر بودرة للتزيين", "powdered sugar to dust")],
    ar: { title: "كحك العيد", short: "ريحة عيد الفطر في كل بيت.", story: "كحك العيد عادة قديمة جداً؛ بيقولوا إن رسومات لأقراص شبهه ظهرت على جدران مقابر مصرية قديمة، وفي العصر الفاطمي كان بيتوزّع في العيد. والنهارده بيتعمل في البيوت والعيلة متجمّعة.",
      steps: ["سخّن السمنة لحد ما تغلي وصبّها على الدقيق وقلّب كويس (ده اسمه البَسّ)، وسيبه يبرد.", "ضيف ريحة الكحك والسمسم.", "ذوّب الخميرة والسكر في اللبن الدافي، وضيفهم واعجن عجينة طرية.", "سيبها ترتاح.", "شكّل كور، احشيها بالعجمية أو الملبن، ونقّشها بالمنقاش.", "اخبزها في فرن 180 درجة لحد ما الوش يدهّب خفيف.", "لما تبرد رش السكر البودرة."] },
    en: { title: "Eid Kahk", short: "The smell of Eid al-Fitr in every home.", story: "Eid kahk is a very old custom: similar patterned cakes are said to appear in ancient Egyptian tomb paintings, and in the Fatimid era kahk was handed out at Eid. Today families bake it together at home.",
      steps: ["Heat the ghee until bubbling, pour over the flour and mix well (called bass); let cool.", "Add the kahk spice and sesame.", "Dissolve yeast and sugar in the warm milk, add, and knead to a soft dough.", "Let it rest.", "Shape balls, fill with agameya or malban, and pattern with a manqash tweezer.", "Bake at 180°C (350°F) until lightly golden.", "Dust with powdered sugar once cool."] } },

  sobia: { cat: "drink", time: 20, diff: 0, veg: true, serves: 6, icon: "fa-glass-water", tm: [120, 0, 0, 0],
    ing: [I(0.5, "cup", "رز", "rice"), I(1, "cup", "جوز هند", "coconut"), I(2, "cup", "مية", "water"), I(4, "cup", "لبن", "milk"), I(0.75, "cup", "سكر", "sugar"), I(1, "tsp", "فانيليا", "vanilla")],
    ar: { title: "السوبيا", short: "المشروب الأبيض بتاع رمضان.", story: "مشروب رمضاني كلاسيكي من الرز وجوز الهند واللبن، بيتشرب ساقع جداً على الفطار.",
      steps: ["انقع الرز في المية.", "اضربه في الخلاط مع المية وجوز الهند.", "صفّيه واخلطه مع اللبن والسكر والفانيليا.", "قدّمه ساقع جداً."] },
    en: { title: "Sobia", short: "The white drink of Ramadan.", story: "A classic Ramadan drink of rice, coconut and milk, served ice-cold at Iftar.",
      steps: ["Soak the rice in the water.", "Blend with the water and coconut.", "Strain and mix with milk, sugar and vanilla.", "Serve ice-cold."] } },
  karkade: { cat: "drink", time: 15, diff: 0, veg: true, serves: 6, icon: "fa-glass-water", tm: [0, 10, 0],
    ing: [I(1, "cup", "كركديه ناشف", "dried hibiscus"), I(6, "cup", "مية", "water"), I(0.75, "cup", "سكر", "sugar")],
    ar: { title: "الكركديه", short: "مشروب أسوان والنوبة، ساقع أو سخن.", story: "مشروب أحمر مشهور في أسوان والنوبة، بيتشرب ساقع في الصيف وسخن في الشتا، ومن أشهر مشروبات الضيافة والأفراح.",
      steps: ["اغسل الكركديه.", "اغلي المية وضيف الكركديه وسيبه يتنقع.", "صفّيه وضيف السكر، واشربه ساقع أو سخن."] },
    en: { title: "Karkade (Hibiscus)", short: "The drink of Aswan and Nubia, hot or cold.", story: "A ruby-red drink famous in Aswan and Nubia, served cold in summer and hot in winter, and a classic of hospitality and weddings.",
      steps: ["Rinse the hibiscus.", "Boil the water, add hibiscus and let steep.", "Strain, sweeten, and serve cold or hot."] } },
  erk_soos: { cat: "drink", time: 75, diff: 1, veg: true, serves: 6, icon: "fa-glass-water", tm: [0, 60, 0, 0],
    ing: [I(0.5, "cup", "عرقسوس مطحون", "ground licorice root"), I(0.25, "tsp", "بيكنج صودا", "baking soda"), I(6, "cup", "مية ساقعة", "cold water")],
    ar: { title: "العرقسوس", short: "مشروب بائع الصاجات والقربة النحاس.", story: "مشروب شعبي مرتبط ببائع العرقسوس بالقربة النحاس وصوت الصاجات في الشوارع، خصوصاً في رمضان.",
      steps: ["اخلط العرقسوس بالبيكنج صودا ورشّه بشوية مية لحد ما يبقى زي الرمل المبلول.", "سيبه يرتاح.", "حطه في قماشة أو مصفاة وصبّ عليه المية الساقعة بالراحة.", "كرر التصفية لحد ما تطلع له رغوة، وقدّمه ساقع."] },
    en: { title: "Erk Soos (Licorice)", short: "The drink of the brass-jug street vendor.", story: "A folk drink tied to the street vendor with his brass jug and clacking cymbals, especially in Ramadan.",
      steps: ["Mix licorice with baking soda and sprinkle with water until it feels like damp sand.", "Let it rest.", "Place in a cloth or strainer and slowly pour cold water through.", "Repeat straining until foamy; serve cold."] } },
  tamr_hindi: { cat: "drink", time: 70, diff: 0, veg: true, serves: 6, icon: "fa-glass-water", tm: [60, 0, 0, 0],
    ing: [I(250, "g", "تمر هندي", "tamarind block"), I(6, "cup", "مية", "water"), I(0.75, "cup", "سكر", "sugar")],
    ar: { title: "التمر هندي", short: "حامض حلو ومنعش على الفطار.", story: "مشروب حامض وحلو في نفس الوقت، من أساسيات سفرة رمضان.",
      steps: ["انقع التمر هندي في 2 كوب مية دافية.", "اعصره بإيدك وصفّيه.", "ضيف السكر وباقي المية.", "قدّمه ساقع."] },
    en: { title: "Tamr Hindi (Tamarind)", short: "Sweet, tangy and refreshing at Iftar.", story: "A sweet-and-sour drink that's a staple of the Ramadan table.",
      steps: ["Soak the tamarind in 2 cups of warm water.", "Squeeze by hand and strain.", "Add sugar and the remaining water.", "Serve cold."] } },
  sahlab: { cat: "drink", time: 15, diff: 0, veg: true, serves: 4, icon: "fa-mug-hot", tm: [0, 7, 0],
    ing: [I(4, "cup", "لبن", "milk"), I(3, "tbsp", "بودرة سحلب (أو نشا)", "sahlab powder (or cornstarch)"), I(4, "tbsp", "سكر", "sugar"), I(0.5, "tsp", "فانيليا", "vanilla"), I(null, null, "مكسرات وجوز هند وقرفة", "nuts, coconut and cinnamon")],
    ar: { title: "السحلب", short: "دفا الشتا في كوباية.", story: "مشروب شتوي تقيل وكريمي، بيتزين بالمكسرات وجوز الهند والقرفة.",
      steps: ["ذوّب السحلب في شوية لبن بارد.", "سخّن باقي اللبن بالسكر وضيف السحلب مع التقليب لحد ما يتقل.", "صبّه في كوبايات وزيّنه."] },
    en: { title: "Sahlab", short: "Winter warmth in a cup.", story: "A thick, creamy winter drink topped with nuts, coconut and cinnamon.",
      steps: ["Dissolve the sahlab in a little cold milk.", "Heat the rest of the milk with sugar, add the sahlab and stir until thick.", "Pour into cups and garnish."] } }
};

/* ============ IMAGES ============ */
function loadImg(img) {
  const key = img.dataset.img;
  const saved = store.get('img_' + key, null);
  // keep the image in layout (lazy images that are display:none never load); fade it in once ready
  img.style.display = 'block'; img.style.opacity = '0'; img.style.transition = 'opacity .6s ease, transform 1.1s cubic-bezier(.2,.7,.2,1)';
  img.onload = () => { img.style.opacity = '1'; };
  img.onerror = () => { img.style.display = 'none'; };
  img.decoding = 'async';
  const hero = img.classList.contains('hero-bg');
  if (hero) img.setAttribute('fetchpriority', 'high'); else img.loading = 'lazy';
  // responsive: a small copy (images/<key>-sm.jpg) for phones and small cards
  if (!saved) {
    img.sizes = img.dataset.sizes || (hero ? '100vw' : '(max-width: 760px) 92vw, 36vw');
    img.srcset = 'images/' + key + '-sm.jpg ' + (hero ? 1080 : 720) + 'w, images/' + key + '.jpg ' + (hero ? 1920 : 1200) + 'w';
  }
  img.src = saved || ('images/' + key + '.jpg');
}
function decorateImages(root) {
  (root || document).querySelectorAll('img[data-img]').forEach(img => {
    if (img.dataset.done) return;
    img.dataset.done = '1';
    loadImg(img);
    if (EDIT) {
      const key = img.dataset.img;
      const chip = document.createElement('label');
      chip.className = 'edit-chip';
      chip.innerHTML = '<i class="fa-solid fa-camera"></i> images/' + key + '.jpg<input type="file" accept="image/*">';
      chip.addEventListener('click', e => e.stopPropagation());
      chip.querySelector('input').addEventListener('change', e => handleUpload(e, key));
      img.parentElement.appendChild(chip);
    }
  });
}
function handleUpload(e, key) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const im = new Image();
    im.onload = () => {
      const max = 1400, s = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      const data = c.toDataURL('image/jpeg', 0.82);
      if (!store.set('img_' + key, data)) alert(T("مساحة المتصفح امتلأت، جرّب صورة أصغر.", "Browser storage is full; try a smaller image."));
      document.querySelectorAll('img[data-img="' + key + '"]').forEach(i => { i.src = data; i.style.display = 'block'; });
    };
    im.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

/* ============ CARDS / ENCYCLOPEDIA ============ */
let favs = new Set(store.get('favs', []));
let activeChip = 'all';

function badgesHTML(r) {
  return '<span class="badge"><i class="fa-regular fa-clock"></i> ' + fmtTime(r.time) + '</span>' +
    '<span class="badge"><i class="fa-solid fa-signal"></i> ' + DIFF[lang][r.diff] + '</span>' +
    (r.veg ? '<span class="badge veg"><i class="fa-solid fa-seedling"></i> ' + T("نباتي", "Vegetarian") + '</span>' : '') +
    (['pharaonic', 'greco', 'islamic'].includes(r.cat) ? '<span class="badge" title="' + T("وصفة تاريخية أُعيد تخيّلها للمطبخ المنزلي، وليست نصًا أثريًا حرفيًا", "A historical recipe reimagined for home kitchens, not a literal ancient text") + '"><i class="fa-solid fa-feather-pointed"></i> ' + T("إعادة تخيّل حديثة", "Modern reimagining") + '</span>' : '');
}
function cardHTML(id) {
  const r = R[id], t = r[lang], fav = favs.has(id);
  return '<div class="recipe-card reveal-up" data-id="' + id + '">' +
    '<div class="recipe-img-wrap image-container"><div class="ph"><i class="fa-solid ' + r.icon + '"></i><span>' + esc(t.title) + '</span></div><img data-img="' + id + '" alt="' + esc(t.title) + '"></div>' +
    '<button class="fav-btn" onclick="toggleFav(\'' + id + '\',event)" aria-label="' + T("المفضلة", "Favorite") + '"><i class="' + (fav ? 'fa-solid' : 'fa-regular') + ' fa-heart"></i></button>' +
    '<div class="recipe-info">' + (t.era ? '<span class="recipe-era">' + esc(t.era) + '</span>' : '') +
    '<h3 class="recipe-title">' + esc(t.title) + '</h3><p>' + esc(t.short) + '</p>' +
    '<div class="badges">' + badgesHTML(r) + '</div>' +
    '<button class="btn-main btn-card" onclick="openModal(\'' + id + '\')">' + T("التفاصيل والوصفة", "Details & Recipe") + '</button></div></div>';
}
function renderRecipes() {
  const ids = Object.keys(R);
  const rare = document.getElementById('rareGrid');
  if (rare) rare.innerHTML = ids.filter(i => R[i].cat === 'rare').map(cardHTML).join('');
  const ency = document.getElementById('encyclopedia');
  if (ency) {
    const groups = ['pharaonic', 'greco', 'islamic', 'modern', 'dessert', 'drink'];
    ency.innerHTML = groups.map(g =>
      '<div class="era-group" data-group="' + g + '"><h3 class="era-header" id="group-' + g + '"><i class="fa-solid ' + CATS[g].icon + '"></i> ' + CATS[g][lang] + '</h3>' +
      '<div class="recipes-grid">' + ids.filter(i => R[i].cat === g).map(cardHTML).join('') + '</div></div>').join('');
    const chips = [['all', "الكل", "All"], ['pharaonic', "فرعوني", "Pharaonic"], ['greco', "يوناني روماني", "Greco-Roman"], ['islamic', "إسلامي", "Islamic"], ['modern', "معاصر", "Contemporary"], ['dessert', "حلويات", "Desserts"], ['drink', "مشروبات", "Drinks"], ['veg', "🌱 نباتي", "🌱 Vegetarian"], ['fav', "❤ المفضلة", "❤ Favorites"]];
    document.getElementById('filterChips').innerHTML = chips.map(c =>
      '<button class="chip' + (c[0] === activeChip ? ' active' : '') + '" onclick="setChip(\'' + c[0] + '\')">' + (lang === 'ar' ? c[1] : c[2]) + '</button>').join('');
  }
  const feat = document.getElementById('featuredGrid');
  if (feat) feat.innerHTML = ['koshary', 'molokhia', 'taameya', 'om_ali', 'kahk', 'karkade'].map(cardHTML).join('');
  decorateImages();
  applyFilters();
  reveal();
}
function setChip(c) { activeChip = c; document.querySelectorAll('#filterChips .chip').forEach((b, i) => b.classList.toggle('active', b.getAttribute('onclick').includes("'" + c + "'"))); applyFilters(); }
function norm(s) { return String(s).toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'); }
function applyFilters() {
  if (!document.getElementById('searchInput')) return;
  const q = norm(document.getElementById('searchInput').value.trim());
  let shown = 0;
  document.querySelectorAll('#encyclopedia .recipe-card').forEach(card => {
    const id = card.dataset.id, r = R[id];
    let ok = activeChip === 'all' || r.cat === activeChip || (activeChip === 'veg' && r.veg) || (activeChip === 'fav' && favs.has(id));
    if (ok && q) {
      const hay = norm([r.ar.title, r.en.title, r.ar.short, r.en.short, ...r.ing.map(i => i.ar + ' ' + i.en)].join(' '));
      ok = hay.includes(q);
    }
    card.style.display = ok ? '' : 'none';
    if (ok) { shown++; card.classList.add('active'); }
  });
  document.querySelectorAll('.era-group').forEach(g => {
    g.style.display = [...g.querySelectorAll('.recipe-card')].some(c => c.style.display !== 'none') ? '' : 'none';
  });
  const empty = document.getElementById('emptyState');
  empty.style.display = shown ? 'none' : 'block';
  empty.innerHTML = activeChip === 'fav' && !q
    ? T("لسه ما ضفتش أكلات للمفضلة. دوس على ❤ في أي كارت.", "No favorites yet. Tap ❤ on any card.")
    : T("مفيش نتايج. جرّب كلمة تانية.", "No results. Try another word.");
}
function toggleFav(id, e) {
  e.stopPropagation();
  favs.has(id) ? favs.delete(id) : favs.add(id);
  store.set('favs', [...favs]);
  document.querySelectorAll('.recipe-card[data-id="' + id + '"] .fav-btn i').forEach(i => { i.className = (favs.has(id) ? 'fa-solid' : 'fa-regular') + ' fa-heart'; });
  if (activeChip === 'fav') applyFilters();
}

/* ============ MODAL ============ */
const modal = document.getElementById('recipeModal');
let currentId = null, checked = new Set();
function openModal(id) {
  if (currentId !== id) checked = new Set();
  currentId = id;
  const r = R[id], t = r[lang];
  document.getElementById('modalTitle').textContent = t.title;
  document.getElementById('modalEra').textContent = t.era || CATS[r.cat][lang];
  document.getElementById('modalBadges').innerHTML = badgesHTML(r);
  document.getElementById('modalStory').textContent = t.story;
  const sv = document.getElementById('servings');
  if (!modal.classList.contains('is-open') || sv.dataset.for !== id) { sv.value = r.serves; sv.dataset.for = id; }
  renderIngredients();
  document.getElementById('modalSteps').innerHTML = t.steps.map((s, i) => {
    const m = r.tm && r.tm[i];
    return '<li>' + esc(s) + (m ? ' <button class="timer-btn" data-timer="' + id + '-' + i + '" data-min="' + m + '" onclick="toggleTimer(\'' + id + '-' + i + '\',' + m + ')"><i class="fa-solid fa-stopwatch"></i> ' + fmtTime(m) + '</button>' : '') + '</li>';
  }).join('');
  Object.keys(timers).forEach(tick);
  modal.style.display = 'block';
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function renderIngredients() {
  const r = R[currentId]; if (!r) return;
  let s = parseInt(document.getElementById('servings').value, 10);
  if (!s || s < 1) s = 1;
  const f = s / r.serves;
  document.getElementById('servesNote').textContent = T("(لـ " + s + " أشخاص)", "(for " + s + ")");
  document.getElementById('modalIngredients').innerHTML = r.ing.map((i, k) =>
    '<li><label><input type="checkbox" ' + (checked.has(k) ? 'checked' : '') + ' onchange="this.checked?checked.add(' + k + '):checked.delete(' + k + ')"><span>' + esc(ingText(i, f)) + '</span></label></li>').join('');
}
function closeModal() { modal.style.display = 'none'; modal.classList.remove('is-open'); document.body.style.overflow = ''; }
function shareWhatsApp() {
  const r = R[currentId], t = r[lang];
  const s = parseInt(document.getElementById('servings').value, 10) || r.serves;
  let txt = '🍲 ' + t.title + '\n\n' + T('المقادير', 'Ingredients') + ' (' + s + '):\n' + r.ing.map(i => '• ' + ingText(i, s / r.serves)).join('\n') +
    '\n\n' + T('الخطوات', 'Steps') + ':\n' + t.steps.map((x, k) => (k + 1) + '. ' + x).join('\n');
  if (location.protocol.startsWith('http')) txt += '\n\n' + location.href.split('#')[0];
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
}

/* ============ TIMERS ============ */
const timers = {};
const mmss = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
function toggleTimer(key, min) {
  if (timers[key]) {
    clearInterval(timers[key].iv); delete timers[key];
    document.querySelectorAll('[data-timer="' + key + '"]').forEach(b => { b.className = 'timer-btn'; b.innerHTML = '<i class="fa-solid fa-stopwatch"></i> ' + fmtTime(min); });
    return;
  }
  timers[key] = { end: Date.now() + min * 60000, iv: setInterval(() => tick(key), 1000) };
  tick(key);
}
function tick(key) {
  const t = timers[key]; if (!t) return;
  const left = Math.max(0, Math.round((t.end - Date.now()) / 1000));
  const btns = document.querySelectorAll('[data-timer="' + key + '"]');
  btns.forEach(b => { b.className = 'timer-btn running'; b.innerHTML = '<i class="fa-solid fa-stopwatch"></i> ' + mmss(left); });
  if (left <= 0) {
    clearInterval(t.iv); delete timers[key]; alarm();
    btns.forEach(b => { b.className = 'timer-btn done'; b.innerHTML = '<i class="fa-solid fa-bell"></i> ' + T("خلص الوقت!", "Time's up!"); });
  }
}
function alarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.45, 0.9].forEach(d => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.2, ctx.currentTime + d); o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.3); });
  } catch (e) {}
  if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
}

/* ============ MAP ============ */
const REGIONS = [
  { id: "alex", x: 167, y: 38, lx: -30, ly: -12, ar: { name: "إسكندرية", desc: "مطبخ البحر المتوسط والسمك والطعم الإسكندراني الحار.", dishes: ["السمك والجمبري والسبيط المشوي", "الصيادية بالرز البني", "الكبدة الإسكندراني بالشطة", "الفريسكا على البحر"] }, en: { name: "Alexandria", desc: "Mediterranean seafood and the famous spicy Alexandrian style.", dishes: ["Grilled fish, shrimp and calamari", "Sayadeya (fish with brown rice)", "Spicy Alexandrian liver", "Freska wafers on the beach"] } },
  { id: "delta", x: 205, y: 52, lx: 14, ly: 4, la: "start", ar: { name: "الدلتا والريف", desc: "مطبخ الفلاحين: الفطير والطيور والجبن البلدي.", dishes: ["الفطير المشلتت بالعسل والجبنة", "البط والوز بالفريك", "الجبنة القريش والمش", "الممبار"] }, en: { name: "Delta & Countryside", desc: "The farmers' kitchen: layered pastry, poultry and village cheese.", dishes: ["Feteer meshaltet with honey and cheese", "Duck and goose with freekeh", "Areesh cheese and mish", "Mombar (stuffed casings)"] } },
  { id: "cairo", x: 207, y: 80, lx: 14, ly: 14, la: "start", ar: { name: "القاهرة", desc: "عاصمة أكل الشارع والعربيات والمحلات الشعبية.", dishes: ["الكشري", "الفول والطعمية", "الحواوشي", "الكبدة والسجق"] }, en: { name: "Cairo", desc: "Capital of street food, carts and classic eateries.", dishes: ["Koshary", "Ful and ta'ameya", "Hawawshi", "Liver and sausage sandwiches"] } },
  { id: "sinai", x: 284, y: 112, ar: { name: "سيناء", desc: "مطبخ بدوي بسيط فوق نار الحطب والصاج.", dishes: ["الزرب (لحم مطبوخ في حفرة في الرمل)", "عيش الفراشيح على الصاج", "الشاي البدوي بالحبق والمرمرية"] }, en: { name: "Sinai", desc: "Simple Bedouin cooking over wood fire and saj.", dishes: ["Zarb (meat cooked in a sand pit)", "Farasheeh bread on the saj", "Bedouin tea with basil and sage"] } },
  { id: "canal", x: 282, y: 190, ar: { name: "القناة والبحر الأحمر", desc: "سمك البحر الأحمر وأكلات مدن القناة.", dishes: ["الصيادية السويسي", "الجمبري والكابوريا البورسعيدي", "سمك البحر الأحمر المشوي"] }, en: { name: "Canal & Red Sea", desc: "Red Sea fish and Canal-city specialties.", dishes: ["Suez-style sayadeya", "Port Said shrimp and crab", "Grilled Red Sea fish"] } },
  { id: "upper", x: 249, y: 236, ar: { name: "الصعيد", desc: "أكل قوي وبسيط، والعيش الشمسي سيد السفرة.", dishes: ["الشلولو البارد", "العيش الشمسي والبتاو", "الويكة (البامية الناشفة)", "الكشك الصعيدي"] }, en: { name: "Upper Egypt", desc: "Hearty, simple food with sun bread at the center.", dishes: ["Cold shalawlaw", "Aish shamsi and bettaw breads", "Weka (dried okra stew)", "Saidi kishk"] } },
  { id: "nubia", x: 257, y: 294, ar: { name: "أسوان والنوبة", desc: "ألوان ونكهات نوبية، ومشروبات الكركديه والدوم.", dishes: ["الكركديه الساقع والسخن", "مشروب الدوم", "عيش الكابيد النوبي", "سمك بحيرة ناصر"] }, en: { name: "Aswan & Nubia", desc: "Nubian colors and flavors, with hibiscus and doum drinks.", dishes: ["Karkade, cold or hot", "Doum palm drink", "Nubian kabeed bread", "Lake Nasser fish"] } },
  { id: "west", x: 70, y: 92, ar: { name: "الصحراء الغربية", desc: "واحات سيوة ومطروح: تمر وزيتون وطهي في الرمل.", dishes: ["تمر وزيتون سيوة", "أبو مردم (لحم مطبوخ تحت الرمل)", "شاي الواحات"] }, en: { name: "Western Desert", desc: "Siwa and Matrouh oases: dates, olives and sand cooking.", dishes: ["Siwa dates and olives", "Abu Mardam (meat cooked under sand)", "Oasis tea"] } }
];
let activeRegion = 'cairo';
function renderMap() {
  const pts = REGIONS.map(r => '<g class="region-pt' + (r.id === activeRegion ? ' active' : '') + '" onclick="selectRegion(\'' + r.id + '\')" tabindex="0"><circle cx="' + r.x + '" cy="' + r.y + '" r="8"/><text x="' + (r.x + (r.lx || 0)) + '" y="' + (r.y + (r.ly == null ? -13 : r.ly)) + '" text-anchor="' + (r.la || 'middle') + '">' + r[lang].name + '</text></g>').join('');
  document.getElementById('mapSvg').innerHTML =
    '<svg viewBox="0 0 400 390" role="img" aria-label="' + T("خريطة مصر", "Map of Egypt") + '">' +
    '<path class="eg-land" d="M20,26 L87,33 L167,38 L182,29 L224,27 L239,36 L297,34 L317,99 L297,163 L278,145 L263,115 L246,82 L240,96 L248,114 L262,140 L284,182 L288,199 L298,222 L317,259 L334,299 L377,369 L20,369 Z"/>' +
    '<text class="eg-sea" x="40" y="16">' + T("البحر المتوسط", "Mediterranean Sea") + '</text>' +
    '<text class="eg-sea" x="352" y="290" transform="rotate(62 352 290)">' + T("البحر الأحمر", "Red Sea") + '</text>' +
    '<polyline class="eg-lake" points="257,294 240,330 215,369"/>' +
    '<polyline class="eg-nile" points="257,294 249,236 230,210 205,183 192,150 200,115 207,80"/>' +
    '<polyline class="eg-nile" points="207,80 195,55 182,29"/><polyline class="eg-nile" points="207,80 215,55 224,27"/>' +
    '<polyline class="eg-nile" style="stroke-dasharray:4 3;stroke-width:2" points="239,36 246,82"/>' + pts + '</svg>';
  document.getElementById('regionChips').innerHTML = REGIONS.map(r => '<button class="chip' + (r.id === activeRegion ? ' active' : '') + '" onclick="selectRegion(\'' + r.id + '\')">' + r[lang].name + '</button>').join('');
  const r = REGIONS.find(x => x.id === activeRegion)[lang];
  document.getElementById('regionPanel').innerHTML = '<h3><i class="fa-solid fa-location-dot" style="color:var(--dark-gold)"></i> ' + r.name + '</h3><p>' + r.desc + '</p><ul>' + r.dishes.map(d => '<li><i class="fa-solid fa-utensils"></i><span>' + d + '</span></li>').join('') + '</ul>';
}
function selectRegion(id) { activeRegion = id; renderMap(); }

/* ============ VIDEOS ============ */
function renderVideos() {
  document.getElementById('videoGrid').innerHTML = VIDEOS.map((v, i) => {
    const t = v[lang];
    return '<div class="video-card reveal-up"><div class="video-wrapper" id="vw-' + i + '"><div class="video-cover image-container" onclick="playVideo(' + i + ')">' +
      '<div class="ph"><i class="fa-brands fa-youtube"></i><span>' + esc(t.title) + '</span></div><img data-img="' + v.img + '" alt="">' +
      '<div class="play"><i class="fa-solid fa-circle-play"></i>' + (v.id ? '' : '<small>' + T("هيفتح نتائج البحث على يوتيوب", "Opens YouTube search results") + '</small>') + '</div></div></div>' +
      '<div class="video-info"><h3 class="video-title">' + esc(t.title) + '</h3><p class="video-desc">' + esc(t.desc) + '</p></div></div>';
  }).join('');
  decorateImages(document.getElementById('videoGrid'));
}
function playVideo(i) {
  const v = VIDEOS[i];
  if (!v.id) { window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(v.q), '_blank'); return; }
  document.getElementById('vw-' + i).innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?autoplay=1" title="' + esc(v[lang].title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
}

/* ============ QUIZ ============ */
const QUIZ = [
  { ar: { q: "إيه اسم الثوم المقلي بالسمنة اللي بيتحط على الملوخية؟", o: ["التقلية", "الدقة", "الطحينة", "الشطة"], e: "التقلية (أو الطشة) ثوم وكزبرة متحمرين في السمنة." }, en: { q: "What is the garlic fried in ghee poured over molokhia called?", o: ["Taqliya", "Daqqa", "Tahina", "Shatta"], e: "Taqliya (or tasha) is garlic and coriander fried in ghee." }, a: 0 },
  { ar: { q: "الطعمية المصرية بتتعمل أساساً من إيه؟", o: ["الحمص", "الفول المقشور", "العدس", "البسلة"], e: "على عكس فلافل الشام، الطعمية المصرية من الفول المقشور." }, en: { q: "Egyptian ta'ameya is mainly made from…", o: ["Chickpeas", "Peeled fava beans", "Lentils", "Peas"], e: "Unlike Levantine falafel, Egyptian ta'ameya uses peeled fava beans." }, a: 1 },
  { ar: { q: "شم النسيم جذوره في أي موسم مصري قديم؟", o: ["الأوبت", "شمو", "وفاء النيل", "سد"], e: "اسم شم النسيم مرتبط بموسم «شمو»، موسم الحصاد والربيع." }, en: { q: "Sham Ennessim is rooted in which ancient Egyptian season?", o: ["Opet", "Shemu", "Wafaa el-Nil", "Sed"], e: "Its name is linked to Shemu, the harvest and spring season." }, a: 1 },
  { ar: { q: "أي أكلة من دول بتتعمل من غير ما تدخل النار؟", o: ["السخينة", "الفتة", "الشلولو", "الحواوشي"], e: "الشلولو حساء بارد من الملوخية الناشفة والثوم والليمون." }, en: { q: "Which dish is made without any cooking?", o: ["Sakhina", "Fatta", "Shalawlaw", "Hawawshi"], e: "Shalawlaw is a cold soup of dried molokhia, garlic and lemon." }, a: 2 },
  { ar: { q: "الدقة في الكشري معمولة من إيه؟", o: ["ثوم وخل وكمون", "طماطم وبصل", "طحينة وليمون", "زبادي وثوم"], e: "الدقة صوص حامض من الثوم والخل والكمون." }, en: { q: "Koshary's daqqa is made of…", o: ["Garlic, vinegar and cumin", "Tomato and onion", "Tahini and lemon", "Yogurt and garlic"], e: "Daqqa is a tangy sauce of garlic, vinegar and cumin." }, a: 0 },
  { ar: { q: "الكحك مرتبط بأي عيد؟", o: ["عيد الأضحى", "شم النسيم", "عيد الفطر", "المولد النبوي"], e: "عيد الفطر بيتسمى شعبياً «عيد الكحك»." }, en: { q: "Kahk is associated with which holiday?", o: ["Eid al-Adha", "Sham Ennessim", "Eid al-Fitr", "Mawlid"], e: "Eid al-Fitr is popularly called the \"Kahk Eid.\"" }, a: 2 },
  { ar: { q: "الكركديه أشهر في أي منطقة؟", o: ["إسكندرية", "أسوان والنوبة", "سيناء", "الدلتا"], e: "الكركديه من رموز الضيافة في أسوان والنوبة." }, en: { q: "Karkade is most associated with which region?", o: ["Alexandria", "Aswan & Nubia", "Sinai", "The Delta"], e: "Karkade is a hospitality symbol in Aswan and Nubia." }, a: 1 },
  { ar: { q: "كتاب «كنز الفوائد في تنويع الموائد» من أي عصر؟", o: ["الفرعوني", "الروماني", "المملوكي", "الحديث"], e: "كتاب طبخ مصري من العصر المملوكي (حوالي القرن الرابع عشر)." }, en: { q: "Which era is the cookbook \"Kanz al-Fawa'id\" from?", o: ["Pharaonic", "Roman", "Mamluk", "Modern"], e: "An Egyptian cookbook from the Mamluk era (around the 14th century)." }, a: 2 }
];
let qi = 0, score = 0, answered = false;
function renderQuiz() {
  const box = document.getElementById('quizBox');
  if (qi >= QUIZ.length) {
    const msg = score >= 7 ? T("إنت خبير مطبخ مصري! 👨‍🍳", "You're an Egyptian food expert! 👨‍🍳") : score >= 4 ? T("مش بطال! كمّل استكشاف الموسوعة.", "Not bad! Keep exploring the encyclopedia.") : T("لسه قدامك رحلة لذيذة 😄", "A delicious journey awaits you 😄");
    box.innerHTML = '<div class="quiz-end"><div class="score">' + score + ' / ' + QUIZ.length + '</div><p style="font-size:1.2rem;margin:10px 0 20px">' + msg + '</p><button class="btn-main" onclick="qi=0;score=0;renderQuiz()"><i class="fa-solid fa-rotate"></i> ' + T("العب تاني", "Play again") + '</button></div>';
    return;
  }
  const q = QUIZ[qi], t = q[lang];
  answered = false;
  box.innerHTML = '<div class="quiz-meta"><span>' + T("سؤال", "Question") + ' ' + (qi + 1) + ' / ' + QUIZ.length + '</span><span>' + T("النتيجة", "Score") + ': ' + score + '</span></div>' +
    '<div class="quiz-progress"><div style="width:' + (qi / QUIZ.length * 100) + '%"></div></div>' +
    '<h3 class="quiz-q">' + t.q + '</h3><div class="quiz-opts">' + t.o.map((o, i) => '<button class="quiz-opt" onclick="answerQuiz(' + i + ',this)">' + o + '</button>').join('') + '</div>' +
    '<div class="quiz-exp" id="quizExp"></div><div style="text-align:end;margin-top:15px"><button class="btn-main" id="quizNext" style="display:none" onclick="qi++;renderQuiz()">' + T("التالي", "Next") + ' <i class="fa-solid fa-arrow-' + (lang === 'ar' ? 'left' : 'right') + '"></i></button></div>';
}
function answerQuiz(i, btn) {
  if (answered) return; answered = true;
  const q = QUIZ[qi], opts = document.querySelectorAll('.quiz-opt');
  opts.forEach(b => b.disabled = true);
  opts[q.a].classList.add('correct');
  if (i === q.a) score++; else btn.classList.add('wrong');
  const exp = document.getElementById('quizExp');
  exp.innerHTML = '<b>' + (i === q.a ? T("إجابة صح! ✓", "Correct! ✓") : T("مش بالظبط.", "Not quite.")) + '</b> ' + q[lang].e;
  exp.style.display = 'block';
  document.getElementById('quizNext').style.display = 'inline-block';
}

/* ============ GLOSSARY ============ */
const GLOSS = [
  ["التقلية", "Taqliya", "ثوم وكزبرة ناشفة متحمرين في السمنة، بيتحطوا على الملوخية والشوربة.", "Garlic and coriander fried in ghee, poured over molokhia and soups."],
  ["الطشة", "Tasha", "صوت التقلية وهي نازلة على الأكل، وبتستخدم كمان كاسم للتقلية نفسها.", "The sizzle of taqliya hitting the pot; also used as another name for it."],
  ["الشهقة", "Shahqa", "الشهقة الشعبية اللي بتتعمل وقت طش الملوخية، وكأنها جزء من الوصفة.", "The playful gasp made while pouring taqliya into molokhia."],
  ["الدقة", "Daqqa", "صوص من الثوم والخل والكمون، بيتحط على الكشري والفتة.", "A sauce of garlic, vinegar and cumin, used on koshary and fatta."],
  ["التدميس", "Tadmees", "طهي الفول على نار هادية جداً لساعات طويلة.", "Slow-cooking fava beans over very low heat for many hours."],
  ["الدمّاسة / القدرة", "Dammasa / Qedra", "الحلة اللي بيتدمّس فيها الفول، وقدرة عربية الفول مشهورة.", "The pot used to slow-cook ful; the street cart's qedra is iconic."],
  ["العيش البلدي", "Aish Baladi", "الخبز المصري الأساسي من دقيق القمح، وكلمة «عيش» معناها حياة.", "Egypt's everyday wheat flatbread; \"aish\" also means life."],
  ["العيش الشمسي", "Aish Shamsi", "عيش صعيدي بيخمّر في الشمس قبل ما يتخبز.", "Upper Egyptian bread left to rise in the sun before baking."],
  ["السمنة البلدي", "Samna Baladi", "زبدة مسيّحة ومصفّاة، أساس كتير من الأكل المصري التقليدي.", "Clarified butter (ghee), the base of much traditional Egyptian cooking."],
  ["المخرطة", "Makhrata", "سكينة بإيدين ونصل مقوّس لفرم الملوخية.", "A two-handled curved blade used to mince molokhia."],
  ["المش", "Mish", "جبنة قديمة متعتقة بالشطة، بتاعة الفلاحين.", "Aged, spiced fermented cheese from the countryside."],
  ["الرقاق", "Roqaq", "عجينة رفيعة جداً ومقرمشة، بتتعمل في العيد باللحمة المفرومة.", "Very thin crisp dough sheets, layered with minced meat at Eid."],
  ["الشربات", "Sharbat", "في الحلويات: الشراب السكري اللي بيتصب على البسبوسة والكنافة.", "In sweets: the sugar syrup poured over basbousa and kunafa."],
  ["الفتة", "Fatta", "طبقات عيش محمص ورز وصوص الخل والثوم، وبيتحط فوقها لحمة.", "Layers of toasted bread, rice and garlic-vinegar sauce topped with meat."]
];
function renderGlossary() {
  const q = norm(document.getElementById('glossSearch').value.trim());
  document.getElementById('glossGrid').innerHTML = GLOSS.filter(g => !q || norm(g.join(' ')).includes(q)).map(g =>
    '<div class="gloss-item"><h4>' + (lang === 'ar' ? g[0] : g[1]) + '</h4><div class="tr">' + (lang === 'ar' ? g[1] : g[0]) + '</div><p>' + (lang === 'ar' ? g[2] : g[3]) + '</p></div>').join('') ||
    '<p style="text-align:center;color:var(--muted);grid-column:1/-1">' + T("مفيش نتايج.", "No results.") + '</p>';
}

/* ============ REVIEWS ============ */
const SAMPLE_REVIEWS = [
  { name: "Sarah J.", country: { ar: "المملكة المتحدة 🇬🇧", en: "UK 🇬🇧" }, stars: 5, ar: "الكشري كان تجربة لا تُنسى! مزيج النكهات والصلصة الحارة خلاني أحب أكل الشارع المصري.", en: "Koshary was unforgettable! The mix of flavors and spicy sauce made me fall in love with Egyptian street food." },
  { name: "Marco R.", country: { ar: "إيطاليا 🇮🇹", en: "Italy 🇮🇹" }, stars: 4.5, ar: "العيش البلدي طازة ورائع، والفول على الفطار اداني طاقة طول اليوم عند الأهرامات.", en: "The baladi bread is fresh and amazing, and ful for breakfast fueled a whole day at the Pyramids." },
  { name: "Elena P.", country: { ar: "روسيا 🇷🇺", en: "Russia 🇷🇺" }, stars: 5, ar: "الملوخية! كنت مترددة في الأول، لكن ريحة التقلية كانت ساحرة. أنصح بيها جداً.", en: "Molokhia! I was hesitant at first, but the smell of the garlic taqliya was magical. Highly recommended." }
];
function starsHTML(n) { let s = ''; for (let i = 1; i <= 5; i++) s += '<i class="fa-' + (n >= i ? 'solid fa-star' : n >= i - 0.5 ? 'solid fa-star-half-stroke' : 'regular fa-star') + '"></i>'; return s; }
function reviewHTML(r, mine) {
  const initials = r.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const country = typeof r.country === 'object' ? r.country[lang] : r.country;
  const text = mine ? r.text : r[lang];
  return '<div class="review-card' + (mine ? ' mine' : '') + '"><span class="review-tag">' + (mine ? T("تجربتك", "Your review") : T("مثال توضيحي", "Example")) + '</span>' +
    '<div class="reviewer-info"><div class="avatar">' + esc(initials) + '</div><div class="reviewer-details"><h4>' + esc(r.name) + '</h4>' + (country ? '<p>' + esc(country) + '</p>' : '') + '<div class="stars">' + starsHTML(r.stars) + '</div></div></div>' +
    '<p class="review-text">' + esc(text) + '</p></div>';
}
function renderReviews() {
  const mine = store.get('myReviews', []);
  document.getElementById('reviewsGrid').innerHTML = mine.map(r => reviewHTML(r, true)).join('') + SAMPLE_REVIEWS.map(r => reviewHTML(r, false)).join('');
}
function addReview(e) {
  e.preventDefault();
  const r = { name: document.getElementById('rvName').value.trim(), country: document.getElementById('rvCountry').value.trim(), stars: +document.getElementById('rvStars').value, text: document.getElementById('rvText').value.trim() };
  if (!r.name || !r.text) return;
  const mine = store.get('myReviews', []); mine.unshift(r); store.set('myReviews', mine.slice(0, 20));
  e.target.reset(); renderReviews();
  document.getElementById('reviewsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ============ QR ============ */
function openQrModal() {
  document.getElementById('qrModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
  const box = document.getElementById('qrcode'), url = location.href.split('?')[0].split('#')[0].replace(/[^\/]*$/, '');
  box.innerHTML = '';
  const local = location.protocol === 'file:';
  document.getElementById('qrWarn').style.display = local ? 'block' : 'none';
  box.style.display = local ? 'none' : 'inline-block';
  document.getElementById('currentUrlText').textContent = local ? '' : url;
  if (!local && window.QRCode) new QRCode(box, { text: url, width: 200, height: 200, colorDark: "#0B2B1B", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
}
function closeQrModal() { document.getElementById('qrModal').style.display = 'none'; document.body.style.overflow = ''; }

/* ============ NAV / THEME / LANGUAGE ============ */
function toggleMenu(force) {
  const m = document.getElementById('navMenu'), b = document.getElementById('menuBtn'), sc = document.getElementById('navScrim');
  const open = typeof force === 'boolean' ? force : !m.classList.contains('open');
  m.classList.toggle('open', open);
  if (sc) sc.classList.toggle('show', open);
  if (b) { b.setAttribute('aria-expanded', open); b.innerHTML = '<i class="fa-solid ' + (open ? 'fa-xmark' : 'fa-bars') + '"></i>'; }
}
document.querySelectorAll('#navMenu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });
function shareSite() {
  const url = location.protocol.startsWith('http') ? location.href.split('#')[0].replace(/[^\/]*$/, '') : '';
  const txt = T('نِبِت | NEBET — من قلب مصر… تبدأ الحكاية', 'NEBET | نِبِت — From the heart of Egypt, the story begins') + (url ? '\n' + url : '');
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
}

function currentTheme() {
  const t = document.documentElement.getAttribute('data-theme');
  if (t) return t;
  return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyThemeIcon() { document.getElementById('themeIcon').className = 'fa-solid ' + (currentTheme() === 'dark' ? 'fa-sun' : 'fa-moon'); }
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next); store.set('theme', next); applyThemeIcon();
}
function applyPlaceholders() { document.querySelectorAll('[data-ph-ar]').forEach(el => el.placeholder = el.getAttribute('data-ph-' + lang)); }
function setLanguage(l) {
  lang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  store.set('lang', l);
  applyPlaceholders(); renderRecipes();
  const has = id => document.getElementById(id);
  if (has('mapSvg')) renderMap();
  if (has('videoGrid')) renderVideos();
  if (has('quizBox')) renderQuiz();
  if (has('glossGrid')) renderGlossary();
  if (has('reviewsGrid')) renderReviews();
  if (has('aboutAuthor')) renderAbout();
  if (modal.classList.contains('is-open') && currentId) openModal(currentId);
}
function toggleLanguage() { setLanguage(lang === 'ar' ? 'en' : 'ar'); }

/* ============ SCROLL ============ */
function reveal() {
  const h = window.innerHeight;
  document.querySelectorAll('.reveal-up:not(.active), .reveal-zoom:not(.active), .reveal-right:not(.active), .reveal-left:not(.active)').forEach(el => {
    if (el.getBoundingClientRect().top < h - 80) el.classList.add('active');
  });
  document.getElementById('toTop').classList.toggle('show', window.scrollY > 600);
}
window.addEventListener('scroll', reveal, { passive: true });
window.addEventListener('click', e => { if (e.target === modal) closeModal(); if (e.target === document.getElementById('qrModal')) closeQrModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeQrModal(); } });

/* ============ ABOUT ============ */
function renderAbout() {
  const el = document.getElementById('aboutAuthor');
  const txt = ABOUT_AUTHOR[lang];
  el.style.display = txt ? '' : 'none';
  el.textContent = txt ? T("إعداد: ", "By: ") + txt : '';
}

/* Remove any old offline/app installation left from the previous version */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
  if (window.caches) caches.keys().then(ks => ks.forEach(k => caches.delete(k))).catch(() => {});
}

/* ============ INIT ============ */
(function init() {
  const th = store.get('theme', null);
  if (th) document.documentElement.setAttribute('data-theme', th);
  applyThemeIcon();
  if (EDIT) document.body.classList.add('edit-mode');
  decorateImages();
  // map.html#region=alex opens that region on the food map
  const rg = location.hash.match(/region=(\w+)/);
  if (rg && typeof REGIONS !== 'undefined' && REGIONS.some(x => x.id === rg[1])) activeRegion = rg[1];
  setLanguage(store.get('lang', 'ar'));
  // recipes.html#recipe=koshary opens that recipe; recipes.html#group-dessert jumps to a group
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('recipe=') && R[h.slice(7)]) openModal(h.slice(7));
  else if (h && document.getElementById(h)) setTimeout(() => document.getElementById(h).scrollIntoView(), 50);
  reveal();
})();
