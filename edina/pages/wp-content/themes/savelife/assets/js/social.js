jQuery(
  function () {
    const buttons = {
      facebook: (url, text) => `https://www.facebook.com/sharer.php?u=${url}`,
      twitter: (url, text) => `https://twitter.com/share?url=${url}&text=${text}`,
      //twitter: (url, text) => `https://twitter.com/share?url=${url}&text=${text}&via=[via]&hashtags=[hashtags]`,
      telegram: (url, text) => `https://t.me/share/url?url=${url}&text=${text}`,
      linkedin: (url, text) => `https://www.linkedin.com/shareArticle?url=${url}&title=${text}`,
    };
    const btns = jQuery('.social-icon[data-social]');

    btns.each((idx, btn) => {
      const jbtn = jQuery(btn);

      const network = jbtn.data('social');
      const url = jbtn.data('url');
      const title = jbtn.data('title');

      jbtn.attr('href', encodeURI(buttons[network](url, title)));
    });
  }

);
