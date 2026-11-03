// =========================================================
// Menu data — PLACEHOLDER items and prices, in English AND Arabic.
// Replace names, descriptions and prices with the real menu
// (each item has [English, Arabic] for its name and its description).
// Prices are stored in cents (e.g. 950 = $9.50) to avoid rounding errors.
// `combo: true` means the "make it a combo?" questions open after adding it.
// `tags` feed the Addict Specialties section: offer | combo | new | best
// =========================================================

export const BRAND = Object.freeze({
  name: 'The Addict',
  whatsapp: '96171181987', // +961 71 181 987 (digits only, international format)
  whatsappDisplay: '+961 71 181 987',
  facebook: 'https://www.facebook.com/share/1ADAJvsc5c/',
  instagram: 'https://www.instagram.com/theaddict.lb/',
  currency: '$',
});

export const CREDITS = Object.freeze({
  name: 'ghanawyyy',
  instagram: 'https://www.instagram.com/ghanawyyy/',
  phoneDisplay: '71 226 143',
  whatsapp: '96171226143',
});

export const CATEGORIES = Object.freeze([
  { id: 'specialties', name: { en: 'Addict Specialties', ar: 'أصناف أديكت المميّزة' } },
  { id: 'beef', name: { en: 'Beef Burgers', ar: 'برغر لحم' } },
  { id: 'chicken', name: { en: 'Chicken Burgers', ar: 'برغر دجاج' } },
  { id: 'sandwiches', name: { en: 'Sandwiches', ar: 'سندويشات' } },
  { id: 'extras', name: { en: 'Extras', ar: 'إضافات' } },
  { id: 'drinks', name: { en: 'Drinks', ar: 'مشروبات' } },
]);

export const TAG_KEYS = Object.freeze(['offer', 'combo', 'new', 'best']);

// I(id, category, [English name, Arabic name], [English description, Arabic description], price in cents, options)
const I = (id, cat, [en, ar], [den, dar], price, extra = {}) => Object.freeze({
  id, cat, name: { en, ar }, desc: { en: den, ar: dar }, price, combo: false, tags: [], ...extra,
});

