import addInputFormValidation, { removeInputFormValidation } from './add-input-form-validation.js';

function resetEventListener() {
	setTimeout(() => { // NEEDED TO RUN AFTER THE VALUE HAS RESETTED
		for (const inputEl of this.elements) {
			inputEl.formValidation?.hideValidity();
			inputEl.formValidation?.checkValidity();
		}
	}, 0);
}

function submitEventListener(event) {
	if (!reportValidity(this)) {
		event.preventDefault();
		event.stopImmediatePropagation();
	}
}

export default function addFormValidation(formEl, callback) {
	formEl.formValidation = {
		hasNovalidate: formEl.hasAttribute('novalidate')
	};

	formEl.setAttribute('novalidate', '');

	formEl.addEventListener('reset', resetEventListener);
	formEl.addEventListener('submit', submitEventListener);

	for (const inputEl of formEl.elements) {
		if (inputEl instanceof HTMLFieldSetElement || inputEl.formValidation) {
			continue;
		}
		addInputFormValidation(inputEl, callback);
	}

	callback?.(formEl);
}

export function removeFormValidation(formEl, callback) {
	callback?.(formEl);

	for (const inputEl of formEl.elements) {
		if (inputEl instanceof HTMLFieldSetElement || inputEl.formValidation) {
			continue;
		}

		removeInputFormValidation(inputEl, callback);
	}

	formEl.removeEventListener('reset', resetEventListener);
	formEl.removeEventListener('submit', submitEventListener);

	const { hasNovalidate } = formEl.formValidation;
	if (!hasNovalidate) {
		formEl.removeAttribute('novalidate');
	}

	delete formEl.formValidation;
}

export function reportValidity(formEl) {
	for (const inputEl of formEl.elements) {
		inputEl.formValidation?.showValidity();
	}

	return formEl.reportValidity();
}
