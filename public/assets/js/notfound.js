// 404 page: show it in the visitor's chosen language (English or Arabic)
(function () {
  var ar = false;
  try { ar = localStorage.getItem('addict-lang') === 'ar'; } catch (e) { /* default English */ }
  if (!ar) return;
  var h = document.documentElement;
  h.lang = 'ar';
  h.dir = 'rtl';
  document.title = 'الصفحة غير موجودة | ذا أديكت';
  var set = function (sel, text) { var n = document.querySelector(sel); if (n) n.textContent = text; };
  set('[data-nf-title]', 'هذه الصفحة غير موجودة');
  set('[data-nf-text]', 'حدث خطأ ما، لكن البرغر ما زال هنا.');
  set('[data-nf-link]', 'العودة إلى القائمة');
})();