export const ITEMS = Object.freeze([
  // Addict Specialties
  I('sp-addict', 'specialties', ['The Addict Burger', 'برغر ذا أديكت'], ['Double beef, smoked cheddar, caramelized onions, Addict sauce.', 'لحم بقر مزدوج، شيدر مدخّن، بصل مكرمل وصلصة أديكت.'], 950, { combo: true, tags: ['best'] }),
  I('sp-inferno', 'specialties', ['Inferno Burger', 'برغر إنفيرنو'], ['Beef patty, pepper jack, jalapeños, fiery chipotle mayo.', 'لحم بقر، جبنة بيبر جاك، هالابينو ومايونيز شيبوتلي حار.'], 900, { combo: true, tags: ['new'] }),
  I('sp-crispy', 'specialties', ['Crispy Addict Chicken', 'دجاج أديكت المقرمش'], ['Crunchy chicken thigh, pickles, slaw, honey-garlic glaze.', 'فخذ دجاج مقرمش، مخلل، سلطة ملفوف وصلصة العسل والثوم.'], 850, { combo: true, tags: ['best'] }),
  I('sp-truffle', 'specialties', ['Truffle Smash', 'ترافل سماش'], ['Two smashed patties, truffle mayo, Swiss cheese.', 'قطعتا لحم مضغوطتان، مايونيز الترافل وجبنة سويسرية.'], 1050, { combo: true, tags: ['new'] }),
  I('sp-duo', 'specialties', ['Duo Offer', 'عرض الثنائي'], ['2 classic burgers + 2 regular fries. Made for sharing.', '2 برغر كلاسيك و2 بطاطا عادية. مثالي للمشاركة.'], 1600, { tags: ['offer'] }),
  I('sp-midweek', 'specialties', ['Midweek Deal', 'عرض منتصف الأسبوع'], ['Any classic sandwich with fries and a drink.', 'أي سندويش كلاسيك مع بطاطا ومشروب.'], 800, { tags: ['offer'] }),
  I('sp-box', 'specialties', ['Addict Box', 'بوكس أديكت'], ['Burger, curly fries, onion rings and a drink.', 'برغر، بطاطا كيرلي، حلقات بصل ومشروب.'], 1200, { tags: ['combo'] }),
  I('sp-family', 'specialties', ['Family Feast', 'وجبة العائلة'], ['4 burgers, 2 large fries, 4 drinks.', '4 برغر، 2 بطاطا كبيرة و4 مشروبات.'], 3400, { tags: ['combo'] }),

  // Beef burgers
  I('bf-classic', 'beef', ['Classic Beef Burger', 'برغر لحم كلاسيك'], ['Beef patty, lettuce, tomato, pickles, house sauce.', 'لحم بقر، خس، بندورة، مخلل وصلصة البيت.'], 700, { combo: true }),
  I('bf-cheese', 'beef', ['Cheeseburger', 'تشيز برغر'], ['Beef patty, double cheddar, onions, ketchup & mustard.', 'لحم بقر، شيدر مزدوج، بصل، كاتشب وخردل.'], 750, { combo: true }),
  I('bf-mushroom', 'beef', ['Mushroom Swiss', 'ماشروم سويس'], ['Sautéed mushrooms, Swiss cheese, garlic mayo.', 'فطر سوتيه، جبنة سويسرية ومايونيز بالثوم.'], 850, { combo: true }),
  I('bf-bbq', 'beef', ['BBQ Smokehouse', 'باربكيو سموك هاوس'], ['Smoky BBQ sauce, crispy onions, cheddar, beef bacon.', 'صلصة باربكيو مدخّنة، بصل مقرمش، شيدر وبيكون بقر.'], 900, { combo: true }),
  I('bf-double', 'beef', ['Double Smash', 'دبل سماش'], ['Two smashed patties, American cheese, Addict sauce.', 'قطعتا لحم مضغوطتان، جبنة أميركية وصلصة أديكت.'], 950, { combo: true }),
  I('bf-blue', 'beef', ['Blue Cheese Burger', 'برغر بلو تشيز'], ['Blue cheese, rocca, caramelized onions.', 'جبنة زرقاء، روكا وبصل مكرمل.'], 900, { combo: true }),

  // Chicken burgers
  I('ch-crispy', 'chicken', ['Crispy Chicken', 'دجاج مقرمش'], ['Crispy fillet, lettuce, mayo, pickles.', 'فيليه مقرمش، خس، مايونيز ومخلل.'], 650, { combo: true }),
  I('ch-spicy', 'chicken', ['Spicy Chicken', 'دجاج حار'], ['Crispy fillet, spicy mayo, jalapeños, slaw.', 'فيليه مقرمش، مايونيز حار، هالابينو وسلطة ملفوف.'], 700, { combo: true }),
  I('ch-grilled', 'chicken', ['Grilled Chicken', 'دجاج مشوي'], ['Grilled breast, garlic sauce, tomato, lettuce.', 'صدر دجاج مشوي، صلصة ثوم، بندورة وخس.'], 700, { combo: true }),
  I('ch-ranch', 'chicken', ['Chicken Ranch', 'دجاج رانش'], ['Crispy fillet, ranch, cheddar, beef bacon.', 'فيليه مقرمش، صلصة رانش، شيدر وبيكون بقر.'], 800, { combo: true }),
  I('ch-honey', 'chicken', ['Honey Mustard Chicken', 'دجاج هني ماستارد'], ['Grilled chicken, honey mustard, Swiss cheese.', 'دجاج مشوي، صلصة العسل والخردل وجبنة سويسرية.'], 750, { combo: true }),

  // Sandwiches
  I('sw-tawouk', 'sandwiches', ['Chicken Tawouk', 'طاووق'], ['Marinated chicken, garlic toum, pickles, fries inside.', 'دجاج متبّل، ثوم، مخلل وبطاطا في الداخل.'], 550, { combo: true }),
  I('sw-philly', 'sandwiches', ['Philly Steak', 'فيلي ستيك'], ['Sliced steak, peppers, onions, melted cheese.', 'شرائح ستيك، فليفلة، بصل وجبنة ذائبة.'], 850, { combo: true }),
  I('sw-sub', 'sandwiches', ['Chicken Sub', 'صب دجاج'], ['Grilled chicken, mozzarella, mushrooms, sub roll.', 'دجاج مشوي، موزاريلا وفطر في خبز الصب.'], 750, { combo: true }),
  I('sw-hotdog', 'sandwiches', ['Addict Hot Dog', 'هوت دوغ أديكت'], ['Beef sausage, crispy onions, mustard, ketchup.', 'نقانق بقر، بصل مقرمش، خردل وكاتشب.'], 500, { combo: true }),
  I('sw-club', 'sandwiches', ['Club Sandwich', 'كلوب ساندويش'], ['Chicken, turkey, cheese, egg, lettuce, tomato.', 'دجاج، حبش، جبنة، بيض، خس وبندورة.'], 800, { combo: true }),
  I('sw-francisco', 'sandwiches', ['Francisco', 'فرانسيسكو'], ['Chicken strips, corn, mushrooms, cheese.', 'شرائح دجاج، ذرة، فطر وجبنة.'], 700, { combo: true }),

  // Extras
  I('ex-fries', 'extras', ['Regular Fries', 'بطاطا عادية'], ['Golden, crispy, lightly salted.', 'ذهبية ومقرمشة مع رشّة ملح.'], 250),
  I('ex-curly', 'extras', ['Curly Fries', 'بطاطا كيرلي'], ['Seasoned curly fries.', 'بطاطا حلزونية متبّلة.'], 350),
  I('ex-rings', 'extras', ['Onion Rings', 'حلقات البصل'], ['8 crispy onion rings with dip.', '8 حلقات بصل مقرمشة مع صلصة.'], 400),
  I('ex-mozz', 'extras', ['Mozzarella Sticks', 'أصابع موزاريلا'], ['6 sticks with marinara dip.', '6 أصابع مع صلصة مارينارا.'], 500),
  I('ex-wings', 'extras', ['Spicy Wings', 'أجنحة حارة'], ['6 wings tossed in buffalo sauce.', '6 أجنحة بصلصة البافلو.'], 600),
  I('ex-sauce', 'extras', ['Extra Sauce', 'صلصة إضافية'], ['Addict, garlic, BBQ or spicy mayo.', 'أديكت، ثوم، باربكيو أو مايونيز حار.'], 75),

  // Drinks
  I('dr-cola', 'drinks', ['Cola', 'كولا'], ['Can, 330 ml.', 'علبة، 330 مل.'], 150, { drink: true }),
  I('dr-diet', 'drinks', ['Diet Cola', 'كولا دايت'], ['Can, 330 ml.', 'علبة، 330 مل.'], 150, { drink: true }),
  I('dr-lemon', 'drinks', ['Lemon Soda', 'صودا ليمون'], ['Can, 330 ml.', 'علبة، 330 مل.'], 150, { drink: true }),
  I('dr-orange', 'drinks', ['Orange Soda', 'صودا برتقال'], ['Can, 330 ml.', 'علبة، 330 مل.'], 150, { drink: true }),
  I('dr-water', 'drinks', ['Water', 'مياه'], ['Bottle, 500 ml.', 'قنينة، 500 مل.'], 75, { drink: true }),
  I('dr-icetea', 'drinks', ['Iced Tea', 'شاي مثلّج'], ['Peach or lemon.', 'دراق أو ليمون.'], 200, { drink: true }),
  I('dr-lemonade', 'drinks', ['Fresh Lemonade', 'ليموناضة طازجة'], ['Squeezed daily, with mint.', 'معصورة يومياً مع النعناع.'], 300, { drink: true }),
  I('dr-shake', 'drinks', ['Milkshake', 'ميلك شيك'], ['Vanilla, chocolate or strawberry.', 'فانيلا، شوكولا أو فراولة.'], 450, { drink: true }),
]);

