const DONATE_EMAIL = "donateEmail";
const DONATE_AMOUNT = "donateAmount";
const DONATE_CURRENCY = "donate-currency";

class SolidgateClient {

    constructor(parentSelector) {
        this.parentSelector = parentSelector;
        this.donateOneTime = false;
        this.formIsDestroyed = true;

        this.activateDonateFormListeners = [];

        let titleText = document.getElementById('solidgate-labels-titleText')?.textContent;
        if (!titleText) {
            titleText = 'або оплатіть карткою';
        }
        this.titleText = titleText;

        let submitButtonText = document.getElementById('solidgate-labels-submitButtonText')?.textContent;
        if (!submitButtonText) {
            submitButtonText = 'Підтримати';
        }
        this.submitButtonText = submitButtonText;

        let inputFieldStyles = {
            input: {
                padding: '10px',
                background: '#fff',
                border: '1px solid #babfc8',
                'border-radius': '4px',
                'font-family': 'Helvetica Neue,sans-serif'
            }
        };
        this.formConfig = {
            iframeParams: {
                width: '100%'
            },
            formParams: {
                titleText: this.titleText,
                submitButtonText: this.submitButtonText,
                autoFocus: false
            },
            styles: {
                submit_button: {'background-color': '#5b7742'},
                header: {
                    display: 'flex',
                    color: '#f3f3f3',
                    'border-top': '1px solid #babfc8',
                    'font-size': 0,
                    margin: '0 auto',
                    position: 'absolute',
                    top: '15px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '95%',
                    'z-index': '-1'
                },
                form_title: {
                    display: 'flex',
                    'justify-content': 'center',
                    margin: '0 37%',
                    'background-color': '#f3f3f3',
                    color: '#666c7b'
                },
                card_number: inputFieldStyles,
                expiry_date: inputFieldStyles,
                card_cvv: inputFieldStyles
            }
        }
    }

    getFormConfig()
    {
        return this.formConfig;
    }

    extendFormConfig(configObject)
    {
        this.formConfig = {
            ...this.formConfig,
            ...configObject
        }
        return this;
    }

