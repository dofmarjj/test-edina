(function($) {
  'use strict';

  const $modal = $('#donate-modal');

  if ( $modal.length === 0 ) {
    return;
  }

  $('.support-project-button').on('click', function (e) {
    const $this = $(this);

    if ($this.attr('href') !== 'javascript:void(0);') {
      //follow the HREF of the link if it is true URL
      return true;
    }

    e.preventDefault();
    e.stopPropagation();

    const projectId = $this.data('project-id');

    const project_id = projectId;
    const project_title = $this.data('project-title');

    $('#donate-modal-label').text(project_title);
    $('#solidgate-data-projects_id').text(project_id);

    destroyDonateForm();
    resetDonateForm();

    // switch currency dropdown back to UAH, might need update if default currency is dependent on region or language
    const currencies = ['UAH', 'USD', 'EUR'];
    const currencyButtons = document.querySelectorAll('[name="donate-currency"]');
    currencyButtons.forEach((btn, index) => btn.value = currencies[index]);

    currencyButtons[0].dispatchEvent(new Event('click'));
    // simulate user clicked on donation amount button (100, 500, 1000)
    document.querySelectorAll('[name="donate-amount"]')[0].dispatchEvent(new Event('change'));

    $modal.on('hidden.bs.modal', function (e) {
      resetDonateForm();

      $modal.data('bs.modal', null);
    });

    $modal.modal('show');

    // change aria-expanded to true for all involved project buttons
    $(this).attr('aria-expanded', true);

    // trick to resolve screen reader reading attribute before it changed
    setTimeout(() => {
      $(`.support-project-button[data-project-id=${projectId}]`).attr('aria-expanded', false);
    }, 1000);

    return false;
  });

})(jQuery);

