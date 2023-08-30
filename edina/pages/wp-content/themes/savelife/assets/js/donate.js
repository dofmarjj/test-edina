jQuery(
  function () {
    const navs = document.querySelectorAll(`[data-target-nav]`);

    function showTabs(beneficiary) {
      navs.forEach(nav => {
        const current = nav.attributes["data-target-nav"].value;


        if (current !== beneficiary) {
          // hide tabs nav block
          document.getElementById(`donateTabs${current}`).style.display = "none";
          if (document.getElementById(`desc-help-${current}`)) {
            document.getElementById(`desc-help-${current}`).style.display = "none";
          }
          if (document.getElementById(`arrow-help-${current}`)) {
            document.getElementById(`arrow-help-${current}`).style.display = "none";
          }
        } else {
          // show tabs nav block
          document.getElementById(`donateTabs${current}`).style.display = "";
          if (document.getElementById(`desc-help-${current}`)) {
            document.getElementById(`desc-help-${current}`).style.display = "";
          }
          if (document.getElementById(`arrow-help-${current}`)) {
            document.getElementById(`arrow-help-${current}`).style.display = "";
          }
          document.querySelector('.help-donate-description').classList.remove('d-none');
        }
      });

      // hide previously showing tabs
      document.querySelectorAll("nav.donate-tabs .nav-link.active").forEach(item => item.classList.remove('active'));
    }

    function attachHandlers() {
      // assign handlers for BENEFICIARIES
      const beneficiaries = document.querySelectorAll("input.btn-check[data-beneficiary]");

      beneficiaries.forEach((item) => {
        const beneficiary = item.attributes["data-beneficiary"].value;


        // hide and show payment type navigation
        item.addEventListener("click", (e) => {
          // save beneficiary in the higher scope
          currentBeneficiary = beneficiary;

          showTabs(beneficiary);

          // switch to default payment by card
          document.getElementById(`tab-card-${beneficiary}`).dispatchEvent(new MouseEvent('click'));
        });
      });

      // assign handlers for nav buttons: PAYMENT_METHOD, PERIOD
      const tabs = document.querySelectorAll("form.support-fund-donate-form .nav-link[data-bs-target]");

      tabs.forEach((tab) => {
        tab.addEventListener('click', (e) => {
          let newHash = e.target.attributes['data-bs-target'].value;

          const periodMap = {
            "#payMonthly": "monthly",
            "#payOnce": "once",
          };

          switch (newHash) {
            case "#payMonthly":
              newHash = `#donate-${currentBeneficiary}-card-${periodMap[newHash]}`;

              document.getElementById("amountPaymentPrompt").classList.add("hidden");
              document.getElementById("amountSubscriptionPrompt").classList.remove("hidden");
              break;

            case "#payOnce":
              newHash = `#donate-${currentBeneficiary}-card-${periodMap[newHash]}`;

              document.getElementById("amountSubscriptionPrompt").classList.add("hidden");
              document.getElementById("amountPaymentPrompt").classList.remove("hidden");
              break;

            case "#donate-card":
              // click on pay by card tab
              const newBeneficiary = e.target.attributes['data-beneficiary'].value;

              newHash = `#donate-${newBeneficiary}-card-monthly`;

              // select subscription by default
              document.querySelector('.nav-link[data-bs-target="#payMonthly"]').dispatchEvent(new MouseEvent('click'));

              document.getElementById("amountPaymentPrompt").classList.add("hidden");
              document.getElementById("amountSubscriptionPrompt").classList.remove("hidden");
              break;
          }

          location.hash = newHash;

          history.replaceState({}, '', location.toString());
        });
      });
    }

    // update UI according to hash
    setTimeout(() => {
      if (location.hash) {
        // if hash is not blank then set language cookie to prevent redirection
        const date = new Date();
        const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        const expires = "expires=" + tomorrow.toGMTString();
        // /en/donate-en/
        // /donate/
        const lang = location.pathname.split("/")[1] === "en" ? "en" : 'ua';

        document.cookie = `selected_lang=${lang}; ${expires}; path=/`;
      }

      // handle hash requested
      let [rest, beneficiary, payment_type = "card", period = "monthly"] = location.hash.split("-");

      if (beneficiary !== "army" && beneficiary !== "fund") {
        beneficiary = "army";
      }
      currentBeneficiary = beneficiary;

      // click on matching buttons
      document.querySelector(`input#help-${beneficiary}.btn-check`).dispatchEvent(new MouseEvent('click'));

      showTabs(beneficiary);

      let hash = `#donate-${beneficiary}`;

      if (payment_type) {
        if (payment_type === "card") {
          document.getElementById(`tab-${payment_type}-${beneficiary}`).dispatchEvent(new MouseEvent('click'));
        } else {
          document.querySelector(`.nav-link[data-bs-target="#donate-${beneficiary}-${payment_type}"]`).dispatchEvent(new MouseEvent('click'));
        }

        hash += `-${payment_type}`;

        if (payment_type === "card" && period) {
          // need minimal delay here to make sure top level tab appeared
          setTimeout(() => {
            // for card payment need additionally switch to requested button
            document.getElementById(`tab-pay-${period}`).dispatchEvent(new MouseEvent('click'));

            hash += `-${period}`;
          }, 100);
        }
      } else {
        hash += `-card-monthly`;
      }

      document.querySelector("form.support-fund-donate-form fieldset").removeAttribute("disabled");
      // enable submit button
      document.getElementById("activateDonateFormButton").classList.remove("disabled");

      // initial hash setup
      location.hash = hash;

      history.replaceState({}, '', location.toString());

      // call this at the end to avoid wave rippling effect during tab switching
      attachHandlers();
    }, 1500);
  }
);
