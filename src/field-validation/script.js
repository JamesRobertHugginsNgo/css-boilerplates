function getValidationMessages(fieldsetEl) {
	const result = [];
	for (const inputEl of fieldsetEl.elements) {
		if (!inputEl.formValidation) {
			continue;
		}
		const { isValidating } = inputEl.formValidation;
		if (!isValidating) {
			checkValidity(inputEl);
		}
		result.push(inputEl.validationMessage);
	}
	return result.filter(function (value, index, array) {
		return value && array.indexOf(value) === index;
	});
}

function checkValidity(inputEl) {
	inputEl.formValidation.isValidating = true;
	const { validators } = inputEl.formValidation;
	resetValidity(inputEl);
	for (const validator of validators) {
		validator(inputEl);
		if (inputEl.validity.customError) {
			break;
		}
	}
	const result = inputEl.checkValidity();
	inputEl.formValidation.isValidating = false;
	return result;
}

function hideValidity(inputEl) {
	const { fieldEl } = inputEl.formValidation;
	fieldEl.classList.remove('show-field-error');
}

function resetValidity(inputEl) {
	const { errorEl, fieldEl } = inputEl.formValidation;
	if (inputEl.validity.customError) {
		inputEl.setCustomValidity('');
	}
	if (errorEl && fieldEl instanceof HTMLFieldSetElement) {
		const validationMessages = getValidationMessages(fieldEl);
		if (validationMessages.length > 0) {
			errorEl.textContent = validationMessages.join(', ');
			return;
		}
	}
	fieldEl.classList.remove('field-error');
}

function showValidity(inputEl) {
	const { fieldEl } = inputEl.formValidation;
	fieldEl.classList.add('show-field-error');
}

function inputEventListener() {
	const { showValidity } = this.formValidation;
	checkValidity(this);
	showValidity();
}

function invalidEventListener() {
	const { errorEl, fieldEl } = this.formValidation;
	if (errorEl) {
		if (fieldEl instanceof HTMLFieldSetElement) {
			errorEl.textContent = getValidationMessages(fieldEl).join(', ');
		} else {
			errorEl.textContent = this.validationMessage;
		}
	}
	fieldEl.classList.add('field-error');
}

function inputAddFormValidation(inputEl, callback) {
	const fieldEl = inputEl.closest('.field');
	if (!fieldEl) {
		return;
	}

	inputEl.formValidation = {
		errorEl: fieldEl.querySelector('.field-error-text'),
		fieldEl,
		isValidating: false,
		validators: [],

		checkValidity() {
			return checkValidity(inputEl);
		},
		hideValidity() {
			hideValidity(inputEl);
		},
		showValidity() {
			showValidity(inputEl)
		}
	};

	inputEl.addEventListener('input', inputEventListener);
	inputEl.addEventListener('invalid', invalidEventListener);

	checkValidity(inputEl);
	callback?.(inputEl);
}

function resetEventListener() {
	for (const inputEl of this.elements) {
		inputEl.formValidation?.hideValidity();
	}

	setTimeout(() => {
		for (const inputEl of this.elements) {
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

function formAddFormValidation(formEl, callback) {
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
		inputAddFormValidation(inputEl, callback);
	}

	callback?.(formEl);
}

export default function addFormValidation(element, callback) {
	if (element instanceof HTMLFormElement) {
		formAddFormValidation(element, callback);
	} else {
		inputAddFormValidation(element, callback);
	}
}

function inputRemoveFormValidation(inputEl, callback) {
	callback?.(inputEl);
	resetValidity(inputEl);
	inputEl.removeEventListener('input', inputEventListener);
	inputEl.removeEventListener('invalid', invalidEventListener);
	delete inputEl.formValidation;
}

export function formRemoveFormValidation(formEl, callback) {
	callback?.(formEl);

	for (const inputEl of formEl.elements) {
		if (inputEl instanceof HTMLFieldSetElement || inputEl.formValidation) {
			continue;
		}

		inputRemoveFormValidation(inputEl, callback);
	}

	formEl.removeEventListener('reset', resetEventListener);
	formEl.removeEventListener('submit', submitEventListener);

	const { hasNovalidate } = formEl.formValidation;
	if (!hasNovalidate) {
		formEl.removeAttribute('novalidate');
	}

	delete formEl.formValidation;
}

export function removeFormValidation(element, callback) {
	if (element instanceof HTMLFormElement) {
		formRemoveFormValidation(element, callback);
	} else {
		inputRemoveFormValidation(element, callback);
	}
}

export function reportValidity(formEl) {
	for (const inputEl of formEl.elements) {
		inputEl.formValidation?.showValidity();
	}
	return formEl.reportValidity();
}
