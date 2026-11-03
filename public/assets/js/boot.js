// Runs before the page is drawn: pick the language (link ?lang=, saved choice, or phone language)
// so Arabic visitors never see the English layout flash first.
(function () {
  try {
    var q = new URLSearchParams(location.search).get('lang');
    var l = q === 'ar' || q === 'en' ? q : localStorage.getItem('addict-lang');
    if (q === 'ar' || q === 'en') localStorage.setItem('addict-lang', q);
    if (l !== 'ar' && l !== 'en') l = (navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
    var h = document.documentElement;
    h.lang = l;
    h.dir = l === 'ar' ? 'rtl' : 'ltr';
    if (l === 'ar') h.setAttribute('data-pending', '');
  } catch (e) { /* keep English */ }
})();
