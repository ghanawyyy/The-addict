// =========================================================
// Menu data — PLACEHOLDER items and prices.
// Replace names, descriptions and prices with the real menu.
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
  { id: 'specialties', name: 'Addict Specialties' },
  { id: 'beef', name: 'Beef Burgers' },
  { id: 'chicken', name: 'Chicken Burgers' },
  { id: 'sandwiches', name: 'Sandwiches' },
  { id: 'extras', name: 'Extras' },
  { id: 'drinks', name: 'Drinks' },
]);

export const TAGS = Object.freeze({
  offer: 'Special offer',
  combo: 'Combo',
  new: 'New',
  best: 'Bestseller',
});

const I = (id, cat, name, desc, price, extra = {}) => Object.freeze({ id, cat, name, desc, price, combo: false, tags: [], ...extra });

export const ITEMS = Object.freeze([
  // Addict Specialties
  I('sp-addict', 'specialties', 'The Addict Burger', 'Double beef, smoked cheddar, caramelized onions, Addict sauce.', 950, { combo: true, tags: ['best'] }),
  I('sp-inferno', 'specialties', 'Inferno Burger', 'Beef patty, pepper jack, jalapeños, fiery chipotle mayo.', 900, { combo: true, tags: ['new'] }),
  I('sp-crispy', 'specialties', 'Crispy Addict Chicken', 'Crunchy chicken thigh, pickles, slaw, honey-garlic glaze.', 850, { combo: true, tags: ['best'] }),
  I('sp-truffle', 'specialties', 'Truffle Smash', 'Two smashed patties, truffle mayo, Swiss cheese.', 1050, { combo: true, tags: ['new'] }),
  I('sp-duo', 'specialties', 'Duo Offer', '2 classic burgers + 2 regular fries. Made for sharing.', 1600, { tags: ['offer'] }),
  I('sp-midweek', 'specialties', 'Midweek Deal', 'Any classic sandwich with fries and a drink.', 800, { tags: ['offer'] }),
  I('sp-box', 'specialties', 'Addict Box', 'Burger, curly fries, onion rings and a drink.', 1200, { tags: ['combo'] }),
  I('sp-family', 'specialties', 'Family Feast', '4 burgers, 2 large fries, 4 drinks.', 3400, { tags: ['combo'] }),

  // Beef burgers
  I('bf-classic', 'beef', 'Classic Beef Burger', 'Beef patty, lettuce, tomato, pickles, house sauce.', 700, { combo: true }),
  I('bf-cheese', 'beef', 'Cheeseburger', 'Beef patty, double cheddar, onions, ketchup & mustard.', 750, { combo: true }),
  I('bf-mushroom', 'beef', 'Mushroom Swiss', 'Sautéed mushrooms, Swiss cheese, garlic mayo.', 850, { combo: true }),
  I('bf-bbq', 'beef', 'BBQ Smokehouse', 'Smoky BBQ sauce, crispy onions, cheddar, beef bacon.', 900, { combo: true }),
  I('bf-double', 'beef', 'Double Smash', 'Two smashed patties, American cheese, Addict sauce.', 950, { combo: true }),
  I('bf-blue', 'beef', 'Blue Cheese Burger', 'Blue cheese, rocca, caramelized onions.', 900, { combo: true }),

  // Chicken burgers
  I('ch-crispy', 'chicken', 'Crispy Chicken', 'Crispy fillet, lettuce, mayo, pickles.', 650, { combo: true }),
  I('ch-spicy', 'chicken', 'Spicy Chicken', 'Crispy fillet, spicy mayo, jalapeños, slaw.', 700, { combo: true }),
  I('ch-grilled', 'chicken', 'Grilled Chicken', 'Grilled breast, garlic sauce, tomato, lettuce.', 700, { combo: true }),
  I('ch-ranch', 'chicken', 'Chicken Ranch', 'Crispy fillet, ranch, cheddar, beef bacon.', 800, { combo: true }),
  I('ch-honey', 'chicken', 'Honey Mustard Chicken', 'Grilled chicken, honey mustard, Swiss cheese.', 750, { combo: true }),

  // Sandwiches
  I('sw-tawouk', 'sandwiches', 'Chicken Tawouk', 'Marinated chicken, garlic toum, pickles, fries inside.', 550, { combo: true }),
  I('sw-philly', 'sandwiches', 'Philly Steak', 'Sliced steak, peppers, onions, melted cheese.', 850, { combo: true }),
  I('sw-sub', 'sandwiches', 'Chicken Sub', 'Grilled chicken, mozzarella, mushrooms, sub roll.', 750, { combo: true }),
  I('sw-hotdog', 'sandwiches', 'Addict Hot Dog', 'Beef sausage, crispy onions, mustard, ketchup.', 500, { combo: true }),
  I('sw-club', 'sandwiches', 'Club Sandwich', 'Chicken, turkey, cheese, egg, lettuce, tomato.', 800, { combo: true }),
  I('sw-francisco', 'sandwiches', 'Francisco', 'Chicken strips, corn, mushrooms, cheese.', 700, { combo: true }),

  // Extras
  I('ex-fries', 'extras', 'Regular Fries', 'Golden, crispy, lightly salted.', 250),
  I('ex-curly', 'extras', 'Curly Fries', 'Seasoned curly fries.', 350),
  I('ex-rings', 'extras', 'Onion Rings', '8 crispy onion rings with dip.', 400),
  I('ex-mozz', 'extras', 'Mozzarella Sticks', '6 sticks with marinara dip.', 500),
  I('ex-wings', 'extras', 'Spicy Wings', '6 wings tossed in buffalo sauce.', 600),
  I('ex-sauce', 'extras', 'Extra Sauce', 'Addict, garlic, BBQ or spicy mayo.', 75),

  // Drinks
  I('dr-cola', 'drinks', 'Cola', 'Can, 330 ml.', 150, { drink: true }),
  I('dr-diet', 'drinks', 'Diet Cola', 'Can, 330 ml.', 150, { drink: true }),
  I('dr-lemon', 'drinks', 'Lemon Soda', 'Can, 330 ml.', 150, { drink: true }),
  I('dr-orange', 'drinks', 'Orange Soda', 'Can, 330 ml.', 150, { drink: true }),
  I('dr-water', 'drinks', 'Water', 'Bottle, 500 ml.', 75, { drink: true }),
  I('dr-icetea', 'drinks', 'Iced Tea', 'Peach or lemon.', 200, { drink: true }),
  I('dr-lemonade', 'drinks', 'Fresh Lemonade', 'Squeezed daily, with mint.', 300, { drink: true }),
  I('dr-shake', 'drinks', 'Milkshake', 'Vanilla, chocolate or strawberry.', 450, { drink: true }),
]);

// Combo choices (added on top of a sandwich/burger)
export const COMBO_REGULAR = Object.freeze([
  { id: 'cr-small', name: 'Small fries', price: 200 },
  { id: 'cr-large', name: 'Large fries', price: 300 },
  { id: 'cr-wedges', name: 'Wedges fries', price: 300 },
  { id: 'cr-curly', name: 'Curly fries', price: 350 },
]);

export const COMBO_SPECIAL = Object.freeze([
  { id: 'sf-cheese', name: 'Cheese Fries', price: 450 },
  { id: 'sf-bacon', name: 'Bacon Cheddar Fries', price: 550 },
  { id: 'sf-truffle', name: 'Truffle Parmesan Fries', price: 550 },
  { id: 'sf-buffalo', name: 'Buffalo Fries', price: 500 },
  { id: 'sf-garlic', name: 'Garlic Aioli Fries', price: 450 },
  { id: 'sf-chili', name: 'Chili Cheese Fries', price: 550 },
  { id: 'sf-jalapeno', name: 'Jalapeño Ranch Fries', price: 500 },
  { id: 'sf-loaded', name: 'Addict Loaded Fries', price: 650 },
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
