(function () {
  'use strict';

  const SUPPORTED = ['ar', 'fa', 'ps', 'ur'];

  function pathKey() {
    const p = location.pathname.toLowerCase();
    if (p === '/amn-site/' || p === '/amn-site/index.html') return 'home';
    if (p === '/amn-site/download/index.html') return 'download';
    if (p === '/amn-site/download/android/index.html') return 'android';
    if (p === '/amn-site/faq/index.html') return 'faq';
    if (p === '/amn-site/support/index.html') return 'support';
    if (p === '/amn-site/docs/index.html') return 'docs';
    if (/^\/amn-site\/legal\/privacy(\/|$)/.test(p)) return 'privacy';
    if (/^\/amn-site\/legal\/terms(\/|$)/.test(p)) return 'terms';
    return null;
  }

  function detectLang() {
    try {
      const p = location.pathname.toLowerCase();
      const m = p.match(/^\/amn-site\/legal\/(privacy|terms)\/(ar|fa|ps)\/index\.html$/);
      if (m) return m[2];
    } catch (_) {}

    try {
      const qp = new URLSearchParams(location.search).get('lang');
      if (qp && SUPPORTED.includes(qp)) return qp;
    } catch (_) {}

    try {
      const saved = localStorage.getItem('siteLang');
      if (saved && SUPPORTED.includes(saved)) return saved;
    } catch (_) {}

    return 'en';
  }

  function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el && typeof text === 'string') el.textContent = text;
  }

  function setHtml(selector, html) {
    const el = document.querySelector(selector);
    if (el && typeof html === 'string') el.innerHTML = html;
  }

  function setAt(listSelector, itemSelector, index, text) {
    const list = document.querySelectorAll(listSelector);
    if (!list || !list.length || !list[index]) return;
    const el = list[index].querySelector(itemSelector);
    if (el && typeof text === 'string') el.textContent = text;
  }

  function setListItem(listSelector, index, text) {
    const list = document.querySelector(listSelector);
    if (!list) return;
    const items = list.querySelectorAll('li');
    if (items[index] && typeof text === 'string') items[index].textContent = text;
  }

  function setNth(selector, index, text) {
    const nodes = document.querySelectorAll(selector);
    if (!nodes || !nodes[index] || typeof text !== 'string') return;
    nodes[index].textContent = text;
  }

  const NAV = {
    ar: ['الصفحة الرئيسية', 'التنزيل', 'الأسئلة الشائعة', 'الدعم', 'الوثائق', 'الخصوصية', 'الشروط'],
    fa: ['خانه', 'دانلود', 'پرسش ها', 'پشتیبانی', 'اسناد', 'حریم خصوصی', 'شرایط'],
    ps: ['کور', 'ډاونلوډ', 'پوښتنې', 'ملاتړ', 'اسناد', 'محرمیت', 'شرایط'],
    ur: ['ہوم', 'ڈاؤن لوڈ', 'سوالات', 'سپورٹ', 'دستاویزات', 'پرائیویسی', 'شرائط']
  };

  function applyNav(lang) {
    if (!NAV[lang]) return;
    const items = document.querySelectorAll('.amn-links .amn-link');
    NAV[lang].forEach((label, i) => {
      if (items[i]) items[i].textContent = label;
    });
  }

  function applyHome(lang) {
    if (lang === 'ar') {
      document.title = 'AmnShield | حماية رقمية مرتبطة بالقيم';
      setText('.amn-kicker', 'منظومة AmnShield');
      setText('.amn-hero h1', 'نبني مستقبلا رقميا متجذرا في الإيمان');
      setText('.amn-hero p', 'تستخدم خدمات الحق الرقمية التكنولوجيا لإنشاء أدوات هادفة تعزز ارتباطنا بالدين عبر المتصفح وسطح المكتب والهاتف.');
      setText('.amn-actions .amn-btn.primary', 'احصل على AmnShield');
      setText('.amn-actions .amn-btn.secondary', 'اقرأ سياسة الخصوصية');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'إضافة المتصفح');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 0, 'تصفية الفئات والكلمات المفتاحية بتشغيل محلي أولا وإعدادات يتحكم بها المستخدم.');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'تطبيق سطح المكتب والمدير');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 1, 'وصول موحد على سطح المكتب مع سير عمل إنتاجي واستمرارية الإعدادات.');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'تطبيق الهاتف');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 2, 'ضوابط حماية على الجهاز مصممة للاستخدام اليومي مع الحفاظ على استقلالية المستخدم.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'مسارات الخدمات');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'المسارات القانونية الموحدة');
      setText('.amn-note.amn-note-gap', 'الخدمات المشمولة: إضافة المتصفح، تطبيق سطح المكتب (ويندوز)، تطبيق الهاتف، وخدمات موقع مبادرة الحق.');
      setHtml('.amn-footer p', 'تعمل AmnShield ضمن منظومة مبادرة الحق للخدمات الرقمية الأخلاقية. للتواصل مع الدعم: <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
      return;
    }

    if (lang === 'fa') {
      document.title = 'AmnShield | محافظت دیجیتال همسو با ارزش ها';
      setText('.amn-kicker', 'اکوسیستم AmnShield');
      setText('.amn-hero h1', 'آینده دیجیتال ریشه دار در ایمان می سازیم');
      setText('.amn-hero p', 'خدمات دیجیتال الحق از فناوری برای ساخت ابزارهای هدفمند در مرورگر، دسکتاپ و موبایل استفاده می کند تا پیوند ما با دین تقویت شود.');
      setText('.amn-actions .amn-btn.primary', 'دریافت AmnShield');
      setText('.amn-actions .amn-btn.secondary', 'خواندن سیاست حریم خصوصی');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'افزونه مرورگر');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 0, 'فیلتر دسته بندی و واژه ها با اجرای محلی و تنظیمات در کنترل کاربر.');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'برنامه دسکتاپ و مدیر');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 1, 'دسترسی یکپارچه روی دسکتاپ با روندهای کاری بهره ور و تداوم پیکربندی.');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'برنامه موبایل');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 2, 'کنترل های محافظتی روی دستگاه برای استفاده روزمره با حفظ استقلال کاربر.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'مسیرهای خدمات');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'مسیرهای حقوقی یکپارچه');
      setText('.amn-note.amn-note-gap', 'خدمات تحت پوشش: افزونه مرورگر، برنامه دسکتاپ (ویندوز)، برنامه موبایل و خدمات وبسایت ابتکار الحق.');
      setHtml('.amn-footer p', 'AmnShield در چارچوب اکوسیستم ابتکار الحق اداره می شود. تماس پشتیبانی: <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
      return;
    }

    if (lang === 'ps') {
      document.title = 'AmnShield | ايمان ته نږدې ډيجیټل ساتنه';
      setText('.amn-kicker', 'د AmnShield ایکوسیستم');
      setText('.amn-hero h1', 'موږ يو ډيجیټل راتلونکی د ايمان پر بنسټ جوړوو');
      setText('.amn-hero p', 'د الحق ډيجیټل خدمات د ټکنالوژۍ له لارې په براوزر، ډيسکټاپ او موبايل کې موخې لرونکي وسايل جوړوي تر څو زموږ د دين سره اړيکه پياوړې شي.');
      setText('.amn-actions .amn-btn.primary', 'AmnShield ترلاسه کړئ');
      setText('.amn-actions .amn-btn.secondary', 'د محرمیت تګلاره ولولئ');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'براوزر توسیعه');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 0, 'د کتګوریو او کليمو فلټر کول د محلي اجرا او د کارونکي تر کنټرول لاندې تنظیماتو سره.');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'د ډيسکټاپ اپ او مدير');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 1, 'په ډيسکټاپ کې يو موټی لاسرسی د اغېزمنو کاري بهیرونو او دوامداره امستنو سره.');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'موبايل اپ');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 2, 'د ورځېني کارونې لپاره پر وسيله دننه ساتندوی کنټرولونه چې د کارونکي خپلواکي خوندي کړي.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'د خدمت لارې');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'يو موټی قانوني لارې');
      setText('.amn-note.amn-note-gap', 'تر پوښښ لاندې خدمتونه: د براوزر توسیعه، د ډيسکټاپ اپ (وينډوز)، د موبايل اپ، او د الحق نوښت د وېبسايټ خدمتونه.');
      setHtml('.amn-footer p', 'AmnShield د اخلاقي ډيجیټل خدمتونو لپاره د الحق نوښت په ایکوسیستم کې اداره کېږي. د ملاتړ اړیکه: <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
      return;
    }

    if (lang === 'ur') {
      document.title = 'AmnShield | ایمان سے جڑی ڈیجیٹل حفاظت';
      setText('.amn-kicker', 'AmnShield ایکوسسٹم');
      setText('.amn-hero h1', 'ہم ایمان سے جڑا ڈیجیٹل مستقبل بناتے ہیں');
      setText('.amn-hero p', 'الحق ڈیجیٹل سروسز ٹیکنالوجی کے ذریعے ایسے بامقصد اوزار بناتی ہیں جو براؤزر، ڈیسک ٹاپ اور موبائل پر دین سے تعلق مضبوط کریں۔');
      setText('.amn-actions .amn-btn.primary', 'AmnShield حاصل کریں');
      setText('.amn-actions .amn-btn.secondary', 'پرائیویسی پالیسی پڑھیں');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'براؤزر ایکسٹینشن');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 0, 'درجہ بندی اور کلیدی الفاظ کی فلٹرنگ، لوکل فرسٹ آپریشن اور صارف کے کنٹرول والی ترتیبات کے ساتھ۔');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'ڈیسک ٹاپ ایپ اور مینیجر');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 1, 'ڈیسک ٹاپ پر یکجا رسائی، مؤثر ورک فلو اور مسلسل کنفیگریشن کے ساتھ۔');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'موبائل ایپ');
      setAt('.amn-grid.cols-3 .amn-card', 'p', 2, 'روزمرہ استعمال کے لیے آن ڈیوائس حفاظتی کنٹرولز جو صارف کی خود مختاری برقرار رکھیں۔');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'سروس روٹس');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'یکجا قانونی روٹس');
      setText('.amn-note.amn-note-gap', 'شامل خدمات: براؤزر ایکسٹینشن، ڈیسک ٹاپ ایپ (ونڈوز)، موبائل ایپ، اور الحق انیشیٹو ویب سائٹ سروسز۔');
      setHtml('.amn-footer p', 'AmnShield الحق انیشیٹو کے اخلاقی ڈیجیٹل سروسز ایکوسسٹم کے تحت چلایا جاتا ہے۔ سپورٹ: <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
    }
  }

  function applyDownload(lang) {
    if (lang === 'ar') {
      document.title = 'التنزيل | AmnShield';
      setText('.amn-kicker', 'وصول النشر');
      setText('.amn-hero h1', 'تنزيل AmnShield حسب المنصة');
      setText('.amn-hero p', 'هذا المسار هو نقطة التنزيل الرسمية للمتصفح وسطح المكتب والهاتف.');
      setText('.amn-actions .amn-btn.primary', 'اطلب النسخة الحالية');
      setText('.amn-actions .amn-btn.secondary', 'اقرأ ملاحظات التثبيت');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'إضافة المتصفح');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'تطبيق سطح المكتب');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'تطبيق الهاتف');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'وظيفة هذا المسار');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'مسارات مرتبطة');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 0, 'الدعم');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 1, 'الوثائق');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 2, 'شروط الخدمة');
      setHtml('.amn-footer p', 'للحصول على أحدث حزمة أو مساعدة البدء، راسل <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
      return;
    }
    if (lang === 'fa') {
      document.title = 'دانلود | AmnShield';
      setText('.amn-kicker', 'دسترسی استقرار');
      setText('.amn-hero h1', 'دانلود AmnShield بر اساس پلتفرم');
      setText('.amn-hero p', 'این مسیر، نقطه رسمی دانلود برای مرورگر، دسکتاپ و موبایل است.');
      setText('.amn-actions .amn-btn.primary', 'درخواست نسخه فعلی');
      setText('.amn-actions .amn-btn.secondary', 'مطالعه یادداشت های نصب');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'افزونه مرورگر');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'برنامه دسکتاپ');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'برنامه موبایل');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'کارکرد این مسیر');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'مسیرهای مرتبط');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 0, 'پشتیبانی');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 1, 'اسناد');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 2, 'شرایط خدمات');
      setHtml('.amn-footer p', 'برای دریافت آخرین بسته یا کمک شروع، با <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a> تماس بگیرید.');
      return;
    }
    if (lang === 'ps') {
      document.title = 'ډاونلوډ | AmnShield';
      setText('.amn-kicker', 'د خپرونې لاسرسی');
      setText('.amn-hero h1', 'AmnShield د پلاتفورم له مخې ډاونلوډ کړئ');
      setText('.amn-hero p', 'دا لاره د براوزر، ډيسکټاپ او موبايل لپاره رسمي ډاونلوډ دروازه ده.');
      setText('.amn-actions .amn-btn.primary', 'اوسنۍ نسخه وغواړئ');
      setText('.amn-actions .amn-btn.secondary', 'د نصب یادښتونه ولولئ');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'براوزر توسیعه');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'د ډيسکټاپ اپ');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'موبايل اپ');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'د دې لارې دنده');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'اړوندې لارې');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 0, 'ملاتړ');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 1, 'اسناد');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 2, 'د خدمت شرایط');
      setHtml('.amn-footer p', 'د وروستۍ نسخې یا پیل مرستې لپاره له <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a> سره اړیکه ونیسئ.');
      return;
    }
    if (lang === 'ur') {
      document.title = 'ڈاؤن لوڈ | AmnShield';
      setText('.amn-kicker', 'تعیناتی رسائی');
      setText('.amn-hero h1', 'پلیٹ فارم کے مطابق AmnShield ڈاؤن لوڈ کریں');
      setText('.amn-hero p', 'یہ راستہ براؤزر، ڈیسک ٹاپ اور موبائل کے لیے باضابطہ ڈاؤن لوڈ انٹری پوائنٹ ہے۔');
      setText('.amn-actions .amn-btn.primary', 'موجودہ بلڈ کی درخواست کریں');
      setText('.amn-actions .amn-btn.secondary', 'انسٹالیشن نوٹس پڑھیں');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'براؤزر ایکسٹینشن');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'ڈیسک ٹاپ ایپ');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'موبائل ایپ');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'اس راستے کا مقصد');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'متعلقہ روٹس');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 0, 'سپورٹ');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 1, 'دستاویزات');
      setListItem('.amn-grid.cols-2 .amn-card:nth-child(2) ul', 2, 'شرائط خدمات');
      setHtml('.amn-footer p', 'تازہ ترین پیکیج یا آن بورڈنگ مدد کے لیے <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a> سے رابطہ کریں۔');
    }
  }

  function applyFaq(lang) {
    if (lang === 'ar') {
      document.title = 'الأسئلة الشائعة | AmnShield';
      setText('.amn-kicker', 'وضوح تشغيلي');
      setText('.amn-hero h1', 'الأسئلة الشائعة لمنظومة AmnShield');
      setText('.amn-hero p', 'يوفر هذا المسار إجابات سريعة حول المنصات والمعالجة المحلية ومسارات السياسات.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'ما الخدمات المشمولة؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'هل تعيد هذه الصفحة التوجيه؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 2, 'من أين أحصل على النسخ؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 3, 'أين تفاصيل السياسات؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 4, 'كيف أنضم إلى الاختبار المغلق على أندرويد؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 5, 'هل تتم معالجة بيانات أندرويد محليا؟');
      setHtml('.amn-footer p', 'لأسئلة إضافية، تابع إلى <a href="/amn-site/support/index.html">الدعم</a> أو راسل <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
      return;
    }
    if (lang === 'fa') {
      document.title = 'پرسش های متداول | AmnShield';
      setText('.amn-kicker', 'شفافیت عملیاتی');
      setText('.amn-hero h1', 'پرسش های متداول AmnShield');
      setText('.amn-hero p', 'این مسیر پاسخ های سریع درباره پوشش پلتفرم، پردازش محلی و مسیرهای سیاست ارائه می دهد.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'چه خدماتی پوشش داده می شود؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'آیا این صفحه ریدایرکت می شود؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 2, 'بیلدها را از کجا بگیرم؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 3, 'جزئیات سیاست ها کجاست؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 4, 'چطور به تست بسته اندروید بپیوندم؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 5, 'آیا داده های اندروید به صورت محلی پردازش می شود؟');
      setHtml('.amn-footer p', 'برای سوالات بیشتر، به <a href="/amn-site/support/index.html">پشتیبانی</a> بروید یا ایمیل بزنید: <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
      return;
    }
    if (lang === 'ps') {
      document.title = 'پرله پسې پوښتنې | AmnShield';
      setText('.amn-kicker', 'عملياتي روڼتيا');
      setText('.amn-hero h1', 'د AmnShield عامې پوښتنې');
      setText('.amn-hero p', 'دا لاره د پلاتفورم پوښښ، محلي پروسس او تګلارو په اړه چټک ځوابونه برابروي.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'کوم خدمتونه تر پوښښ لاندې دي؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'ایا دا پاڼه بیا لېږد کوي؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 2, 'نسخې له کومه ترلاسه کړم؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 3, 'د تګلارو تفصیل چېرته دی؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 4, 'د Android تړلي ټیسټ ته څنګه داخل شم؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 5, 'ایا د Android معلومات په ځایي ډول پروسس کېږي؟');
      setHtml('.amn-footer p', 'د نورو پوښتنو لپاره <a href="/amn-site/support/index.html">ملاتړ</a> ته لاړ شئ یا ایمیل وکړئ: <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
      return;
    }
    if (lang === 'ur') {
      document.title = 'اکثر پوچھے گئے سوالات | AmnShield';
      setText('.amn-kicker', 'عملی وضاحت');
      setText('.amn-hero h1', 'AmnShield اکثر پوچھے گئے سوالات');
      setText('.amn-hero p', 'یہ راستہ پلیٹ فارم کوریج، لوکل پراسیسنگ اور پالیسی روٹس کے بارے میں فوری جوابات دیتا ہے۔');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'کن خدمات کا احاطہ ہوتا ہے؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'کیا یہ صفحہ ری ڈائریکٹ کرتا ہے؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 2, 'بلڈ کہاں سے ملیں گی؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 3, 'پالیسی تفصیل کہاں ہے؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 4, 'Android کلوزڈ ٹیسٹنگ میں کیسے شامل ہوں؟');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 5, 'کیا Android ڈیٹا مقامی طور پر پراسیس ہوتا ہے؟');
      setHtml('.amn-footer p', 'مزید سوالات کے لیے <a href="/amn-site/support/index.html">سپورٹ</a> پر جائیں یا ای میل کریں: <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
    }
  }

  function applySupport(lang) {
    if (lang === 'ar') {
      document.title = 'الدعم | AmnShield';
      setText('main h1', 'مركز الدعم');
      setText('main p.text-sm.text-gray-500', 'تحتاج مساعدة؟ اختر منتجك أدناه أو تواصل معنا مباشرة.');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 0, 'إضافة المتصفح');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 1, 'تطبيق أندرويد');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 2, 'مدير سطح المكتب');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 3, 'تطبيق سطح المكتب');
      setText('h2#extension', 'أسئلة الإضافة');
      setText('h2#mobile', 'دعم تطبيق أندرويد');
      setText('h2#manager', 'مدير سطح المكتب (قيد التخطيط)');
      setText('h2#desktop', 'تطبيق سطح المكتب (قيد التخطيط)');
      setNth('main h2.text-2xl.font-bold.mt-10.mb-3', 4, 'التواصل');
      return;
    }
    if (lang === 'fa') {
      document.title = 'پشتیبانی | AmnShield';
      setText('main h1', 'مرکز پشتیبانی');
      setText('main p.text-sm.text-gray-500', 'به کمک نیاز دارید؟ محصول خود را انتخاب کنید یا مستقیم با ما تماس بگیرید.');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 0, 'افزونه مرورگر');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 1, 'اپ اندروید');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 2, 'مدیر دسکتاپ');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 3, 'اپ دسکتاپ');
      setText('h2#extension', 'پرسش های افزونه');
      setText('h2#mobile', 'پشتیبانی اپ اندروید');
      setText('h2#manager', 'مدیر دسکتاپ (در برنامه)');
      setText('h2#desktop', 'اپ دسکتاپ (در برنامه)');
      setNth('main h2.text-2xl.font-bold.mt-10.mb-3', 4, 'تماس');
      return;
    }
    if (lang === 'ps') {
      document.title = 'ملاتړ | AmnShield';
      setText('main h1', 'د ملاتړ مرکز');
      setText('main p.text-sm.text-gray-500', 'مرستې ته اړتیا لرئ؟ لاندې خپل محصول وټاکئ یا مستقیمه اړیکه ونیسئ.');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 0, 'د براوزر توسیعه');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 1, 'Android اپ');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 2, 'د ډيسکټاپ مدير');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 3, 'د ډيسکټاپ اپ');
      setText('h2#extension', 'د توسیعې پوښتنې');
      setText('h2#mobile', 'د Android اپ ملاتړ');
      setText('h2#manager', 'د ډيسکټاپ مدير (راتلونکی)');
      setText('h2#desktop', 'د ډيسکټاپ اپ (راتلونکی)');
      setNth('main h2.text-2xl.font-bold.mt-10.mb-3', 4, 'اړیکه');
      return;
    }
    if (lang === 'ur') {
      document.title = 'سپورٹ | AmnShield';
      setText('main h1', 'سپورٹ ہب');
      setText('main p.text-sm.text-gray-500', 'مدد چاہیے؟ نیچے اپنا پروڈکٹ منتخب کریں یا براہ راست رابطہ کریں۔');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 0, 'براؤزر ایکسٹینشن');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 1, 'اینڈروئیڈ ایپ');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 2, 'ڈیسک ٹاپ مینیجر');
      setNth('section.grid.md\\:grid-cols-2 a.card strong', 3, 'ڈیسک ٹاپ ایپ');
      setText('h2#extension', 'ایکسٹینشن سوالات');
      setText('h2#mobile', 'اینڈروئیڈ ایپ سپورٹ');
      setText('h2#manager', 'ڈیسک ٹاپ مینیجر (منصوبہ بندی)');
      setText('h2#desktop', 'ڈیسک ٹاپ ایپ (منصوبہ بندی)');
      setNth('main h2.text-2xl.font-bold.mt-10.mb-3', 4, 'رابطہ');
    }
  }

  function applyDocs(lang) {
    if (lang === 'ar') {
      document.title = 'الوثائق | AmnShield';
      setText('.amn-kicker', 'مسار الوثائق');
      setText('.amn-hero h1', 'مركز وثائق AmnShield والمسارات القانونية');
      setText('.amn-hero p', 'هذا هو المركز الرسمي لوثائق Amn وسياسات الخصوصية وشروط الخدمة وموارد الدعم.');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 0, 'تطبيق أندرويد');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 1, 'الخصوصية');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 2, 'الشروط');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 3, 'الدعم');
      setHtml('.amn-footer p', 'يمكن إرسال طلبات الوثائق إلى <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a>.');
      return;
    }
    if (lang === 'fa') {
      document.title = 'اسناد | AmnShield';
      setText('.amn-kicker', 'مسیر اسناد');
      setText('.amn-hero h1', 'مرکز اسناد و حقوقی AmnShield');
      setText('.amn-hero p', 'این هاب رسمی اسناد Amn برای سیاست حریم خصوصی، شرایط خدمات و منابع پشتیبانی است.');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 0, 'اپ اندروید');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 1, 'حریم خصوصی');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 2, 'شرایط');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 3, 'پشتیبانی');
      setHtml('.amn-footer p', 'درخواست های اسناد را به <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a> بفرستید.');
      return;
    }
    if (lang === 'ps') {
      document.title = 'اسناد | AmnShield';
      setText('.amn-kicker', 'د اسنادو لاره');
      setText('.amn-hero h1', 'د AmnShield د اسنادو او قانوني مرکز');
      setText('.amn-hero p', 'دا د Amn رسمي اسنادي مرکز دی چې د محرمیت، شرایطو او ملاتړ سرچینې پکې شاملې دي.');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 0, 'Android اپ');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 1, 'محرمیت');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 2, 'شرایط');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 3, 'ملاتړ');
      setHtml('.amn-footer p', 'د اسنادو غوښتنې <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a> ته ولېږئ.');
      return;
    }
    if (lang === 'ur') {
      document.title = 'دستاویزات | AmnShield';
      setText('.amn-kicker', 'دستاویزی روٹ');
      setText('.amn-hero h1', 'AmnShield دستاویزات اور قانونی ہب');
      setText('.amn-hero p', 'یہ Amn کا باضابطہ دستاویزی مرکز ہے جہاں پرائیویسی، شرائط اور سپورٹ وسائل دستیاب ہیں۔');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 0, 'اینڈروئیڈ ایپ');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 1, 'پرائیویسی');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 2, 'شرائط');
      setAt('.amn-grid.cols-3 .amn-card', 'h2', 3, 'سپورٹ');
      setHtml('.amn-footer p', 'دستاویزات کی درخواستیں <a href="mailto:support@alhaq-initiative.org">support@alhaq-initiative.org</a> پر بھیجیں۔');
    }
  }

  function applyAndroid(lang) {
    if (lang === 'ar') {
      document.title = 'تطبيق أندرويد | AmnShield';
      setText('.amn-kicker', 'قناة إصدار أندرويد');
      setText('.amn-hero h1', 'AmnShield لأندرويد');
      setText('.amn-hero p', 'ثبّت AmnShield عبر Google Play أو انضم إلى الاختبار المغلق. التطبيق مصمم لحماية محلية مع احترام الخصوصية.');
      setText('.amn-actions .amn-btn.primary', 'التثبيت من Google Play');
      setNth('.amn-actions .amn-btn.secondary', 0, 'الانضمام إلى الاختبار المغلق');
      setNth('.amn-actions .amn-btn.secondary', 1, 'طلب دعم أندرويد');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'ما الذي ستحصل عليه');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'متطلبات النظام');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'الإعداد الموصى به');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'خطوات الاختبار المغلق');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'السياسات والمساعدة');
      return;
    }
    if (lang === 'fa') {
      document.title = 'اپ اندروید | AmnShield';
      setText('.amn-kicker', 'کانال انتشار اندروید');
      setText('.amn-hero h1', 'AmnShield برای اندروید');
      setText('.amn-hero p', 'AmnShield را از Google Play نصب کنید یا به تست بسته بپیوندید. این اپ برای حفاظت محلی و حریم خصوصی طراحی شده است.');
      setText('.amn-actions .amn-btn.primary', 'نصب از Google Play');
      setNth('.amn-actions .amn-btn.secondary', 0, 'پیوستن به تست بسته');
      setNth('.amn-actions .amn-btn.secondary', 1, 'درخواست پشتیبانی اندروید');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'امکانات');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'نیازمندی های سیستم');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'راه اندازی پیشنهادی');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'مراحل تست بسته');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'سیاست ها و راهنما');
      return;
    }
    if (lang === 'ps') {
      document.title = 'Android اپ | AmnShield';
      setText('.amn-kicker', 'د Android خپرونې چینل');
      setText('.amn-hero h1', 'AmnShield د Android لپاره');
      setText('.amn-hero p', 'AmnShield له Google Play څخه نصب کړئ یا تړلي ټیسټ ته داخل شئ. اپ د محرمیت-لومړی او پر وسيله دننه ساتنې لپاره جوړ شوی.');
      setText('.amn-actions .amn-btn.primary', 'له Google Play نصب');
      setNth('.amn-actions .amn-btn.secondary', 0, 'تړلي ټیسټ ته داخلېدل');
      setNth('.amn-actions .amn-btn.secondary', 1, 'د Android ملاتړ غوښتنه');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'تاسو څه ترلاسه کوئ');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'د سیستم اړتیاوې');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'سپارښت شوی تنظیم');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'د تړلي ټیسټ مرحلې');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'تګلارې او مرسته');
      return;
    }
    if (lang === 'ur') {
      document.title = 'اینڈروئیڈ ایپ | AmnShield';
      setText('.amn-kicker', 'اینڈروئیڈ ریلیز چینل');
      setText('.amn-hero h1', 'AmnShield برائے اینڈروئیڈ');
      setText('.amn-hero p', 'AmnShield کو Google Play سے انسٹال کریں یا کلوزڈ ٹیسٹنگ میں شامل ہوں۔ ایپ پرائیویسی فرسٹ اور آن ڈیوائس پروٹیکشن کے لیے بنائی گئی ہے۔');
      setText('.amn-actions .amn-btn.primary', 'Google Play سے انسٹال کریں');
      setNth('.amn-actions .amn-btn.secondary', 0, 'کلوزڈ ٹیسٹنگ میں شامل ہوں');
      setNth('.amn-actions .amn-btn.secondary', 1, 'اینڈروئیڈ سپورٹ کی درخواست');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 0, 'آپ کو کیا ملتا ہے');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 1, 'سسٹم تقاضے');
      setAt('.amn-grid.cols-3 .amn-card', 'h3', 2, 'تجویز کردہ سیٹ اپ');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'کلوزڈ ٹیسٹنگ کے مراحل');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'پالیسی اور مدد');
    }
  }

  function applyPrivacy(lang) {
    if (lang === 'ar') {
      document.title = 'سياسة الخصوصية | AmnShield';
      setText('.amn-kicker', 'إطار قانوني موحد');
      setText('.amn-hero h1', 'سياسة خصوصية AmnShield');
      setText('.amn-hero p', 'المسار الرسمي الافتراضي بالإنجليزية، وتعرض هذه الصفحة نسخة عربية موجزة من السياسة.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'الالتزامات الأساسية');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'مسارات السياسة');
      setAt('.amn-card.amn-section-gap-sm', 'h2', 0, 'التواصل');
      setHtml('.amn-footer p', 'تُدار صفحات AmnShield القانونية ضمن نظام قانوني موحد.');
      return;
    }
    if (lang === 'fa') {
      document.title = 'سیاست حریم خصوصی | AmnShield';
      setText('.amn-kicker', 'چارچوب حقوقی یکپارچه');
      setText('.amn-hero h1', 'سیاست حریم خصوصی AmnShield');
      setText('.amn-hero p', 'مسیر رسمی پیش فرض انگلیسی است و این صفحه نسخه فشرده فارسی از سیاست را نمایش می دهد.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'تعهدات اصلی');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'مسیرهای سیاست');
      setAt('.amn-card.amn-section-gap-sm', 'h2', 0, 'تماس');
      setHtml('.amn-footer p', 'صفحات حقوقی AmnShield در چارچوب یک نظام حقوقی یکپارچه نگهداری می شود.');
      return;
    }
    if (lang === 'ps') {
      document.title = 'د محرمیت تګلاره | AmnShield';
      setText('.amn-kicker', 'يو موټی قانوني چوکاټ');
      setText('.amn-hero h1', 'د AmnShield د محرمیت تګلاره');
      setText('.amn-hero p', 'اصلي رسمي لاره په انګلیسي ده او دا پاڼه د محرمیت منځپانګې لنډ پښتو وړاندېز ښيي.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'اصلي ژمنې');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'د تګلارې لارې');
      setAt('.amn-card.amn-section-gap-sm', 'h2', 0, 'اړیکه');
      setHtml('.amn-footer p', 'د AmnShield قانوني پاڼې د يو موټي قانوني سیستم لاندې ساتل کېږي.');
      return;
    }
    if (lang === 'ur') {
      document.title = 'پرائیویسی پالیسی | AmnShield';
      setText('.amn-kicker', 'یکجا قانونی فریم ورک');
      setText('.amn-hero h1', 'AmnShield پرائیویسی پالیسی');
      setText('.amn-hero p', 'باضابطہ ڈیفالٹ روٹ انگریزی میں ہے اور یہ صفحہ پالیسی کا مختصر اردو خلاصہ دکھاتا ہے۔');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'بنیادی وعدے');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'پالیسی روٹس');
      setAt('.amn-card.amn-section-gap-sm', 'h2', 0, 'رابطہ');
      setHtml('.amn-footer p', 'AmnShield کے قانونی صفحات ایک ہی قانونی نظام کے تحت برقرار رکھے جاتے ہیں۔');
    }
  }

  function applyTerms(lang) {
    if (lang === 'ar') {
      document.title = 'شروط الخدمة | AmnShield';
      setText('.amn-kicker', 'إطار قانوني موحد');
      setText('.amn-hero h1', 'شروط خدمة AmnShield');
      setText('.amn-hero p', 'المسار الرسمي الافتراضي بالإنجليزية، وتعرض هذه الصفحة نسخة عربية موجزة من الشروط.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'النطاق');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'تخطيط المسارات');
      setAt('.amn-card.amn-section-gap-sm', 'h2', 0, 'التواصل');
      setHtml('.amn-footer p', 'هذه الشروط جزء من النظام القانوني الموحد لـ Amn.');
      return;
    }
    if (lang === 'fa') {
      document.title = 'شرایط خدمات | AmnShield';
      setText('.amn-kicker', 'چارچوب حقوقی یکپارچه');
      setText('.amn-hero h1', 'شرایط خدمات AmnShield');
      setText('.amn-hero p', 'مسیر رسمی پیش فرض انگلیسی است و این صفحه نمای فشرده فارسی از شرایط را ارائه می کند.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'دامنه');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'نقشه مسیرها');
      setAt('.amn-card.amn-section-gap-sm', 'h2', 0, 'تماس');
      setHtml('.amn-footer p', 'این شرایط بخشی از نظام حقوقی یکپارچه Amn است.');
      return;
    }
    if (lang === 'ps') {
      document.title = 'د خدمت شرایط | AmnShield';
      setText('.amn-kicker', 'يو موټی قانوني چوکاټ');
      setText('.amn-hero h1', 'د AmnShield د خدمت شرایط');
      setText('.amn-hero p', 'اصلي رسمي لاره په انګلیسي ده او دا پاڼه د شرایطو لنډ پښتو وړاندېز ښيي.');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'ساحه');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'د لارو نقشه');
      setAt('.amn-card.amn-section-gap-sm', 'h2', 0, 'اړیکه');
      setHtml('.amn-footer p', 'دا شرایط د Amn د یو موټي قانوني سیستم برخه ده.');
      return;
    }
    if (lang === 'ur') {
      document.title = 'شرائط خدمات | AmnShield';
      setText('.amn-kicker', 'یکجا قانونی فریم ورک');
      setText('.amn-hero h1', 'AmnShield شرائط خدمات');
      setText('.amn-hero p', 'باضابطہ ڈیفالٹ روٹ انگریزی میں ہے اور یہ صفحہ شرائط کا مختصر اردو خلاصہ دکھاتا ہے۔');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 0, 'دائرہ کار');
      setAt('.amn-grid.cols-2 .amn-card', 'h2', 1, 'روٹ میپنگ');
      setAt('.amn-card.amn-section-gap-sm', 'h2', 0, 'رابطہ');
      setHtml('.amn-footer p', 'یہ شرائط Amn کے یکجا قانونی نظام کا حصہ ہیں۔');
    }
  }

  function applyAmnLanguage(lang) {
    const key = pathKey();
    if (!key) return;

    const rtl = lang === 'ar' || lang === 'fa' || lang === 'ps' || lang === 'ur';
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : lang);
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    if (document.body) document.body.classList.toggle('rtl', rtl);

    if (lang === 'en') return;

    applyNav(lang);

    if (key === 'home') applyHome(lang);
    if (key === 'download') applyDownload(lang);
    if (key === 'faq') applyFaq(lang);
    if (key === 'support') applySupport(lang);
    if (key === 'docs') applyDocs(lang);
    if (key === 'android') applyAndroid(lang);
    if (key === 'privacy') applyPrivacy(lang);
    if (key === 'terms') applyTerms(lang);
  }

  window.applyAmnLanguage = applyAmnLanguage;
  window.setLanguage = applyAmnLanguage;

  const initial = detectLang();
  applyAmnLanguage(initial);
})();
