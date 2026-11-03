// =========================================================
// Two separate languages: English (LTR) and Arabic (RTL).
// The whole site switches at once; nothing is mixed.
// Preference is remembered on this device (localStorage).
// =========================================================

const KEY = 'addict-lang';
const listeners = new Set();

const STRINGS = {
  en: {
    'meta.title': 'The Addict | Your food addiction starts here!!',
    'meta.desc': 'The Addict: burgers, sandwiches, combos and loaded fries. Pick your order and send it straight to WhatsApp.',
    'brand': 'The Addict',
    'lang.label': 'Language',

    'nav.specialties': 'Specialties',
    'nav.menu': 'Menu',
    'nav.contact': 'Contact',
    'nav.top': 'The Addict, back to top',
    'nav.openOrder': 'Open your order',
    'nav.sections': 'Sections',

    'intro.skip': 'Skip',

    'hero.label': 'Welcome',
    // motto, split so the key word can be highlighted in red
    'motto.a': 'Your food ',
    'motto.b': 'addiction',
    'motto.c': ' starts here!!',
    'hero.menu': 'Go to the menu',
    'hero.specialties': 'Go to the specialties',
    'hero.contact': 'Contact us',
    'hero.cue': 'Scroll to the specialties',

    'spec.eyebrow': 'Only at The Addict',
    'spec.title': 'Addict Specialties',
    'spec.lead': 'Special offers, combos, new items and our bestsellers.',
    'spec.filters': 'Filter specialties',
    'spec.track': 'Specialties, swipe for more',
    'spec.prev': 'Previous specialties',
    'spec.next': 'More specialties',
    'spec.all': 'All',
    'spec.offer': 'Offers',
    'spec.combo': 'Combos',
    'spec.new': 'New',
    'spec.best': 'Bestsellers',

    'tag.offer': 'Special offer',
    'tag.combo': 'Combo',
    'tag.new': 'New',
    'tag.best': 'Bestseller',

    'menu.eyebrow': 'Fresh off the grill',
    'menu.title': 'Our Menu',
    'menu.categories': 'Menu categories',
    'menu.prevCat': 'Previous category',
    'menu.nextCat': 'Next category',
    'menu.swipe': 'Swipe left or right to switch categories',
    'menu.count': ({ n }) => `${n} items`,
    'menu.endTitle': ({ cat }) => `That's all in ${cat}`,
    'menu.endText': 'Questions or special requests? Reach The Addict directly:',
    'menu.next': ({ cat }) => `Next: ${cat}`,
    'menu.backTo': ({ cat }) => `Back to ${cat}`,

    'search.label': 'Search the menu',
    'search.placeholder': 'Search burgers, sandwiches, drinks…',
    'search.clear': 'Clear search',
    'search.results': ({ n, q }) => `${n} result${n === 1 ? '' : 's'} for “${q}”`,
    'search.none': 'Nothing found',
    'search.noneText': ({ q }) => `We couldn't find “${q}”. Try another word.`,
    'search.showAll': 'Show the full menu',

    'card.add': 'Add',
    'card.addName': ({ name }) => `Add ${name}`,
    'qty.dec': ({ name }) => `Remove one ${name}`,
    'qty.inc': ({ name }) => `Add one more ${name}`,
    'qty.label': ({ name }) => `${name} quantity`,

    'contact.eyebrow': 'Stay addicted',
    'contact.title': 'Contact us',
    'contact.lead': "Order, ask or say hi. We're one tap away.",
    'contact.waK': 'Order & delivery',
    'contact.waGo': 'Chat on WhatsApp',
    'contact.waMini': 'WhatsApp',
    'contact.igK': 'Instagram',
    'contact.igGo': 'Follow us',
    'contact.fbK': 'Facebook',
    'contact.fbV': 'The Addict',
    'contact.fbGo': 'Like our page',

    'credits.by': 'Website by',
    'credits.ig': 'ghanawyyy on Instagram',
    'credits.work': 'Interested to work with us?',
    'credits.copy': ({ y }) => `© ${y} The Addict. All rights reserved.`,

    'bar.view': 'View order',
    'bar.aria': 'View your order',
    'toTop': 'Back to top',
    'toast.added': 'Added to your order 🔥',

    'sheet.back': 'Back',
    'sheet.close': 'Close',

    'flow.title': 'Combo & drink',
    'flow.label': 'Combo and drinks',
    'flow.each': ({ price }) => `${price} each`,
    'flow.comboQ': 'Make it a combo?',
    'flow.comboHint': ({ name }) => `Add fries to your ${name}.`,
    'flow.yesCombo': 'Yes, combo',
    'flow.yesComboSub': 'Regular or special fries',
    'flow.noCombo': 'No combo',
    'flow.noComboSub': 'Just the sandwich',
    'flow.backMenu': 'Back to menu',
    'flow.skip': 'Skip',
    'flow.typeQ': 'Pick your combo',
    'flow.typeHint': 'One combo per sandwich. You can mix both types.',
    'flow.regular': 'Regular combo',
    'flow.regularSub': 'Small, large, wedges or curly fries',
    'flow.special': 'Special fries',
    'flow.specialSub': ({ n }) => `${n} loaded fries to choose from`,
    'flow.drinks': 'Drinks',
    'flow.chosen': 'Combos chosen',
    'flow.matched': ({ q }) => `All ${q} sandwich${q > 1 ? 'es' : ''} matched ✓`,
    'flow.regularHint': 'Choose the fries for each sandwich.',
    'flow.specialHint': ({ n }) => `Swipe to see all ${n}: loaded and saucy.`,
    'flow.nextDrinks': 'Next: drinks',
    'flow.drinkQ': 'Add a drink?',
    'flow.drinkHint': 'Something cold on the side.',
    'flow.yesDrink': 'Yes, a drink',
    'flow.yesDrinkSub': ({ n }) => `${n} drinks to pick from`,
    'flow.noDrink': 'No drink',
    'flow.noDrinkSub': 'Back to the menu',
    'flow.drinksQ': 'Pick your drinks',
    'flow.drinksHint': 'Swipe for more.',
    'flow.done': 'Done',
    'flow.back': 'Back',
    'flow.addN': ({ n }) => `Add ×${n}`,
    'flow.addNAria': ({ n, name }) => `Add ${n} ${name}`,

    'combo.regular': ({ name }) => `Regular combo · ${name}`,
    'combo.special': ({ name }) => `Special fries · ${name}`,

    'cart.title': 'Your order',
    'cart.detailsTitle': 'Delivery details',
    'cart.sentTitle': 'Order sent',
    'cart.items': 'Items',
    'cart.itemsCount': ({ n }) => `${n} item${n === 1 ? '' : 's'}`,
    'cart.total': 'Total',
    'cart.empty': 'Your order is empty',
    'cart.emptyText': 'Pick something tasty from the menu.',
    'cart.browse': 'Browse the menu',
    'cart.continue': 'Continue',
    'cart.keep': 'Keep ordering',
    'cart.editCombo': 'Combo & drinks ›',
    'cart.note': 'Note for this item',
    'cart.optional': '(optional)',
    'cart.notePh': 'e.g. no onions, extra sauce, well done…',
    'cart.almost': 'Almost done! Tell us where to deliver.',
    'cart.name': 'Your name',
    'cart.namePh': 'e.g. Rami',
    'cart.nameErr': 'Please write your name.',
    'cart.address': 'Delivery address',
    'cart.addressPh': 'Area, street, building, floor, landmark…',
    'cart.addressErr': 'Please write your full delivery address.',
    'cart.orderNote': 'Notes for the whole order',
    'cart.orderNotePh': 'e.g. ring the bell, extra napkins…',
    'cart.preview': 'Preview the WhatsApp message',
    'cart.fine': ({ phone }) => `Your order opens in WhatsApp, ready to send to ${phone}. Our team confirms the final total with you.`,
    'cart.send': 'Send on WhatsApp',
    'cart.back': 'Back',
    'cart.sentH': 'Almost there!',
    'cart.sentP': 'Your order is ready in WhatsApp, just press send. We will confirm it with you shortly.',
    'cart.retry': 'WhatsApp did not open? Tap here',
    'cart.new': 'Start a new order',
    'cart.close': 'Close',

    'msg.hello': 'Hello Addict, how are you? 👋',
    'msg.order': '🧾 *My order:*',
    'msg.note': '📝 Note:',
    'msg.orderNotes': '🗒️ Order notes:',
    'msg.total': ({ t }) => `💵 *Total: ${t}*`,
    'msg.name': '👤 Name:',
    'msg.address': '📍 Address:',
    'msg.thanks': 'Thank you!',

    'nojs': 'Please turn on JavaScript to browse the menu and order. You can also order on WhatsApp: +961 71 181 987.',
  },

  ar: {
    'meta.title': 'ذا أديكت | إدمانك على الأكل يبدأ هنا!!',
    'meta.desc': 'ذا أديكت: برغر، سندويشات، كومبو وبطاطا محمّلة. اختر طلبك وأرسله مباشرة عبر واتساب.',
    'brand': 'ذا أديكت',
    'lang.label': 'اللغة',

    'nav.specialties': 'المميّزة',
    'nav.menu': 'القائمة',
    'nav.contact': 'تواصل معنا',
    'nav.top': 'ذا أديكت، العودة إلى الأعلى',
    'nav.openOrder': 'افتح طلبك',
    'nav.sections': 'الأقسام',

    'intro.skip': 'تخطَّ',

    'hero.label': 'أهلاً وسهلاً',
    'motto.a': '',
    'motto.b': 'إدمانك',
    'motto.c': ' على الأكل يبدأ هنا!!',
    'hero.menu': 'اذهب إلى القائمة',
    'hero.specialties': 'اذهب إلى الأصناف المميّزة',
    'hero.contact': 'تواصل معنا',
    'hero.cue': 'انزل إلى الأصناف المميّزة',

    'spec.eyebrow': 'فقط عند ذا أديكت',
    'spec.title': 'أصناف أديكت المميّزة',
    'spec.lead': 'العروض الخاصة، الكومبو، الأصناف الجديدة والأكثر طلباً.',
    'spec.filters': 'تصفية الأصناف المميّزة',
    'spec.track': 'الأصناف المميّزة، اسحب للمزيد',
    'spec.prev': 'الأصناف السابقة',
    'spec.next': 'المزيد من الأصناف',
    'spec.all': 'الكل',
    'spec.offer': 'العروض',
    'spec.combo': 'الكومبو',
    'spec.new': 'الجديد',
    'spec.best': 'الأكثر طلباً',

    'tag.offer': 'عرض خاص',
    'tag.combo': 'كومبو',
    'tag.new': 'جديد',
    'tag.best': 'الأكثر طلباً',

    'menu.eyebrow': 'طازج من الشوّاية',
    'menu.title': 'قائمتنا',
    'menu.categories': 'أقسام القائمة',
    'menu.prevCat': 'القسم السابق',
    'menu.nextCat': 'القسم التالي',
    'menu.swipe': 'اسحب يميناً أو يساراً للتنقّل بين الأقسام',
    'menu.count': ({ n }) => `عدد الأصناف: ${n}`,
    'menu.endTitle': ({ cat }) => `هذا كل ما في ${cat}`,
    'menu.endText': 'أسئلة أو طلبات خاصة؟ تواصل مع ذا أديكت مباشرة:',
    'menu.next': ({ cat }) => `التالي: ${cat}`,
    'menu.backTo': ({ cat }) => `العودة إلى ${cat}`,

    'search.label': 'ابحث في القائمة',
    'search.placeholder': 'ابحث عن برغر، سندويش، مشروب…',
    'search.clear': 'امسح البحث',
    'search.results': ({ n, q }) => `عدد النتائج لـ «${q}»: ${n}`,
    'search.none': 'لا توجد نتائج',
    'search.noneText': ({ q }) => `لم نجد «${q}». جرّب كلمة أخرى.`,
    'search.showAll': 'اعرض القائمة كاملة',

    'card.add': 'أضف',
    'card.addName': ({ name }) => `أضف ${name}`,
    'qty.dec': ({ name }) => `أزل قطعة من ${name}`,
    'qty.inc': ({ name }) => `أضف قطعة أخرى من ${name}`,
    'qty.label': ({ name }) => `كمية ${name}`,

    'contact.eyebrow': 'خلّيك أديكت',
    'contact.title': 'تواصل معنا',
    'contact.lead': 'اطلب، اسأل أو سلّم علينا. نحن على بُعد نقرة.',
    'contact.waK': 'الطلب والتوصيل',
    'contact.waGo': 'راسلنا على واتساب',
    'contact.waMini': 'واتساب',
    'contact.igK': 'إنستغرام',
    'contact.igGo': 'تابعنا',
    'contact.fbK': 'فيسبوك',
    'contact.fbV': 'ذا أديكت',
    'contact.fbGo': 'أعجب بصفحتنا',

    'credits.by': 'تصميم وتطوير',
    'credits.ig': 'ghanawyyy على إنستغرام',
    'credits.work': 'مهتم بالعمل معنا؟',
    'credits.copy': ({ y }) => `© ${y} ذا أديكت. جميع الحقوق محفوظة.`,

    'bar.view': 'عرض الطلب',
    'bar.aria': 'اعرض طلبك',
    'toTop': 'العودة إلى الأعلى',
    'toast.added': 'أُضيف إلى طلبك 🔥',

    'sheet.back': 'رجوع',
    'sheet.close': 'إغلاق',

    'flow.title': 'كومبو ومشروب',
    'flow.label': 'الكومبو والمشروبات',
    'flow.each': ({ price }) => `${price} للقطعة`,
    'flow.comboQ': 'هل تريدها وجبة كومبو؟',
    'flow.comboHint': ({ name }) => `أضف بطاطا إلى ${name}.`,
    'flow.yesCombo': 'نعم، كومبو',
    'flow.yesComboSub': 'بطاطا عادية أو مميّزة',
    'flow.noCombo': 'بدون كومبو',
    'flow.noComboSub': 'السندويش فقط',
    'flow.backMenu': 'العودة إلى القائمة',
    'flow.skip': 'تخطَّ',
    'flow.typeQ': 'اختر الكومبو',
    'flow.typeHint': 'كومبو واحد لكل سندويش، ويمكنك المزج بين النوعين.',
    'flow.regular': 'كومبو عادي',
    'flow.regularSub': 'بطاطا صغيرة، كبيرة، ودجز أو كيرلي',
    'flow.special': 'بطاطا مميّزة',
    'flow.specialSub': ({ n }) => `اختر من ${n} أنواع بطاطا محمّلة`,
    'flow.drinks': 'المشروبات',
    'flow.chosen': 'الكومبو المختار',
    'flow.matched': ({ q }) => `تمّت مطابقة كل السندويشات (${q}) ✓`,
    'flow.regularHint': 'اختر البطاطا لكل سندويش.',
    'flow.specialHint': ({ n }) => `اسحب لرؤية الأنواع الـ${n}، محمّلة بالصلصات.`,
    'flow.nextDrinks': 'التالي: المشروبات',
    'flow.drinkQ': 'هل تريد مشروباً؟',
    'flow.drinkHint': 'شيء بارد إلى جانب طلبك.',
    'flow.yesDrink': 'نعم، مشروب',
    'flow.yesDrinkSub': ({ n }) => `اختر من ${n} مشروبات`,
    'flow.noDrink': 'بدون مشروب',
    'flow.noDrinkSub': 'العودة إلى القائمة',
    'flow.drinksQ': 'اختر مشروباتك',
    'flow.drinksHint': 'اسحب للمزيد.',
    'flow.done': 'تم',
    'flow.back': 'رجوع',
    'flow.addN': ({ n }) => `أضف ×${n}`,
    'flow.addNAria': ({ n, name }) => `أضف ${n} من ${name}`,

    'combo.regular': ({ name }) => `كومبو عادي · ${name}`,
    'combo.special': ({ name }) => `بطاطا مميّزة · ${name}`,

    'cart.title': 'طلبك',
    'cart.detailsTitle': 'تفاصيل التوصيل',
    'cart.sentTitle': 'تم تجهيز الطلب',
    'cart.items': 'عدد القطع',
    'cart.itemsCount': ({ n }) => `${n}`,
    'cart.total': 'المجموع',
    'cart.empty': 'طلبك فارغ',
    'cart.emptyText': 'اختر شيئاً لذيذاً من القائمة.',
    'cart.browse': 'تصفّح القائمة',
    'cart.continue': 'متابعة',
    'cart.keep': 'تابع الطلب',
    'cart.editCombo': 'الكومبو والمشروبات ›',
    'cart.note': 'ملاحظة لهذا الصنف',
    'cart.optional': '(اختياري)',
    'cart.notePh': 'مثلاً: بدون بصل، صلصة إضافية، استواء كامل…',
    'cart.almost': 'اقتربنا! أخبرنا أين نوصل طلبك.',
    'cart.name': 'اسمك',
    'cart.namePh': 'مثلاً: رامي',
    'cart.nameErr': 'يرجى كتابة اسمك.',
    'cart.address': 'عنوان التوصيل',
    'cart.addressPh': 'المنطقة، الشارع، المبنى، الطابق، علامة مميّزة…',
    'cart.addressErr': 'يرجى كتابة عنوان التوصيل كاملاً.',
    'cart.orderNote': 'ملاحظات للطلب كله',
    'cart.orderNotePh': 'مثلاً: اقرع الجرس، محارم إضافية…',
    'cart.preview': 'معاينة رسالة واتساب',
    'cart.fine': ({ phone }) => `سيُفتح طلبك في واتساب جاهزاً للإرسال إلى ${phone}. سيؤكّد فريقنا المجموع النهائي معك.`,
    'cart.send': 'أرسل عبر واتساب',
    'cart.back': 'رجوع',
    'cart.sentH': 'تقريباً انتهينا!',
    'cart.sentP': 'طلبك جاهز في واتساب، فقط اضغط إرسال. سنؤكّده معك قريباً.',
    'cart.retry': 'لم يُفتح واتساب؟ اضغط هنا',
    'cart.new': 'ابدأ طلباً جديداً',
    'cart.close': 'إغلاق',

    'msg.hello': 'مرحبا أديكت، كيفكن؟ 👋',
    'msg.order': '🧾 *طلبي:*',
    'msg.note': '📝 ملاحظة:',
    'msg.orderNotes': '🗒️ ملاحظات الطلب:',
    'msg.total': ({ t }) => `💵 *المجموع: ${t}*`,
    'msg.name': '👤 الاسم:',
    'msg.address': '📍 العنوان:',
    'msg.thanks': 'شكراً!',

    'nojs': 'يرجى تفعيل JavaScript لتصفّح القائمة والطلب. يمكنك أيضاً الطلب عبر واتساب: ‎+961 71 181 987.',
  },
};

