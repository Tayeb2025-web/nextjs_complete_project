// محتوای اولیهٔ قابل ویرایش؛ فقط اسکریپت راه‌اندازی آن را در پایگاه داده ثبت می‌کند.
export const starterExercises = [
  {
    title: "ساخت کارت معرفی با HTML معنایی",
    slug: "semantic-profile-card",
    topic: "HTML و CSS",
    level: "beginner",
    minutes: 20,
    codeLanguage: "html",
    courseSlug: "htmlcss",
    summary:
      "یک کارت معرفی بساز که ساختار خوانا، عنوان درست و تصویر با متن جایگزین داشته باشد.",
    statement:
      "یک کارت معرفی برای یک برنامه‌نویس بساز. کارت باید یک عنوان اصلی، تصویر با متن جایگزین، معرفی کوتاه و لینک تماس داشته باشد.\nاز article برای کارت، h1 برای نام و p برای معرفی استفاده کن. لینک تماس باید یک آدرس ایمیل معتبر با پیشوند mailto داشته باشد.\nابتدا ساختار HTML را کامل کن؛ در این تمرین ظاهر پیچیده لازم نیست.",
    examples: [
      {
        input: "نام: سارا\nمهارت: توسعهٔ وب\nایمیل: sara@example.com",
        output:
          "کارت با عنوان سارا، معرفی کوتاه، تصویر با alt توصیفی و لینک تماس با ایمیل.",
      },
    ],
    hints: [
      "عنوان اصلی کارت را در h1 قرار بده و متن معرفی را با p بنویس.",
      "برای عکس از alt توصیفی استفاده کن؛ نام فایل جای متن جایگزین را نمی‌گیرد.",
      "آدرس لینک تماس را به‌صورت mailto:sara@example.com بنویس.",
    ],
    starterCode:
      "<article>\n  <!-- عنوان، تصویر، معرفی و لینک تماس را اینجا اضافه کن -->\n</article>",
    solution:
      '<article>\n  <h1>سارا؛ توسعه‌دهندهٔ وب</h1>\n  <img src="sara.jpg" alt="تصویر سارا" width="160" height="160">\n  <p>من ساخت رابط‌های ساده و کاربردی وب را تمرین می‌کنم.</p>\n  <a href="mailto:sara@example.com">تماس با سارا</a>\n</article>',
    explanation:
      "article محتوای مستقل کارت را مشخص می‌کند. عنوان و پاراگراف، ساختار متن را روشن می‌کنند و alt در صورت نمایش‌ندادن تصویر یا استفاده از صفحه‌خوان مفید است. فایل sara.jpg را با عکس خودت جایگزین کن.",
  },
  {
    title: "چیدمان واکنش‌گرا با Flexbox",
    slug: "responsive-navigation",
    topic: "HTML و CSS",
    level: "beginner",
    minutes: 25,
    codeLanguage: "css",
    courseSlug: "htmlcss",
    summary:
      "یک منوی ساده بساز که در نمایشگر کوچک، لینک‌ها بدون بیرون‌زدگی به خط بعد بروند.",
    statement:
      "برای nav شامل سه لینک، CSS بنویس. لینک‌ها باید کنار هم باشند، بین آن‌ها فاصله باشد و اگر عرض کم شد به خط بعد بروند.\nاز Flexbox استفاده کن. لینک‌ها باید با کیبورد قابل تشخیص باشند؛ برای focus-visible یک حاشیهٔ مشخص در نظر بگیر.\nمنو را در عرض ۳۲۰ پیکسل هم بررسی کن. از عرض ثابت برای کل منو استفاده نکن.",
    examples: [
      {
        input:
          '<nav class="menu">\n  <a href="#">خانه</a>\n  <a href="#">دوره‌ها</a>\n  <a href="#">تمرین‌ها</a>\n</nav>',
        output:
          "لینک‌ها کنار هم با فاصله نمایش داده می‌شوند؛ وقتی جا کم باشد، به خط بعد می‌روند. فوکوس کیبورد قابل مشاهده است.",
      },
    ],
    hints: [
      "display: flex چیدمان را فعال می‌کند و gap فاصلهٔ بین لینک‌ها را تنظیم می‌کند.",
      "flex-wrap: wrap اجازه می‌دهد آیتم‌ها به خط بعد بروند.",
      "حالت :focus-visible را برای لینک‌ها تعریف کن.",
    ],
    starterCode:
      ".menu {\n  /* چیدمان و فاصله‌ها را کامل کن */\n}\n.menu a {\n  /* ظاهر لینک‌ها */\n}",
    solution:
      ".menu {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n  padding: 16px;\n}\n.menu a {\n  padding: 10px 16px;\n  border: 1px solid #e2e8f0;\n  border-radius: 8px;\n  color: #334155;\n  text-decoration: none;\n}\n.menu a:focus-visible {\n  outline: 3px solid #818cf8;\n  outline-offset: 3px;\n}",
    explanation:
      "Flexbox لینک‌ها را کنار هم قرار می‌دهد. wrap باعث می‌شود عرض کوچک به اسکرول افقی منو منجر نشود. gap فاصلهٔ یکنواخت می‌سازد و focus-visible به کاربر کیبورد نشان می‌دهد کدام لینک فعال است.",
  },
  {
    title: "جدا کردن عددهای زوج از آرایه",
    slug: "even-numbers",
    topic: "JavaScript",
    level: "beginner",
    minutes: 15,
    codeLanguage: "javascript",
    courseSlug: "javascript",
    summary:
      "با دریافت یک آرایهٔ عددی، فقط عددهای زوج را برگردان؛ بدون تغییر آرایهٔ اصلی.",
    statement:
      "تابع getEvenNumbers را بنویس. ورودی آرایه‌ای از عددهای صحیح است و خروجی یک آرایهٔ جدید شامل عددهای زوج، با همان ترتیب ورودی است.\nعدد صفر و عددهای منفی را هم در نظر بگیر. آرایهٔ ورودی نباید تغییر کند. برای آرایهٔ خالی، آرایهٔ خالی برگردان.",
    examples: [
      { input: "getEvenNumbers([1, 2, 3, 4, 6])", output: "[2, 4, 6]" },
      { input: "getEvenNumbers([-3, -2, 0, 5])", output: "[-2, 0]" },
      { input: "getEvenNumbers([])", output: "[]" },
    ],
    hints: [
      "زوج بودن را با باقی‌ماندهٔ تقسیم بر ۲ بررسی کن.",
      "متد filter یک آرایهٔ جدید با آیتم‌های مطابق شرط می‌سازد.",
    ],
    starterCode:
      "function getEvenNumbers(numbers) {\n  // کد خودت را بنویس\n}\n\nconsole.log(getEvenNumbers([1, 2, 3, 4, 6]));",
    solution:
      "function getEvenNumbers(numbers) {\n  return numbers.filter(number => number % 2 === 0);\n}",
    explanation:
      "filter ترتیب عددها را حفظ می‌کند و آرایهٔ اصلی را تغییر نمی‌دهد. شرط number % 2 === 0 برای صفر و عددهای زوج منفی هم درست است.",
  },
  {
    title: "محاسبهٔ جمع سبد خرید",
    slug: "cart-total",
    topic: "JavaScript",
    level: "intermediate",
    minutes: 25,
    codeLanguage: "javascript",
    courseSlug: "javascript",
    summary:
      "قیمت و تعداد کالاها را جمع کن و یک تابع قابل استفاده برای سبد خرید بساز.",
    statement:
      "تابع cartTotal را بنویس. ورودی آرایه‌ای از اشیاء با price و quantity است. price و quantity عددهای صحیح نامنفی هستند.\nخروجی برابر مجموع price × quantity همهٔ آیتم‌ها باشد. برای سبد خالی، صفر برگردان و ورودی را تغییر نده.\nدر این تمرین محاسبهٔ مالیات یا کد تخفیف لازم نیست.",
    examples: [
      {
        input:
          "cartTotal([{ price: 100, quantity: 2 }, { price: 50, quantity: 3 }])",
        output: "350",
      },
      { input: "cartTotal([])", output: "0" },
    ],
    hints: [
      "برای هر آیتم، قیمت واحد را در تعداد ضرب کن.",
      "reduce می‌تواند مجموع را از مقدار اولیهٔ صفر بسازد.",
    ],
    starterCode: "function cartTotal(items) {\n  // مجموع را محاسبه کن\n}",
    solution:
      "function cartTotal(items) {\n  return items.reduce((total, item) => {\n    return total + item.price * item.quantity;\n  }, 0);\n}",
    explanation:
      "مقدار اولیهٔ صفر باعث می‌شود سبد خالی هم نتیجهٔ صحیح داشته باشد. در هر مرحله حاصل ضرب قیمت و تعداد به مجموع اضافه می‌شود؛ هیچ فیلدی از ورودی تغییر نمی‌کند.",
  },
  {
    title: "شمارش تکرار واژه‌ها",
    slug: "word-frequency",
    topic: "JavaScript",
    level: "intermediate",
    minutes: 30,
    codeLanguage: "javascript",
    courseSlug: "javascript",
    summary:
      "یک متن سادهٔ انگلیسی را دریافت کن و تعداد تکرار هر واژه را به دست بیاور.",
    statement:
      "تابع wordFrequency را بنویس. ورودی یک رشته شامل واژه‌های انگلیسی و فاصله‌های سفید است؛ نشانه‌گذاری در ورودی این تمرین وجود ندارد.\nبزرگی و کوچکی حروف تفاوتی نداشته باشد. فاصله‌های ابتدا و انتها و فاصله‌های تکراری را مدیریت کن. خروجی یک شیء شامل تعداد هر واژه است.\nبرای رشتهٔ خالی یک شیء خالی برگردان. واژه‌هایی مثل constructor نیز باید مانند بقیه شمارش شوند.",
    examples: [
      {
        input: 'wordFrequency("Code learn code")',
        output: "{ code: 2, learn: 1 }",
      },
      { input: 'wordFrequency("   ")', output: "{}" },
      {
        input: 'wordFrequency("constructor constructor")',
        output: "{ constructor: 2 }",
      },
    ],
    hints: [
      "از trim و toLowerCase برای آماده‌سازی متن استفاده کن.",
      "split با الگوی /\\s+/ فاصله‌های تکراری را جدا می‌کند؛ ابتدا رشتهٔ خالی را بررسی کن.",
      "Object.create(null) یک شیء بدون کلیدهای ارثی می‌سازد.",
    ],
    starterCode:
      "function wordFrequency(text) {\n  // متن را آماده کن و تکرارها را بشمار\n}",
    solution:
      "function wordFrequency(text) {\n  const counts = Object.create(null);\n  const normalized = text.trim().toLowerCase();\n  if (!normalized) return counts;\n  for (const word of normalized.split(/\\s+/)) {\n    counts[word] = (counts[word] || 0) + 1;\n  }\n  return counts;\n}",
    explanation:
      "آماده‌سازی متن، Code و code را یک واژه می‌کند. بررسی رشتهٔ خالی مانع ایجاد یک کلید خالی می‌شود. شیء بدون prototype باعث می‌شود نام‌هایی مثل constructor با ویژگی‌های ارثی تداخل نداشته باشند.",
  },
  {
    title: "ساخت شمارنده با React",
    slug: "react-counter",
    topic: "React",
    level: "beginner",
    minutes: 25,
    codeLanguage: "jsx",
    courseSlug: "reactjs",
    summary:
      "یک شمارنده با دکمه‌های افزایش، کاهش و بازنشانی بساز و تغییر state را تمرین کن.",
    statement:
      'کامپوننت Counter را بساز. مقدار اولیهٔ شمارنده صفر است. سه دکمه برای افزایش یک واحد، کاهش یک واحد و بازنشانی به صفر داشته باشد.\nاز useState استفاده کن. دکمه‌ها متن واضح و type="button" داشته باشند. مقدار شمارنده روی صفحه دیده شود و تغییر آن برای صفحه‌خوان هم اعلام شود.\nمقدار می‌تواند منفی شود؛ در این تمرین محدودیت صفر نداریم.',
    examples: [
      {
        input: "دو بار افزایش و یک بار کاهش",
        output: "مقدار نمایش‌داده‌شده: 1",
      },
      { input: "کلیک روی بازنشانی", output: "مقدار نمایش‌داده‌شده: 0" },
    ],
    hints: [
      "با useState(0) مقدار اولیه را تعریف کن.",
      "وقتی مقدار جدید به مقدار قبلی وابسته است، از setCount(previous => previous + 1) استفاده کن.",
      'aria-live="polite" می‌تواند تغییر مقدار نمایش‌داده‌شده را اعلام کند.',
    ],
    starterCode:
      'import { useState } from "react";\n\nexport default function Counter() {\n  return <section>{/* مقدار و دکمه‌ها */}</section>;\n}',
    solution:
      'import { useState } from "react";\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <section>\n      <p aria-live="polite">مقدار: {count}</p>\n      <button type="button" onClick={() => setCount(c => c + 1)}>افزایش</button>\n      <button type="button" onClick={() => setCount(c => c - 1)}>کاهش</button>\n      <button type="button" onClick={() => setCount(0)}>بازنشانی</button>\n    </section>\n  );\n}',
    explanation:
      'state مقدار فعلی را نگه می‌دارد. به‌روزرسانی تابعی مقدار قبلی را دریافت می‌کند، بنابراین برای افزایش و کاهش مناسب است. type="button" از ارسال ناخواستهٔ فرم جلوگیری می‌کند.',
  },
  {
    title: "ساخت فهرست کارها در React",
    slug: "react-task-list",
    topic: "React",
    level: "intermediate",
    minutes: 45,
    codeLanguage: "jsx",
    courseSlug: "reactjs",
    summary:
      "اضافه‌کردن، انجام‌دادن و حذف کارها را با مدیریت آرایه در state تمرین کن.",
    statement:
      "کامپوننت TaskList را بساز. کاربر بتواند عنوان کار را وارد کند و به فهرست اضافه کند. عنوان خالی پذیرفته نشود.\nهر کار شناسهٔ ثابت، عنوان و وضعیت انجام داشته باشد. با checkbox وضعیت انجام تغییر کند و دکمهٔ حذف فقط همان کار را حذف کند.\nآرایهٔ state را مستقیم تغییر نده. برای key از شناسه استفاده کن. ذخیره‌سازی بعد از رفرش در این تمرین لازم نیست.",
    examples: [
      {
        input: "افزودن «مرور JavaScript» و «تمرین React»؛ حذف کار اول",
        output: "فقط «تمرین React» در فهرست باقی می‌ماند.",
      },
      {
        input: "ارسال عنوان شامل چند فاصله",
        output: "کار جدیدی اضافه نمی‌شود.",
      },
    ],
    hints: [
      "عنوان ورودی را با trim بررسی کن و بعد از افزودن، ورودی را خالی کن.",
      "برای افزودن از آرایهٔ جدید، برای تغییر از map و برای حذف از filter استفاده کن.",
      "برای تولید شناسهٔ ثابت در همین کامپوننت می‌توانی یک شمارنده را در useRef نگه داری.",
    ],
    starterCode:
      'import { useRef, useState } from "react";\n\nexport default function TaskList() {\n  // state و عملیات اضافه، تغییر و حذف را کامل کن\n  return <section />;\n}',
    solution:
      'import { useRef, useState } from "react";\n\nexport default function TaskList() {\n  const [title, setTitle] = useState("");\n  const [tasks, setTasks] = useState([]);\n  const nextId = useRef(1);\n  function addTask(event) {\n    event.preventDefault();\n    if (!title.trim()) return;\n    const task = { id: nextId.current++, title: title.trim(), done: false };\n    setTasks(previous => [...previous, task]);\n    setTitle("");\n  }\n  return (\n    <section>\n      <form onSubmit={addTask}>\n        <label htmlFor="task-title">عنوان کار</label>\n        <input id="task-title" value={title} onChange={e => setTitle(e.target.value)} />\n        <button type="submit">افزودن</button>\n      </form>\n      <ul>\n        {tasks.map(task => (\n          <li key={task.id}>\n            <label>\n              <input type="checkbox" checked={task.done}\n                onChange={() => setTasks(previous => previous.map(t =>\n                  t.id === task.id ? { ...t, done: !t.done } : t))} />\n              {task.title}\n            </label>\n            <button type="button" onClick={() => setTasks(previous =>\n              previous.filter(t => t.id !== task.id))}>حذف {task.title}</button>\n          </li>\n        ))}\n      </ul>\n    </section>\n  );\n}',
    explanation:
      "شناسه در طول حضور کامپوننت ثابت می‌ماند و برای key و عملیات کار استفاده می‌شود. map، filter و spread آرایه‌های جدید می‌سازند و state را مستقیم دست‌کاری نمی‌کنند.",
  },
  {
    title: "کنترل فراخوانی‌ها با debounce",
    slug: "javascript-debounce",
    topic: "JavaScript",
    level: "advanced",
    minutes: 40,
    codeLanguage: "javascript",
    courseSlug: "javascript",
    summary:
      "تابعی بساز که اجرای کار را تا توقف فراخوانی‌های پیاپی به تأخیر بیندازد.",
    statement:
      "تابع debounce(fn, delay) را بنویس. خروجی آن یک تابع جدید باشد. هر بار که تابع جدید فراخوانی شد، زمان‌سنج قبلی لغو و زمان‌سنج تازه شروع شود.\nfn فقط بعد از گذشت delay میلی‌ثانیه از آخرین فراخوانی اجرا شود. آرگومان‌ها و this آخرین فراخوانی را حفظ کن.\ndelay در این تمرین عدد نامنفی است. لازم نیست کد کاربر را اجرا یا به API واقعی متصل کنی؛ با console.log رفتار را بررسی کن.",
    examples: [
      {
        input:
          'const log = debounce(console.log, 300);\nlog("a");\nlog("ab");\nlog("abc");',
        output:
          'پس از توقف فراخوانی‌ها و گذشت دست‌کم 300 میلی‌ثانیه، فقط "abc" چاپ می‌شود.',
      },
    ],
    hints: [
      "شناسهٔ زمان‌سنج را در closure نگه دار.",
      "پیش از ساختن زمان‌سنج جدید، clearTimeout را روی زمان‌سنج قبلی اجرا کن.",
      "یک تابع معمولی return کن تا this فراخوانی حفظ شود؛ fn.apply(this, args) آرگومان‌ها و context را انتقال می‌دهد.",
    ],
    starterCode:
      "function debounce(fn, delay) {\n  // زمان‌سنج و تابع بازگشتی را کامل کن\n}",
    solution:
      "function debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    const context = this;\n    timer = setTimeout(() => fn.apply(context, args), delay);\n  };\n}",
    explanation:
      "زمان‌سنج در closure بین فراخوانی‌ها باقی می‌ماند. هر فراخوانی، زمان‌سنج قبلی را لغو می‌کند. پس فقط آخرین مجموعهٔ آرگومان‌ها و context اجرا می‌شوند. delay حداقل زمان انتظار است؛ اجرای واقعی به صف رویدادها هم وابسته است.",
  },
].map((item) => ({ status: "published", relatedCourse: null, ...item }));

