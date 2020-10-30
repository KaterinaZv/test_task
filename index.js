"use strict";

class Validation {
  constructor() {
    this.emailRegex = /^[a-zA-Z0-9_.]+@(gmail\.com|(yandex|mail)\.ru)$/;
    this.phoneRegex = /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/;
  }

  validateEmail(email) {
    const isEmailValid = this.emailRegex.test(email);
    if (isEmailValid) {
      return undefined;
    }

    return "Необходимо указать домен yandex.ru, mail.ru или gmail.com.";
  }

  validatePhone(phone) {
    const resultTestPhone = this.phoneRegex.test(phone);

    const countOfNumbersInPhone = phone
      .split("")
      .map((string) => parseInt(string))
      .filter((value) => value)
      .reduce((accumulator, phoneNum) => accumulator + phoneNum, 0);

    const isPhoneValid = resultTestPhone && countOfNumbersInPhone < 30;
    if (isPhoneValid) {
      return undefined;
    }

    return "Телефон должен быть указан в формате +7(999)999-99-99";
  }

  validateName(name) {
    const isNameValid = name.split(" ").length === 3;
    if (isNameValid) {
      return undefined;
    }

    return "Должно быть 3 слова";
  }
}

class FakeApiService {
  _get(url) {
    return new Promise((resolve) =>
      setTimeout(() => {
        const randomNumber = Math.random();
        const randomIsSuccess = randomNumber <= 0.33;
        const randomIsError = randomNumber > 0.33 && randomNumber <= 0.66;
        const randomIsProgress = randomNumber > 0.66;

        if (randomIsSuccess) {
          return resolve({ status: "success" });
        }

        if (randomIsError) {
          resolve({ status: "error", reason: "Something went wrong" });
        }

        if (randomIsProgress) {
          resolve({ status: "progress", timeout: Number });
        }
      }, 1500)
    );
  }

  async sendRequest(url, onSuccess, onError) {
    const fakeResponse = await this._get(url);

    if (fakeResponse.status === "success") {
      onSuccess(fakeResponse);
    } else {
      onError(fakeResponse);
    }
  }
}

class MyForm {
  constructor(idForm) {
    this.formElement = document.querySelector(`#${idForm}`);
    this.nameInput = document.querySelector(".fio");
    this.emailInput = document.querySelector(".email");
    this.phoneInput = document.querySelector(".phone");
    this.resultContainer = document.querySelector("#resultContainer");

    this.buttonElement = this.formElement.querySelector("#submitButton");

    this.formElement.addEventListener("submit", (e) => {
      e.preventDefault();

      this.submit();
    });

    this.submit = this.submit.bind(this);

    this._onRequestSuccess = this._onRequestSuccess.bind(this);
    this._onRequestFail = this._onRequestFail.bind(this);
  }

  validate() {
    const data = this.getData();

    const errorFields = [];

    const validation = new Validation();
    const validationErrors = {
      name: validation.validateName(data.fio),
      email: validation.validateEmail(data.email),
      phone: validation.validatePhone(data.phone),
    };

    if (validationErrors.name) {
      this.nameInput.classList.add("error");
      this.nameInput.value = "";
      this.nameInput.placeholder = validationErrors.name;
      errorFields.push("fio");
    }

    if (validationErrors.email) {
      this.emailInput.classList.add("error");
      this.emailInput.value = "";
      this.emailInput.placeholder = validationErrors.email;
      errorFields.push("email");
    }

    if (validationErrors.phone) {
      this.phoneInput.classList.add("error");
      this.phoneInput.value = "";
      this.phoneInput.placeholder = validationErrors.phone;
      errorFields.push("phone");
    }

    const isFormVaild =
      !validationErrors.name &&
      !validationErrors.email &&
      !validationErrors.phone;

    if (isFormVaild) {
      return {
        isValid: true,
        errorField: 0,
      };
    }

    return {
      isValid: false,
      errorField: errorFields,
    };
  }

  getData() {
    return {
      fio: this.nameInput.value,
      email: this.emailInput.value,
      phone: this.phoneInput.value,
    };
  }

  setData(data) {
    this.nameInput.value = data.fio;
    this.emailInput.value = data.email;
    this.phoneInput.value = data.phone;
  }

  submit() {
    if (this.validate().isValid) {
      this._disableForm();

      this.resultContainer.className = "";
      this.resultContainer.innerHTML = "";

      const formEndpointUrl = this.formElement.getAttribute("action");

      const apiService = new FakeApiService();
      apiService.sendRequest(
        formEndpointUrl,
        this._onRequestSuccess,
        this._onRequestFail
      );
    }
  }

  _disableForm() {
    this.buttonElement.disabled = true;
    this.emailInput.disabled = true;
    this.phoneInput.disabled = true;
    this.nameInput.disabled = true;
  }

  _activateForm() {
    this.buttonElement.disabled = false;
    this.emailInput.disabled = false;
    this.phoneInput.disabled = false;
    this.nameInput.disabled = false;
  }

  _polling() {
    setTimeout(this.submit, 1500);
  }

  _onRequestSuccess(data) {
    this.buttonElement.disabled = false;

    this.resultContainer.innerText = data.status;
    this.resultContainer.classList.add("success");

    this._activateForm();
  }

  _onRequestFail(data) {
    if (data.status === "progress") {
      this.resultContainer.classList.add("progress");
      this._polling();
    } else {
      this._activateForm();
    }

    this.buttonElement.disabled = false;
    this.resultContainer.innerHTML = data.status;
    this.resultContainer.classList.add("error");
  }
}

(function () {
  const form = new MyForm("data");
})();
