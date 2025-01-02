// REFERENCE:
// - https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
// - https://web.dev/articles/more-capable-form-controls#form-associated-custom-elements

import addInputFormValidation from './scripts/add-input-form-validation.js';

// ==
// TEMPLATE
// ==

const templateEl = document.createElement('template');
templateEl.innerHTML = `
	<link rel="stylesheet" href="../field/style.css">
	<link rel="stylesheet" href="../field-input/style.css">
	<div class="field">
		<label for="text-name" class="field-label" style="display: none"></label>
		<div class="field-help-text" style="display: none"></div>
		<input name="text-name" type="text" id="text-name" class="field-input">
		<div class="field-help-text" style="display: none"></div>
		<div class="field-error-text"></div>
	</div>
`;

// ==
// CLASS
// ==

class SampleComponent extends HTMLElement {

	// STATIC PROPERTIES

	static formAssociated = true;
	static observedAttributes = [
		'label',
		'posthelptext',
		'prehelptext',
		'required',
		'value'
	];

	// PRIVATE PROPERTIES

	#elementInternals;

	#label;
	#postHelpText;
	#preHelpText;
	#required = false;
	#value;

	#inputEl;
	#labelEl;
	#postHelpTextEl;
	#preHelpTextEl;

	// PRIVATE METHOD

	#setValidity() {
		this.#elementInternals.setValidity(
			this.#inputEl.validity,
			this.#inputEl.validationMessage,
			this.#inputEl
		);
	}

	// PUBLIC PROPERTIES

	get form() {
		return this.#elementInternals.form;
	}

	get formValidation() {
		return this.#inputEl.formValidation
	}

	get label() {
		return this.#label;
	}
	set label(newValue) {
		this.#label = newValue;
		this.#labelEl.textContent = this.#label;
		if (this.#label) {
			this.#labelEl.style.removeProperty('display');
		} else {
			this.#labelEl.style.setProperty('display', 'none');
		}
	}

	get name() {
		return this.getAttribute('name');
	}
	set name(newValue) {
		if (!newValue) {
			this.removeAttribute('name');
			return;
		}

		this.setAttribute('name', newValue);
	}

	get postHelpText() {
		return this.#postHelpText;
	}
	set postHelpText(newValue) {
		this.#postHelpText = newValue;
		this.#postHelpTextEl.textContent = this.#postHelpText;
		if (this.#postHelpText) {
			this.#postHelpTextEl.style.removeProperty('display');
		} else {
			this.#postHelpTextEl.style.setProperty('display', 'none');
		}
	}

	get preHelpText() {
		return this.#preHelpText;
	}
	set preHelpText(newValue) {
		this.#preHelpText = newValue;
		this.#preHelpTextEl.textContent = this.#preHelpText;
		if (this.#preHelpText) {
			this.#preHelpTextEl.style.removeProperty('display');
		} else {
			this.#preHelpTextEl.style.setProperty('display', 'none');
		}
	}

	get required() {
		return this.#required;
	}
	set required(newValue) {
		this.#required = newValue;
		if (!this.#required) {
			this.#inputEl.removeAttribute('required');
		} else {
			this.#inputEl.setAttribute('required', '');
		}

		this.#inputEl.formValidation.checkValidity();
		this.#setValidity();
	}

	get type() {
		return this.localName;
	}

	get validity() {
		return this.#elementInternals.validity;
	}

	get validationMessage() {
		return this.#elementInternals.validationMessage;
	}

	get value() {
		return this.#value;
	}
	set value(newValue) {
		this.#value = newValue;
		this.#inputEl.value = this.#value;
		this.#inputEl.dispatchEvent(new Event('input'));
	}

	// PUBLIC METHODS

	checkValidity() {
		return this.#elementInternals.checkValidity();
	}

	reportValidity() {
		return this.#elementInternals.reportValidity();
	}

	// LIFE CYCLE

	constructor() {
		super();

		this.attachShadow({
			mode: 'open',
			delegatesFocus: true
		});
		this.shadowRoot.appendChild(templateEl.content.cloneNode(true));
		this.#elementInternals = this.attachInternals();

		this.#labelEl = this.shadowRoot.querySelector('label');

		const [preHelpTextEl, postHelpTextEl] = [...this.shadowRoot.querySelectorAll('.field-help-text')]
		this.#preHelpTextEl = preHelpTextEl;
		this.#postHelpTextEl = postHelpTextEl;

		this.#inputEl = this.shadowRoot.querySelector('input');
		addInputFormValidation(this.#inputEl);
		this.#setValidity();
		this.#inputEl.addEventListener('input', () => {
			this.#value = this.#inputEl.value;
			this.#elementInternals.setFormValue(this.#value);
			this.#setValidity();
		});
	}

	// connectedCallback() { }

	// disconnectedCallback() { }

	// adoptedCallback() { }

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'label':
				this.label = newValue;
				break;
			case 'posthelptext':
				this.postHelpText = newValue;
				break;
			case 'prehelptext':
				this.preHelpText = newValue;
				break;
			case 'required':
				this.required = newValue !== undefined;
				break;
			case 'value':
				this.value = newValue;
				break;
		}
	}

	// formAssociatedCallback(formEL) {}

	formResetCallback() {
		this.#inputEl.value = this.getAttribute('value') || '';
		this.#setValidity();
	}

	// formStateRestoreCallback(state, mode) {}
}

// ==
// DEFINE
// ==

customElements.define('sample-component', SampleComponent);