export const starterArticles = [
  {
    title: "از تماشای آموزش تا نوشتن اولین پروژه",
    slug: "from-learning-to-building",
    topic: "مسیر یادگیری",
    courseSlug: "htmlcss",
    summary:
      "یک روش ساده برای تبدیل دیدن دوره به تمرین روزانه و ساختن پروژه‌های کوچک.",
    content:
      '<p>دیدن آموزش، شروع مسیر است. برای اینکه یک مفهوم را به مهارت تبدیل کنی، لازم است آن را بدون دنبال‌کردن خط‌به‌خط مدرس به کار ببری. هدف این نیست که از همان روز اول پروژهٔ بزرگی بسازی؛ یک خروجی کوچک و قابل بررسی کافی است.</p><h2>یک هدف کوچک انتخاب کن</h2><p>به‌جای «امروز طراحی وب یاد می‌گیرم»، هدفی مشخص بنویس: «یک کارت معرفی با عنوان، تصویر و لینک تماس می‌سازم». این هدف هم محدود است و هم می‌توانی در پایان آن را بررسی کنی. اگر تازه شروع کرده‌ای، ابتدا HTML و CSS را برای ساختار و ظاهر تمرین کن و سپس رفتارهای سادهٔ JavaScript را اضافه کن.</p><h2>آموزش را متوقف کن و از حافظه بنویس</h2><p>بعد از یک بخش کوتاه، ویدیو را متوقف کن و نمونه را با نام‌ها و محتوای خودت بساز. اگر چیزی را فراموش کردی، همان قسمت را مرور کن. فراموش‌کردن یک دستور نشانهٔ شکست نیست؛ مهم این است که بتوانی مسئله را به قدم‌های کوچک تقسیم کنی و راه رسیدن به جواب را پیدا کنی.</p><ul><li>اول نتیجهٔ مورد انتظار را با یک جمله بنویس.</li><li>فایل‌ها و ساختار لازم را آماده کن.</li><li>یک بخش را بساز و همان بخش را بررسی کن.</li><li>بعد سراغ بخش بعدی برو.</li></ul><h2>فقط ظاهر را بررسی نکن</h2><p>اگر کارت یا منو ساخته‌ای، عرض مرورگر را کم کن و با کلید Tab بین لینک‌ها برو. اگر تابع نوشته‌ای، ورودی خالی، صفر و یک نمونهٔ متفاوت را امتحان کن. یک برنامه ممکن است برای نمونهٔ مدرس کار کند، اما برای ورودی دیگری نتیجهٔ اشتباه بدهد. این بررسی‌ها کمک می‌کنند دقیق‌تر فکر کنی.</p><h2>راه‌حل را بعد از تلاش مقایسه کن</h2><p>وقتی گیر کردی، ابتدا یک راهنمایی کوچک بخوان؛ مستقیم به کد کامل نپر. بعد از نوشتن راه‌حل خودت، نمونهٔ پیشنهادی را ببین و تفاوت‌ها را توضیح بده. لازم نیست کدت دقیقاً شبیه نمونه باشد. بررسی کن هر دو راه‌حل کدام شرط‌ها را پوشش می‌دهند و کدام خواناتر است.</p><blockquote>یک تمرین کوچک که خودت حل کرده‌ای، فرصت خوبی برای فهمیدن فاصلهٔ بین «مفهوم را می‌شناسم» و «می‌توانم از آن استفاده کنم» است.</blockquote><h2>قدم بعدی را ثبت کن</h2><p>در پایان تمرین، سه چیز بنویس: چه ساختم، کجا گیر کردم و دفعهٔ بعد چه چیزی را مرور می‌کنم. می‌توانی وضعیت تمرین را در سایت انجام‌شده علامت بزنی. این علامت، گزارش خودت از پیشرفت است و جای بررسی نتیجهٔ کد را نمی‌گیرد.</p><p>برای شروع، تمرین <a href="/exercises/semantic-profile-card">کارت معرفی با HTML</a> را انجام بده و بعد سراغ <a href="/exercises/responsive-navigation">منوی واکنش‌گرا</a> برو.</p>',
  },
  {
    title: "انتخاب بین map، filter و reduce در JavaScript",
    slug: "javascript-array-methods",
    topic: "JavaScript",
    courseSlug: "javascript",
    summary:
      "با سه مثال ساده یاد بگیر برای تغییر شکل، انتخاب و جمع‌کردن داده‌ها کدام متد مناسب است.",
    content:
      '<p>وقتی با آرایه‌ها کار می‌کنی، ابتدا بپرس خروجی چه شکلی دارد. آیا برای هر آیتم یک مقدار تازه می‌خواهی؟ فقط بعضی آیتم‌ها را می‌خواهی؟ یا می‌خواهی کل آرایه را به یک نتیجه تبدیل کنی؟ همین پرسش‌ها به انتخاب بین map، filter و reduce کمک می‌کنند.</p><h2>map؛ تبدیل هر آیتم</h2><p>map روی آیتم‌های موجود آرایه اجرا می‌شود و یک آرایهٔ تازه از نتیجهٔ callback می‌سازد. برای یک آرایهٔ معمولی و بدون خانهٔ خالی، تعداد خروجی‌ها برابر تعداد ورودی‌هاست. مثلاً برای دو برابر کردن عددها:</p><pre><code>const numbers = [1, 2, 3];\nconst doubled = numbers.map(number =&gt; number * 2);\n// [2, 4, 6]</code></pre><p>اگر از callback چیزی return نکنی، نتیجهٔ آن آیتم undefined می‌شود. به‌خصوص وقتی بدنهٔ تابع را داخل آکولاد می‌نویسی، return را فراموش نکن.</p><h2>filter؛ نگه‌داشتن آیتم‌های مطابق شرط</h2><p>filter آیتم‌هایی را نگه می‌دارد که نتیجهٔ callback برایشان truthy باشد. ترتیب آیتم‌ها حفظ می‌شود. مثلاً برای انتخاب عددهای زوج:</p><pre><code>const numbers = [1, 2, 3, 4];\nconst even = numbers.filter(number =&gt; number % 2 === 0);\n// [2, 4]</code></pre><p>تابع شرط باید دربارهٔ نگه‌داشتن آیتم تصمیم بگیرد. برای کارهایی مثل حذف موارد انجام‌شده یا یافتن کالاهای یک دسته، filter انتخاب مستقیمی است.</p><h2>reduce؛ ساختن یک نتیجه از کل آرایه</h2><p>reduce یک accumulator دارد؛ مقداری که در هر مرحله به‌روزرسانی و به مرحلهٔ بعد فرستاده می‌شود. این مقدار می‌تواند عدد، شیء یا آرایه باشد. برای مجموع عددها، صفر یک مقدار اولیهٔ مناسب است:</p><pre><code>const numbers = [10, 20, 30];\nconst total = numbers.reduce((sum, number) =&gt; sum + number, 0);\n// 60</code></pre><p>مقدار اولیه را آگاهانه انتخاب کن. reduce بدون مقدار اولیه روی آرایهٔ خالی خطا می‌دهد. اگر قرار است مجموع یک سبد خرید خالی صفر باشد، مقدار اولیهٔ صفر را مشخص کن.</p><h2>آرایهٔ تازه به معنی کپی عمیق نیست</h2><p>map و filter آرایهٔ تازه می‌سازند، اما اگر آیتم‌ها شیء باشند، ممکن است همان مرجع‌های شیء در خروجی باقی بمانند. تغییر یک ویژگی از شیء داخل callback می‌تواند شیء ورودی را هم تغییر دهد. برای تغییر یک فیلد، یک شیء تازه بساز:</p><pre><code>const updated = tasks.map(task =&gt;\n  task.id === targetId ? { ...task, done: true } : task\n);</code></pre><h2>با یک تمرین انتخاب را تثبیت کن</h2><p>برای <a href="/exercises/even-numbers">جدا کردن عددهای زوج</a> از filter استفاده کن. برای <a href="/exercises/cart-total">جمع سبد خرید</a> سراغ reduce برو. بعد یک آرایهٔ قیمت را با map به آرایه‌ای از متن‌های قابل نمایش تبدیل کن. انتخاب متد از شکل خروجی شروع می‌شود، نه از کوتاه‌ترین کد ممکن.</p>',
  },
  {
    title: "به‌روزرسانی درست آرایه‌ها در state ری‌اکت",
    slug: "react-array-state",
    topic: "React",
    courseSlug: "reactjs",
    summary:
      "افزودن، تغییر و حذف آیتم‌ها را با آرایه‌های تازه انجام بده و شناسهٔ ثابت را از index جدا کن.",
    content:
      '<p>در React، state را مستقیم دست‌کاری نکن. وقتی فهرستی از کارها یا محصولات را نگه می‌داری، برای تغییر آن یک آرایهٔ تازه بساز و آن را به setter بده. این روش هم خواندن کد را آسان‌تر می‌کند و هم به React کمک می‌کند تغییر را از روی مرجع جدید تشخیص بدهد.</p><h2>افزودن یک آیتم</h2><p>از spread برای ساختن آرایهٔ تازه استفاده کن. اگر مقدار جدید به state قبلی وابسته است، شکل تابعی setter مناسب است:</p><pre><code>const task = { id: newId, title: "تمرین React", done: false };\nsetTasks(previous =&gt; [...previous, task]);</code></pre><p>به‌جای tasks.push(task)، آرایهٔ تازه ساخته‌ای. push آرایهٔ موجود را تغییر می‌دهد و اگر همان مرجع را دوباره به setter بدهی، ممکن است تغییر مورد انتظار در رابط دیده نشود.</p><h2>تغییر یک آیتم</h2><p>با map، آیتم مورد نظر را پیدا کن و برای همان آیتم یک شیء تازه برگردان. بقیهٔ آیتم‌ها می‌توانند مرجع قبلی خود را حفظ کنند:</p><pre><code>setTasks(previous =&gt; previous.map(task =&gt;\n  task.id === targetId ? { ...task, done: !task.done } : task\n));</code></pre><p>در این مثال، هم آرایه و هم شیء تغییرکرده تازه‌اند. اگر دادهٔ تو تو‌در‌تو باشد، برای هر سطحی که تغییر می‌دهی باید کپی مناسب آن سطح را هم بسازی؛ spread فقط یک کپی سطحی است.</p><h2>حذف با filter</h2><p>برای حذف، آیتمی را که شناسه‌اش برابر هدف است نگه ندار:</p><pre><code>setTasks(previous =&gt;\n  previous.filter(task =&gt; task.id !== targetId)\n);</code></pre><p>این روش آرایهٔ قبلی را تغییر نمی‌دهد و شرط حذف را روشن نشان می‌دهد. برای افزودن، تغییر و حذف، شناسهٔ آیتم باید مستقل از جایگاه فعلی آن در فهرست باشد.</p><h2>چرا index همیشه key مناسبی نیست؟</h2><p>اگر آیتم‌ها حذف، اضافه یا جابه‌جا شوند، جایگاهشان عوض می‌شود. key مبتنی بر index ممکن است باعث شود React یک آیتم را با آیتم دیگری مرتبط بداند؛ به‌خصوص وقتی ردیف‌ها state یا ورودی دارند. برای فهرست کارها از شناسهٔ ثابت هر کار استفاده کن.</p><blockquote>شناسه را هنگام ساخت آیتم تولید کن، نه در هر بار render.</blockquote><h2>تمرین پیشنهادی</h2><p>در <a href="/exercises/react-task-list">تمرین فهرست کارها</a> این سه عملیات را کنار هم پیاده کن. بعد یک کار را انجام‌شده کن، یک کار دیگر را حذف کن و بررسی کن عنوان‌ها و checkboxها همچنان با آیتم درست مرتبط باشند.</p><p>اگر هنوز state برایت تازه است، ابتدا <a href="/exercises/react-counter">شمارندهٔ React</a> را بساز. وقتی تغییر یک مقدار را فهمیدی، مدیریت فهرست‌ها قدم بعدی مناسبی است.</p>',
  },
].map((item) => ({
  status: "published",
  authorName: "",
  relatedCourse: null,
  ...item,
}));
