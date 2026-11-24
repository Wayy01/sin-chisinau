/**
 * Seeds SIN's real menu, journal, rewards and starter accounts.
 * Run: bun db/seed.ts            (only fills empty tables)
 *      bun db/seed.ts --reset    (wipes content tables first, keeps members)
 */
import { sql } from "drizzle-orm";
import { db, schema } from "./index";
import { randomBytes } from "node:crypto";
import { hashPassword, newMemberCode } from "../lib/crypto";

const reset = process.argv.includes("--reset");

type Cat = {
  slug: string;
  nameRo: string;
  nameRu: string;
  blurbRo: string;
  blurbRu: string;
  image: string;
};

const categories: Cat[] = [
  {
    slug: "viennoiserie",
    nameRo: "Croissante",
    nameRu: "Круассаны",
    blurbRo: "Foietaj laminat manual, unt adevărat, coacere de dimineață.",
    blurbRu: "Слоёное тесто ручной ламинации, настоящее масло, утренняя выпечка.",
    image: "/media/img/croissant-cup.webp",
  },
  {
    slug: "rolls",
    nameRo: "Rolls & Monkey bread",
    nameRu: "Синнабоны и Monkey bread",
    blurbRo: "Scorțișoară, caramel, fructe de sezon. Păcatul nostru preferat.",
    blurbRu: "Корица, карамель, сезонные фрукты. Наш любимый грех.",
    image: "/media/img/apple-roll.webp",
  },
  {
    slug: "pastry",
    nameRo: "Danish & tarte",
    nameRu: "Даниши и тарты",
    blurbRo: "Cremă de vanilie, fructe de pădure, pastel de nata ca în Lisabona.",
    blurbRu: "Ванильный крем, лесные ягоды, pastel de nata как в Лиссабоне.",
    image: "/media/img/pastel-de-nata.webp",
  },
  {
    slug: "coffee",
    nameRo: "Cafea",
    nameRu: "Кофе",
    blurbRo: "Specialty, extras atent. Lapte vegetal la cerere.",
    blurbRu: "Спешелти, бережная экстракция. Растительное молоко по запросу.",
    image: "/media/img/latte-sage.webp",
  },
  {
    slug: "signature",
    nameRo: "Băuturi de autor",
    nameRu: "Авторские напитки",
    blurbRo: "Rețete SIN care se schimbă odată cu anotimpul.",
    blurbRu: "Рецепты SIN, которые меняются вместе с сезоном.",
    image: "/media/img/drinks-table.webp",
  },
  {
    slug: "cold",
    nameRo: "Matcha & răcoritoare",
    nameRu: "Матча и освежающее",
    blurbRo: "Matcha ceremonială, limonade de casă, fresh-uri stoarse pe loc.",
    blurbRu: "Церемониальная матча, домашние лимонады, свежевыжатые фреши.",
    image: "/media/img/cups-box.webp",
  },
  {
    slug: "retail",
    nameRo: "SIN acasă",
    nameRu: "SIN домой",
    blurbRo: "Cafea boabe, echipament și merch — ca să păcătuiești și acasă.",
    blurbRu: "Зерно, оборудование и мерч — чтобы грешить и дома.",
    image: "/media/img/bag-logo.webp",
  },
];

type Item = {
  cat: string;
  slug: string;
  nameRo: string;
  nameRu: string;
  descRo: string;
  descRu: string;
  price: number;
  portion?: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
};