function initialLang() {
  // boot.js already set <html lang> before the first paint
  return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

let lang = initialLang();

export const getLang = () => lang;
export const isRtl = () => lang === 'ar';
export const dirSign = () => (lang === 'ar' ? -1 : 1); // scrollLeft runs negative in RTL

export function t(key, params = {}) {
  const v = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  return typeof v === 'function' ? v(params) : v;
}

// Pick the current language from a { en, ar } pair
export function L(pair) {
  if (pair == null || typeof pair === 'string') return pair ?? '';
  return pair[lang] ?? pair.en ?? '';
}

// Keep numbers/prices in the right order inside Arabic text (WhatsApp message)
export function iso(text) {
  return lang === 'ar' ? `⁦${text}⁩` : String(text);
}

export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// Update every static text marked with data-i18n / data-i18n-attr
export function applyStatic(root = document) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.desc'));
  for (const node of root.querySelectorAll('[data-i18n]')) {
    const v = t(node.dataset.i18n, { y: new Date().getFullYear() });
    if (node.textContent !== v) node.textContent = v;
  }
  for (const node of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of node.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) node.setAttribute(attr, t(key));
    }
  }
  for (const b of document.querySelectorAll('[data-lang]')) {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  }
  document.querySelector('.lang')?.setAttribute('data-active', lang);
  html.removeAttribute('data-pending');
}

export function setLang(next) {
  if (next !== 'en' && next !== 'ar') return;
  try { localStorage.setItem(KEY, next); } catch { /* private mode: still switches for this visit */ }
  if (next === lang) return;
  lang = next;
  applyStatic();
  for (const fn of listeners) fn(lang);
}