    async postData(url = '', data = {})
    {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        });
        return response.json();
    }

    setDonateOneTime(value)
    {
        this.donateOneTime = value;
    }

    isDonateSubscription()
    {
        return !this.donateOneTime;
    }

    isDonateOneTime()
    {
        return this.donateOneTime;
    }

    regenerateForm()
    {
        this.activateDonateForm();
    }

    destroyForm()
    {
        if (this.form) {
            this.form.destroy();
            this.formIsDestroyed = true;
        }
    }

    getProductId()
    {
        let productId = 0;

        if (this.isDonateSubscription()) {
            productId = document.querySelector(this.parentSelector + ' input[name="bundleSelect"]:checked').value
        }

        return productId;
    }

    getAmount()
    {
        return document.querySelector(`${this.parentSelector} #${DONATE_AMOUNT}`).value;
    }

    getCustomerEmail()
    {
        return document.querySelector(`${this.parentSelector} #${DONATE_EMAIL}`).value;
    }

    getProjectId()
    {
        return document.querySelector('#solidgate-data-projects_id')?.textContent;
    }

    getCurrency()
    {
        return document.querySelector(`${this.parentSelector} [name="${DONATE_CURRENCY}"]:checked`).value;
    }

    /**
     * @returns {number}
     * 0 - army
     * 1 - fund
     */
    getWhoToSupport()
    {
        if (document.getElementById('help-fund')?.checked) {
            return 1;
        }

        return 0;
    }

    validateEmail(email)
    {
        const maxAllowedEmailLengthOnSolidgateSide = 100

        if (!email.length) {
            return false;
        }

        if (email.length > maxAllowedEmailLengthOnSolidgateSide) {
            return false;
        }
        if (!/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z0-9-]{2,63}(?:\.[a-z]{63})?)$/i.test(email.toLowerCase())) {
            return false
        }

        //after all rely on HTML5 validation
        return document.querySelector(`${this.parentSelector} #${DONATE_EMAIL}`).checkValidity();
    }

    validateAmount(amount)
    {
        if (this.isDonateSubscription()) {
            return true;
        }

        const maxDonationAmount = 9999999;
        if (amount > maxDonationAmount) {
            return false;
        }

        return amount >= 1 && Math.round(amount) === parseFloat(amount)
    }

    validateForm({ customer_email = "", amount = 0 })
    {
        const invalidEmail = !this.validateEmail(customer_email);
        const invalidAmount = !this.validateAmount(amount);

        this.setFieldErrorVisible(invalidEmail, DONATE_EMAIL);
        this.setFieldErrorVisible(invalidEmail, DONATE_AMOUNT);

        return !(invalidEmail || invalidAmount);
    }

    setFieldErrorVisible(isVisible, fieldSelector)
    {
        let fieldElement = document.querySelector(`${this.parentSelector} .${fieldSelector}-error`);
        if (fieldElement) {
            fieldElement.style.display = isVisible ? 'block' : 'none';
        }
    }

    resetForm() {
        const form = document.querySelector(`${this.parentSelector} form`);

        form.reset();

        form.querySelectorAll('input').forEach(function (input) {
            input.value = null;
        });

        form.querySelectorAll('.error').forEach(function (element) {
            element.style.display = 'none';
        });
        // hide custom amount fields for the modal because predefined value is set by default
        if (this.parentSelector === '#donate-modal') {
            form.querySelector('.project-donate-field[data-field=donateAmount]').classList.add('hidden');
        }
    }

    async activateDonateForm() {
        this.destroyForm();

        let amount = this.getAmount(),
            customer_email = this.getCustomerEmail(),
            currency = this.getCurrency(),
            language = document.querySelector('html').lang,
            product_id = this.getProductId(),
            project_id = this.getProjectId(),
            url = '/wp-json/solidgate/action/get_form_params_onetime';

        if (amount.indexOf(' ') !== -1) {
            amount = amount.slice(0, -2);
        }

        if (!this.validateForm({
            customer_email,
            amount
        })) {
            return;
        }

        amount = 100 * amount;

        if (this.isDonateSubscription()) {
            currency = this.getCurrency();
            url = '/wp-json/solidgate/action/get_form_params_subscription';
            if (product_id == 0) {
                return;
            }
        }

        let data = {
            amount,
            customer_email,
            product_id,
            currency,
            language,
            project_id,
            whoToSupport: this.getWhoToSupport()
        };

        await this.postData(url, data)
            .then(response => {
                let formConfig = this.getFormConfig();
                formConfig.merchantData = JSON.parse(response.merchantData);

                if (formConfig.styles && formConfig.styles.form_title) {
                  formConfig.styles.form_title['white-space'] = 'nowrap';
                  if (document.body.clientWidth < 420) {
                    formConfig.styles.form_title.margin = '0 22%';
                  }
                  if (document.body.clientWidth < 376) {
                    formConfig.styles.form_title.margin = '0 18%';
                  }
                  if (document.body.clientWidth < 330) {
                    formConfig.styles.form_title.margin = '0 14%';
                  }
                }

                if (!response.googlePayIsVisible && !response.applePayIsVisible) {
                    delete formConfig.styles.header;
                    delete formConfig.styles.form_title;
                }

                this.form = PaymentFormSdk.init(formConfig);
            });

        this.formIsDestroyed = false;

        return true;
    }

    activateDonateFormAddListener(listener)
    {
        if (typeof listener === 'function') {
            this.activateDonateFormListeners.push(listener);
        }
    }
}

// this is for donation page
let parentSelector = '#tabsDonate';
if (document.querySelector(parentSelector)?.offsetParent === null) {
    parentSelector = '#accordionDonate';

    let solidPaymentFormContainer = document.querySelector('#solid-payment-form-container-wrapper');
    solidPaymentFormContainer.remove();
    document.querySelector(parentSelector + ' #bag-for-solid-payment-form-container').appendChild(solidPaymentFormContainer);
}