// Prices marked "real" are from SIN's published menu (locals.md, 2025). The rest are
// in-range placeholders for the team to confirm in the admin panel.
const items: Item[] = [
  // Croissants
  { cat: "viennoiserie", slug: "croissant-migdale", nameRo: "Croissant cu migdale", nameRu: "Круассан с миндалём", descRo: "Cremă frangipane, migdale prăjite și o ninsoare de zahăr pudră.", descRu: "Крем франжипан, обжаренный миндаль и снежок сахарной пудры.", price: 80, portion: "110 g", tags: ["signature"], image: "/media/img/croissant-cup.webp" },
  { cat: "viennoiserie", slug: "pain-suisse", nameRo: "Pain suisse", nameRu: "Pain suisse", descRo: "Foietaj cu cremă de vanilie și bucăți de ciocolată neagră.", descRu: "Слоёное тесто с ванильным кремом и кусочками тёмного шоколада.", price: 80, portion: "120 g", tags: ["signature"] },
  { cat: "viennoiserie", slug: "croissant-cafea-brownie", nameRo: "Croissant Cafea Brownie", nameRu: "Круассан Кофе-Брауни", descRo: "Crocant la exterior, cu umplutură bogată de brownie și cafea intensă.", descRu: "Хрустящий снаружи, с насыщенной начинкой из брауни и кофе.", price: 80, portion: "130 g", image: "/media/img/croissant-brownie.webp", tags: ["new"], featured: true },
  { cat: "viennoiserie", slug: "croissant-roll-afine-mango", nameRo: "Croissant roll cu afine și mango", nameRu: "Круассан-ролл с черникой и манго", descRo: "Rulou de foietaj cu cremă, afine și cuburi de mango.", descRu: "Слоёный ролл с кремом, черникой и кубиками манго.", price: 80, portion: "130 g" },
  { cat: "viennoiserie", slug: "danish-ciuperci", nameRo: "Danish cu ciuperci", nameRu: "Даниш с грибами", descRo: "Varianta sărată: ciuperci, cremă de brânză și cimbru.", descRu: "Солёный вариант: грибы, сливочный сыр и тимьян.", price: 75, portion: "140 g", tags: ["vegetarian"] },

  // Rolls
  { cat: "rolls", slug: "black-forest-roll", nameRo: "Black Forest cinnamon roll", nameRu: "Синнабон Black Forest", descRo: "Ciocolată, vișine și cremă — Pădurea Neagră într-un cinnamon roll.", descRu: "Шоколад, вишня и крем — «Чёрный лес» в синнабоне.", price: 75, portion: "150 g", image: "/media/img/black-forest-roll.webp", tags: ["new", "signature"], featured: true },
  { cat: "rolls", slug: "cinnamon-roll-mar", nameRo: "Cinnamon roll cu măr", nameRu: "Синнабон с яблоком", descRo: "Mere aromate, scorțișoară și caramel. Revine în fiecare toamnă.", descRu: "Ароматные яблоки, корица и карамель. Возвращается каждую осень.", price: 70, portion: "160 g", image: "/media/img/apple-roll.webp", tags: ["seasonal"], featured: true },
  { cat: "rolls", slug: "croissant-roll-scortisoara", nameRo: "Croissant roll cu scorțișoară", nameRu: "Круассан-ролл с корицей", descRo: "Foietaj rulat cu zahăr brun și scorțișoară de Ceylon.", descRu: "Слоёный ролл с тростниковым сахаром и цейлонской корицей.", price: 65, portion: "110 g" },
  { cat: "rolls", slug: "monkey-bread-bueno", nameRo: "Monkey bread Bueno", nameRu: "Monkey bread Bueno", descRo: "Bucăți de aluat brioșat, cremă de alune și ciocolată albă.", descRu: "Кусочки бриошь, ореховый крем и белый шоколад.", price: 85, portion: "170 g", image: "/media/img/monkey-bread.webp", tags: ["signature"], featured: true },
  { cat: "rolls", slug: "monkey-bread-fistic", nameRo: "Monkey bread cu fistic", nameRu: "Monkey bread с фисташкой", descRo: "Cremă de fistic, fistic prăjit și un strop de sare.", descRu: "Фисташковый крем, жареная фисташка и щепотка соли.", price: 90, portion: "170 g", image: "/media/img/monkey-bread.webp" },

  // Pastry
  { cat: "pastry", slug: "pastel-de-nata", nameRo: "Pastel de nata", nameRu: "Pastel de nata", descRo: "Crocant la exterior, fin și cremos în interior. Clasicul la care revenim.", descRu: "Хрустящая снаружи, нежная и кремовая внутри. Классика, к которой хочется возвращаться.", price: 40, portion: "70 g", image: "/media/img/pastel-de-nata.webp", featured: true },
  { cat: "pastry", slug: "danish-afine", nameRo: "Danish cu afine", nameRu: "Даниш с черникой", descRo: "Cremă de vanilie și afine coapte în foietaj.", descRu: "Ванильный крем и черника, запечённые в слоёном тесте.", price: 70, portion: "120 g", image: "/media/img/danish.webp", featured: true },
  { cat: "pastry", slug: "danish-zmeura", nameRo: "Danish cu zmeură", nameRu: "Даниш с малиной", descRo: "Cremă de vanilie, zmeură și o glazură subțire.", descRu: "Ванильный крем, малина и тонкая глазурь.", price: 70, portion: "120 g", image: "/media/img/danish.webp" },

  // Coffee
  { cat: "coffee", slug: "espresso", nameRo: "Espresso", nameRu: "Эспрессо", descRo: "Shot dublu din boabele zilei.", descRu: "Двойной шот из зерна дня.", price: 55, portion: "40 ml" },
  { cat: "coffee", slug: "americano", nameRo: "Americano", nameRu: "Американо", descRo: "Espresso alungit cu apă fierbinte.", descRu: "Эспрессо, разбавленный горячей водой.", price: 55, portion: "250 ml" },
  { cat: "coffee", slug: "cappuccino", nameRo: "Cappuccino", nameRu: "Капучино", descRo: "Spumă catifelată, latte art clasic.", descRu: "Бархатная пена, классический латте-арт.", price: 60, portion: "250 ml", image: "/media/img/latte-sage.webp" },
  { cat: "coffee", slug: "latte", nameRo: "Latte", nameRu: "Латте", descRo: "Espresso și mult lapte cald.", descRu: "Эспрессо и много горячего молока.", price: 60, portion: "350 ml" },
  { cat: "coffee", slug: "flat-white", nameRo: "Flat white", nameRu: "Флэт уайт", descRo: "Mai multă cafea, mai puțină spumă.", descRu: "Больше кофе, меньше пены.", price: 65, portion: "200 ml" },
  { cat: "coffee", slug: "v60", nameRo: "Filtru V60", nameRu: "Фильтр V60", descRo: "Pour-over pregătit la bar, boabe la alegere.", descRu: "Пуровер у бара, зерно на выбор.", price: 70, portion: "300 ml", image: "/media/img/latte-pour.webp" },

  // Signature
  { cat: "signature", slug: "raf-lavanda", nameRo: "Raf cu lavandă", nameRu: "Лавандовый раф", descRo: "Espresso, smântână și sirop de lavandă făcut în casă.", descRu: "Эспрессо, сливки и домашний лавандовый сироп.", price: 75, portion: "300 ml", tags: ["signature"], featured: true },
  { cat: "signature", slug: "pineapple-bumble", nameRo: "Ananas bumble", nameRu: "Ананасовый бамбл", descRo: "Espresso turnat peste suc de ananas și gheață.", descRu: "Эспрессо поверх ананасового сока и льда.", price: 60, portion: "300 ml" },
  { cat: "signature", slug: "ceai-catina", nameRo: "Ceai de cătină", nameRu: "Облепиховый чай", descRo: "Un ceai clasic, autentic: cătină, miere și citrice.", descRu: "Классический, настоящий: облепиха, мёд и цитрусы.", price: 65, portion: "500 ml", image: "/media/img/tea-pour.webp", tags: ["seasonal"] },
  { cat: "signature", slug: "ciocolata-menta", nameRo: "Ciocolată caldă cu mentă", nameRu: "Горячий шоколад с мятой", descRo: "Ciocolată densă, mentă proaspătă, gust de copilărie.", descRu: "Густой шоколад, свежая мята, вкус детства.", price: 70, portion: "300 ml", image: "/media/img/drinks-table.webp", tags: ["seasonal", "new"] },

  // Cold
  { cat: "cold", slug: "matcha-latte", nameRo: "Matcha latte", nameRu: "Матча латте", descRo: "Matcha ceremonială bătută la comandă, lapte la alegere.", descRu: "Церемониальная матча, взбитая на заказ, молоко на выбор.", price: 75, portion: "350 ml", tags: ["signature"] },
  { cat: "cold", slug: "cold-brew", nameRo: "Cold brew", nameRu: "Колд брю", descRo: "Extras la rece 18 ore. Fin, ciocolatos, fără amăreală.", descRu: "18 часов холодной экстракции. Мягкий, шоколадный, без горечи.", price: 60, portion: "300 ml" },
  { cat: "cold", slug: "limonada", nameRo: "Limonadă de casă", nameRu: "Домашний лимонад", descRo: "Întreabă de aroma zilei.", descRu: "Спросите о вкусе дня.", price: 65, portion: "400 ml" },
  { cat: "cold", slug: "fresh-portocale", nameRo: "Fresh de portocale", nameRu: "Апельсиновый фреш", descRo: "Stors pe loc, nimic adăugat.", descRu: "Выжат при вас, ничего лишнего.", price: 70, portion: "300 ml" },

  // Retail
  { cat: "retail", slug: "cafea-boabe", nameRo: "Cafea boabe SIN", nameRu: "Кофе в зёрнах SIN", descRo: "Blendul casei, prăjit pentru espresso și filtru.", descRu: "Фирменный бленд, обжарка под эспрессо и фильтр.", price: 280, portion: "250 g", image: "/media/img/cups-box.webp" },
  { cat: "retail", slug: "sacosa-sin", nameRo: "Sacoșă SIN", nameRu: "Шоппер SIN", descRo: "Pentru croissante, cărți și picnicuri de toamnă.", descRu: "Для круассанов, книг и осенних пикников.", price: 250, image: "/media/img/bag-logo.webp" },
];