// Combo choices (added on top of a sandwich/burger)
export const COMBO_REGULAR = Object.freeze([
  { id: 'cr-small', name: { en: 'Small fries', ar: 'بطاطا صغيرة' }, price: 200 },
  { id: 'cr-large', name: { en: 'Large fries', ar: 'بطاطا كبيرة' }, price: 300 },
  { id: 'cr-wedges', name: { en: 'Wedges fries', ar: 'بطاطا ودجز' }, price: 300 },
  { id: 'cr-curly', name: { en: 'Curly fries', ar: 'بطاطا كيرلي' }, price: 350 },
]);

export const COMBO_SPECIAL = Object.freeze([
  { id: 'sf-cheese', name: { en: 'Cheese Fries', ar: 'بطاطا بالجبنة' }, price: 450 },
  { id: 'sf-bacon', name: { en: 'Bacon Cheddar Fries', ar: 'بطاطا بيكون وشيدر' }, price: 550 },
  { id: 'sf-truffle', name: { en: 'Truffle Parmesan Fries', ar: 'بطاطا ترافل وبارميزان' }, price: 550 },
  { id: 'sf-buffalo', name: { en: 'Buffalo Fries', ar: 'بطاطا بافلو' }, price: 500 },
  { id: 'sf-garlic', name: { en: 'Garlic Aioli Fries', ar: 'بطاطا أيولي بالثوم' }, price: 450 },
  { id: 'sf-chili', name: { en: 'Chili Cheese Fries', ar: 'بطاطا تشيلي تشيز' }, price: 550 },
  { id: 'sf-jalapeno', name: { en: 'Jalapeño Ranch Fries', ar: 'بطاطا هالابينو رانش' }, price: 500 },
  { id: 'sf-loaded', name: { en: 'Addict Loaded Fries', ar: 'بطاطا أديكت المحمّلة' }, price: 650 },
]);

export const ITEM_BY_ID = new Map(ITEMS.map((it) => [it.id, it]));
export const COMBO_BY_ID = new Map([...COMBO_REGULAR, ...COMBO_SPECIAL].map((c) => [c.id, c]));
export const DRINKS = ITEMS.filter((it) => it.drink);

export const LIMITS = Object.freeze({
  maxQty: 50,          // per item
  maxDrinkQty: 30,
  noteLen: 500,        // per-item note
  orderNoteLen: 800,
  nameMin: 2,
  nameMax: 60,
  addressMin: 6,
  addressMax: 300,
  searchLen: 60,
});

export function money(cents) {
  return `${BRAND.currency}${(cents / 100).toFixed(2)}`;
}
