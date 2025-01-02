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

function checkValidity(inputEl) {
	inputEl.formValidation.isValidating = true;

	resetValidity(inputEl);

	const { validator } = inputEl.formValidation;
	if (validator) {
		validator(inputEl);
	}

	const result = inputEl.checkValidity();

	inputEl.formValidation.isValidating = false;

	return result;
}

function hideValidity(inputEl) {
	const { fieldEl } = inputEl.formValidation;
	fieldEl.classList.remove('show-field-error');
}

function showValidity(inputEl) {
	const { fieldEl } = inputEl.formValidation;
	fieldEl.classList.add('show-field-error');
}

function inputEventListener() {
	checkValidity(this);

	const { showValidity } = this.formValidation;
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

export default function addInputFormValidation(inputEl, callback) {
	const fieldEl = inputEl.closest('.field');
	if (!fieldEl) {
		return;
	}

	inputEl.formValidation = {
		errorEl: fieldEl.querySelector('.field-error-text'),
		fieldEl,
		isValidating: false,
		validator: null,

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

export function removeInputFormValidation(inputEl, callback) {
	callback?.(inputEl);

	resetValidity(inputEl);

	inputEl.removeEventListener('input', inputEventListener);
	inputEl.removeEventListener('invalid', invalidEventListener);

	delete inputEl.formValidation;
}