const posts = [
  {
    slug: "black-forest-acum-la-sin",
    titleRo: "Black Forest, acum la SIN",
    titleRu: "Black Forest — теперь в SIN",
    excerptRo: "Ciocolată, vișine și multă savoare, toate într-un cinnamon roll pe care trebuie să-l încerci.",
    excerptRu: "Шоколад, вишня и много вкуса — всё в одном синнабоне, который нужно попробовать.",
    bodyRo: `Am luat tortul Pădurea Neagră și l-am rulat în aluatul nostru de cinnamon roll.\n\nCiocolată neagră, vișine acrișoare și o cremă aerată deasupra. E dulce, dar nu prea dulce — exact cât să mai vrei unul.\n\n## Unde îl găsești\n\nÎn vitrină, în fiecare dimineață, până se termină. Și se termină repede.\n\nSee you at SIN. ♾️`,
    bodyRu: `Мы взяли торт «Чёрный лес» и завернули его в наше тесто для синнабона.\n\nТёмный шоколад, кисловатая вишня и воздушный крем сверху. Сладко, но не приторно — ровно настолько, чтобы захотелось ещё.\n\n## Где найти\n\nНа витрине каждое утро, пока не закончится. А заканчивается быстро.\n\nSee you at SIN. ♾️`,
    cover: "/media/img/black-forest-roll.webp",
    video: null,
    date: "2026-11-23T09:00:00+02:00",
  },
  {
    slug: "toamna-la-sin",
    titleRo: "Toamna la SIN vine cu băuturi noi",
    titleRu: "Осень в SIN — это новые напитки",
    excerptRo: "Patru băuturi noi de autor și gusturi care te duc puțin înapoi în copilărie.",
    excerptRu: "Четыре новых авторских напитка и вкусы, которые немного возвращают в детство.",
    bodyRo: `Toamna la SIN vine cu băuturi noi și mai multe motive să o iubiți. 🍂\n\nDescoperiți noile arome de sezon, lăsați-vă încălziți de băuturile noastre de autor și bucurați-vă de gusturi care vă duc puțin înapoi în copilărie.\n\n## Ce e nou\n\n- **Ceai de cătină** — un ceai clasic, autentic.\n- **Ciocolată caldă cu mentă** — da, chiar funcționează.\n- și încă două surprize pe care le găsești doar la bar.\n\nNe vedem la SIN. 🤍`,
    bodyRu: `Осень в SIN — это новые напитки и ещё больше причин её любить. 🍂\n\nОткройте новые сезонные вкусы, согрейтесь нашими авторскими напитками и насладитесь вкусами, которые немного возвращают в детство.\n\n## Что нового\n\n- **Облепиховый чай** — классический и настоящий.\n- **Горячий шоколад с мятой** — да, это работает.\n- и ещё два сюрприза, которые можно найти только у бара.\n\nДо встречи в SIN. 🤍`,
    cover: "/media/img/drinks-table.webp",
    video: "/media/video/autumn-drinks.mp4",
    date: "2026-11-12T10:00:00+02:00",
  },
  {
    slug: "zile-ploioase",
    titleRo: "Zilele ploioase arată mai bine la SIN",
    titleRu: "Дождливые дни в SIN выглядят лучше",
    excerptRo: "Cafea bună, patiserie proaspătă și un loc cald în care să încetinești puțin.",
    excerptRu: "Хороший кофе, свежая выпечка и тёплое место, где можно немного замедлиться.",
    bodyRo: `Când plouă în Chișinău, terasa noastră se golește, iar înăuntru se face cel mai cald loc din oraș.\n\nUn V60 care picură încet, un croissant care se rupe cu zgomot, cineva care citește la masa de lângă geam.\n\nGood coffee, fresh pastries and a cozy place to slow down for a while. ♾️`,
    bodyRu: `Когда в Кишинёве идёт дождь, наша терраса пустеет, а внутри становится самое тёплое место в городе.\n\nV60, который медленно капает, круассан, который ломается с хрустом, кто-то читает у окна.\n\nGood coffee, fresh pastries and a cozy place to slow down for a while. ♾️`,
    cover: "/media/img/table-moment.webp",
    video: "/media/video/rainy-day.mp4",
    date: "2026-10-23T10:00:00+02:00",
  },
  {
    slug: "cinnamon-roll-cu-mar-revine",
    titleRo: "Cinnamon roll cu măr revine la SIN",
    titleRu: "Синнабон с яблоком возвращается в SIN",
    excerptRo: "Din 14 octombrie aducem din nou gustul toamnei în vitrină.",
    excerptRu: "С 14 октября снова добавляем на витрину вкус осени.",
    bodyRo: `Din 14 octombrie, aducem din nou gustul toamnei în vitrină, cu mere aromate, scorțișoară și aroma aceea care face zilele de toamnă mai frumoase. ♾️\n\n## Pentru picnic\n\nÎl împachetăm în cutia albă SIN, cu două cafele alături. Restul — frunzele, cartea și pledul — sunt treaba ta.`,
    bodyRu: `С 14 октября мы снова добавляем на витрину вкус осени — ароматные яблоки, корица и тот самый аромат, который делает осенние дни немного уютнее. ♾️\n\n## Для пикника\n\nУпакуем в белую коробку SIN и добавим два кофе. Остальное — листья, книга и плед — за вами.`,
    cover: "/media/img/apple-roll.webp",
    video: "/media/video/autumn-cinnamon.mp4",
    date: "2026-10-13T09:00:00+02:00",
  },
  {
    slug: "pastel-de-nata-un-clasic",
    titleRo: "Pastel de nata — un clasic care rămâne preferat",
    titleRu: "Pastel de nata — классика, которая остаётся любимой",
    excerptRo: "Crocant la exterior, fin și cremos în interior — gustul la care revenim de fiecare dată.",
    excerptRu: "Хрустящая снаружи, нежная и кремовая внутри — вкус, к которому хочется возвращаться.",
    bodyRo: `Foietaj subțire ca hârtia, cremă de ouă cu vanilie și coaja aceea caramelizată, aproape arsă, pe care o iubim.\n\nPastel de nata e testul oricărei patiserii. Noi îl coacem în fiecare dimineață, în tăvi mici, la temperatură foarte mare — ca în Lisabona.`,
    bodyRu: `Тонкое, как бумага, слоёное тесто, яичный крем с ванилью и та самая карамелизированная, почти подгоревшая корочка, которую мы обожаем.\n\nPastel de nata — экзамен для любой пекарни. Мы печём его каждое утро в маленьких формах при очень высокой температуре — как в Лиссабоне.`,
    cover: "/media/img/pastel-de-nata.webp",
    video: null,
    date: "2026-10-03T09:00:00+02:00",
  },
  {
    slug: "prospetimea-e-standardul-nostru",
    titleRo: "Prospețimea nu e un detaliu",
    titleRu: "Свежесть — это не деталь",
    excerptRo: "Tot ce pregătim e pentru ziua respectivă. Ce rămâne seara nu ajunge în vitrina de mâine.",
    excerptRu: "Всё, что мы готовим, — для этого дня. То, что остаётся вечером, не попадает на завтрашнюю витрину.",
    bodyRo: `La SIN, fiecare zi începe cu produse proaspăt pregătite. 🤍\n\nTot ce pregătim este pentru ziua respectivă, iar produsele rămase la finalul zilei nu sunt păstrate pentru a doua zi.\n\nPentru că pentru noi prospețimea nu este un detaliu, ci standardul nostru. ♾️`,
    bodyRu: `В SIN каждый день начинается со свежеприготовленной продукции. 🤍\n\nВсё, что мы готовим, предназначено для этого дня, а то, что остаётся к вечеру, мы не оставляем на следующий день.\n\nДля нас важно, чтобы каждый новый день начинался с только что приготовленной продукции. ♾️`,
    cover: "/media/img/vitrine.webp",
    video: null,
    date: "2026-10-02T09:00:00+02:00",
  },
];

