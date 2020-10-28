"use strict";

const URL_DATABASE = "http://127.0.0.1:5500/server/db.json";
const URL_SUCCESS = "/server/success.json";
const URL_ERROR = "/server/error.json";
const URL_PROGRESS = "/server/progress.json";
const resultContainer = document.querySelector("#resultContainer");

const url = "http://127.0.0.1:5500/db";

class MyForm {
  constructor(idForm) {
    this.form = document.querySelector(`#${idForm}`);
    this.name = document.querySelector(".fio");
    this.email = document.querySelector(".email");
    this.phone = document.querySelector(".phone");
  }

  validate() {
    const data = this.getData();
    console.log(data.fio);
    let resultName, resultPhone, resultEmail;
    let errorFields = [];

    // Проверка на валидацию имени
    if (data.fio.split(" ").length === 3) {
      resultName = data.fio.value;
    } else {
      // const name = document.querySelector(".fio");
      this.name.classList.add("error");
      this.name.value = "";
      this.name.placeholder = "Ровно Три Слова";
      errorFields.push("fio");
    }

    // Проверка на валидацию email
    const reg = /^[a-zA-Z0-9_.]+@(gmail\.com|(yandex|mail)\.ru)$/;
    const resultTestEmail = reg.test(data.email);
    if (resultTestEmail) {
      resultEmail = data.email.value;
    } else {
      // const email = document.querySelector(".email");
      this.email.classList.add("error");
      this.email.value = "";
      this.email.placeholder =
        "Только в доменах yandex.ru, mail.ru, gmail.com.";
      errorFields.push("email");
    }

    // Проверка на валидацию номера
    const regPhone = /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/;
    const resultTestPhone = regPhone.test(data.phone.value);

    const sumNum = data.phone
      .split("")
      .map((string) => parseInt(string))
      .filter((value) => value)
      .reduce(sum, 0);

    function sum(accumulator, a) {
      return accumulator + a;
    }

    if (resultTestPhone && sumNum < 30) {
      resultPhone = data.phone.value;
    } else {
      // const phone = document.querySelector(".phone");
      this.phone.classList.add("error");
      this.phone.value = "";
      this.phone.placeholder = "В формате +7(999)999-99-99";
      errorFields.push("phone");
    }

    if (resultPhone && resultName && resultEmail) {
      return {
        isValid: true,
        errorField: 0,
      };
    } else {
      return {
        isValid: false,
        errorField: errorFields,
      };
    }
  }

  getData() {
    let data;
    data = {
      fio: this.name.value,
      email: this.email.value,
      phone: this.phone.value,
    };
    return data;
  }

  setData(data) {
    data = {
      fio: (this.name.value = data.fio),
      email: (this.email.value = data.email),
      phone: (this.phone.value = data.phone),
    };
  }

  submit() {
    const button = this.form.querySelector("#submitButton");
    if (this.validate().isValid) {
      button.disabled = true;
      this.sendRequest(URL_SUCCESS).then(
        (data) => (resultContainer.innerText = data.status)
      );
    } else {
      this.sendRequest(URL_ERROR).then(
        (data) => (resultContainer.innerHTML = data.status)
      );
    }
  }

  // Отправка запроса
  sendRequest(url) {
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }
}

document.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new MyForm("data");
  console.log(form.submit());
});