if (!document.querySelector(parentSelector)) {
    // try to find donate modal
    parentSelector = '#donate-modal';

    if (!document.querySelector(parentSelector)) {
        parentSelector = '';
    }
}

let solidgateClient = new SolidgateClient(parentSelector);

if (window.solidgateClientCustomFormConfig) {
    solidgateClient.extendFormConfig(window.solidgateClientCustomFormConfig);
}

window.setTimeout(() => {
    document.querySelectorAll('.regenerate-form')
        .forEach((element, index) => {
            element.onclick = () => {
                destroyDonateForm();
            }
        });
    document.querySelectorAll('[name="bundleSelect"]')
        .forEach((element, index) => element.onchange = () => {
            destroyDonateForm();
        });

    document.querySelectorAll('.donate-once')
        .forEach((element, index) => element.onclick = () => {
            solidgateClient.setDonateOneTime(true);
        });
    document.querySelectorAll('.donate-subscription')
        .forEach((element, index) => element.onclick = () => {
            solidgateClient.setDonateOneTime(false);
        });
}, 1000);

if (document.querySelector(`${parentSelector} #${DONATE_AMOUNT}`)) {
    document.querySelector(`${parentSelector} #${DONATE_AMOUNT}`).onkeyup = () => {
        const amountErrorElement = document.querySelector(`${parentSelector} .${DONATE_AMOUNT}-error`);
        if (amountErrorElement) {
            amountErrorElement.style.display = 'none';
        }
        destroyDonateForm();
    }
}

if (document.querySelector(`${ parentSelector } #${ DONATE_EMAIL }`)) {
    const emailValidationMessage = document.querySelector(`${ parentSelector } .${ DONATE_EMAIL }-error`);
    if (emailValidationMessage) {
        document.querySelector(`${ parentSelector } #${ DONATE_EMAIL }`).onkeyup = () => {
            emailValidationMessage.style.display = 'none';
            destroyDonateForm();
        };
    }
}

const hideFondyFallbackBlock = () => { document.querySelector(`#fondy_fallback`).style.display = 'none'; }
const hideCustomErrorMessages = () => {
    document.querySelectorAll('#custom_error_messages, #custom_error_messages p')
        .forEach((el) => {el.classList.add('d-none');});
}
const destroyDonateForm = () => {
    if (!solidgateClient.formIsDestroyed) {
        // also set formIsDestroyed = true
        solidgateClient.destroyForm();
    }
    hideFondyFallbackBlock();
    hideCustomErrorMessages();

    // show submit button
    document.getElementById('activateDonateFormButton').classList.remove('d-none');
}

const resetDonateForm = () => {
  solidgateClient.resetForm()
}

const activateDonateForm = (buttonClicked, isDonateOneTime = solidgateClient.donateOneTime) => {
    destroyDonateForm();

    solidgateClient.setDonateOneTime(isDonateOneTime);
    let loadingStateClass = 'disabled';

    if (buttonClicked.classList.contains(loadingStateClass)) {
        return false;
    }

    buttonClicked.classList.add(loadingStateClass);
    solidgateClient.activateDonateForm()
        .then(isFormActivated => {
            if (isFormActivated) {
                // hide submit button
                solidgateClient.form.on('mounted', (e) => { buttonClicked.classList.add('d-none'); });

                solidgateClient.form.on('formRedirect', (e) => {
                    document.getElementById('solid-payment-form-iframe').height = '500px';
                });
                // TODO: figure out if error can be related to email only
                solidgateClient.form.on('error', (e) => {
                    document.querySelector(`${parentSelector} .${DONATE_EMAIL}-error`).style.display = 'block';
                });
            }
            setTimeout(() => buttonClicked.classList.remove(loadingStateClass), 1000);

            solidgateClient.activateDonateFormListeners.forEach((callback, index) => {
                callback();
            });
        });

    return true;
}