const rewards = [
  { nameRo: "Pastel de nata", nameRu: "Pastel de nata", descRo: "Clasicul portughez, din partea casei.", descRu: "Португальская классика за наш счёт.", cost: 120, image: "/media/img/pastel-de-nata.webp" },
  { nameRo: "Espresso sau americano", nameRu: "Эспрессо или американо", descRo: "Pentru dimineți grăbite.", descRu: "Для торопливых утр.", cost: 150, image: null },
  { nameRo: "Orice cafea cu lapte", nameRu: "Любой кофе с молоком", descRo: "Latte, cappuccino, flat white sau raf.", descRu: "Латте, капучино, флэт уайт или раф.", cost: 220, image: "/media/img/latte-sage.webp" },
  { nameRo: "Croissant la alegere", nameRu: "Круассан на выбор", descRo: "Orice croissant din vitrină.", descRu: "Любой круассан с витрины.", cost: 280, image: "/media/img/croissant-cup.webp" },
  { nameRo: "Monkey bread", nameRu: "Monkey bread", descRo: "Bueno sau fistic — tu alegi.", descRu: "Bueno или фисташка — выбирать вам.", cost: 340, image: "/media/img/monkey-bread.webp" },
  { nameRo: "Sacoșă SIN", nameRu: "Шоппер SIN", descRo: "Merch-ul nostru, pentru păcătoșii fideli.", descRu: "Наш мерч для верных грешников.", cost: 900, image: "/media/img/bag-logo.webp" },
];

