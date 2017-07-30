$(function () {
  // smooth scroll
  $(document).on('click', 'a[href^="#"]', function(e) {
    var href = $(this).attr('href');

    $('html, body').animate({ scrollTop: $(href).offset().top + 'px' });

    return false;
  });
});