const qrDrops = [
  { code: "MASA-SIN", titleRo: "Codul de pe masă", titleRu: "Код со стола", halos: 25 },
  { code: "TOAMNA26", titleRo: "Toamnă cu SIN", titleRu: "Осень с SIN", halos: 40, maxClaims: 300, endsAt: new Date("2026-12-31T23:59:59+02:00") },
  { code: "INGER", titleRo: "Îngerul din story", titleRu: "Ангел из сторис", halos: 30 },
];

async function main() {
  if (reset) {
    console.log("Resetting content tables…");
    await db.execute(sql`truncate sin.menu_items, sin.categories, sin.posts, sin.rewards, sin.qr_drops cascade`);
  }

  const [{ count: catCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.categories);
  if (catCount === 0) {
    const inserted = await db
      .insert(schema.categories)
      .values(categories.map((c, sort) => ({ ...c, sort })))
      .returning();
    const bySlug = new Map(inserted.map((c) => [c.slug, c.id]));
    await db.insert(schema.menuItems).values(
      items.map((i, sort) => ({
        categoryId: bySlug.get(i.cat)!,
        slug: i.slug,
        nameRo: i.nameRo,
        nameRu: i.nameRu,
        descRo: i.descRo,
        descRu: i.descRu,
        price: i.price,
        portion: i.portion ?? null,
        image: i.image ?? null,
        tags: i.tags ?? [],
        featured: i.featured ?? false,
        sort,
      })),
    );
    console.log(`✓ ${inserted.length} categories, ${items.length} menu items`);
  }

  const [{ count: postCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.posts);
  if (postCount === 0) {
    await db.insert(schema.posts).values(
      posts.map(({ date, ...p }) => ({
        ...p,
        published: true,
        publishedAt: new Date(date),
        createdAt: new Date(date),
        updatedAt: new Date(date),
      })),
    );
    console.log(`✓ ${posts.length} journal posts`);
  }

  const [{ count: rewardCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.rewards);
  if (rewardCount === 0) {
    await db.insert(schema.rewards).values(rewards.map((r, sort) => ({ ...r, sort })));
    console.log(`✓ ${rewards.length} rewards`);
  }

  const [{ count: qrCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.qrDrops);
  if (qrCount === 0) {
    await db.insert(schema.qrDrops).values(qrDrops);
    console.log(`✓ ${qrDrops.length} QR drops`);
  }

  const [{ count: userCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.users);
  if (userCount === 0) {
    const accounts = [
      { email: "admin@sin.md", name: "SIN Admin", role: "admin" as const },
      { email: "barista@sin.md", name: "Barista SIN", role: "staff" as const },
      { email: "demo@sin.md", name: "Ana", role: "member" as const },
    ];
    console.log("\nStarter accounts (change these passwords):");
    for (const a of accounts) {
      const password = randomBytes(6).toString("hex");
      const [user] = await db
        .insert(schema.users)
        .values({ ...a, passwordHash: await hashPassword(password), memberCode: newMemberCode() })
        .returning();
      console.log(`  ${a.role.padEnd(6)} ${a.email}  /  ${password}`);
      if (a.role === "member") {
        const entries = [
          { kind: "welcome" as const, delta: 50, note: null, amountLei: null, daysAgo: 21 },
          { kind: "purchase" as const, delta: 14, note: null, amountLei: 145, daysAgo: 18 },
          { kind: "qr" as const, delta: 25, note: "Codul de pe masă", amountLei: null, daysAgo: 18 },
          { kind: "purchase" as const, delta: 21, note: null, amountLei: 215, daysAgo: 9 },
          { kind: "purchase" as const, delta: 8, note: null, amountLei: 80, daysAgo: 3 },
        ];
        for (const e of entries) {
          await db.insert(schema.ledger).values({
            userId: user.id,
            kind: e.kind,
            delta: e.delta,
            note: e.note,
            amountLei: e.amountLei,
            createdAt: new Date(Date.now() - e.daysAgo * 864e5),
          });
        }
        const total = entries.reduce((s, e) => s + e.delta, 0);
        await db
          .update(schema.users)
          .set({ halos: total, halosLifetime: total, stamps: 4 })
          .where(sql`${schema.users.id} = ${user.id}`);
      }
    }
  }

  await db
    .insert(schema.settings)
    .values({ key: "site", value: {} })
    .onConflictDoNothing();

  console.log("\nSeed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
