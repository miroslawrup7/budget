const balanceBarLoc = document.querySelector(".balance");
const balanceValueLoc = document.querySelector(".balance-value");
const balanceEmojiLoc = document.querySelector(".emoji");

const incomeAddLoc = document.querySelector(".income .add");
const incomeEditLoc = document.querySelector(".income .edit");

const spendAddLoc = document.querySelector(".spend .add");
const spendEditLoc = document.querySelector(".spend .edit");

const incomeEditNameLoc = document.querySelector(".income .edit .name");
const incomeEditValueLoc = document.querySelector(".income .edit .value");
const incomeEditButtonLoc = document.querySelector(".income .edit .button");

const spendEditNameLoc = document.querySelector(".spend .edit .name");
const spendEditValueLoc = document.querySelector(".spend .edit .value");
const spendEditButtonLoc = document.querySelector(".spend .edit .button");

const addNameInput = document.querySelectorAll(".add .name");
const addValueInput = document.querySelectorAll(".add .value");
const addButton = document.querySelectorAll(".add .button");

const incomeList = document.querySelector(".income .list");
const spendList = document.querySelector(".spend .list");

const incomeElementValueLoc = document.querySelectorAll(
    ".income-top-wrapper .list-value"
);
const incomeTotalValueLoc = document.querySelector(
    ".income .total .list-value"
);
const spendElementValueLoc = document.querySelectorAll(
    ".spend-top-wrapper .list-value"
);
const spendTotalValueLoc = document.querySelector(".spend .total .list-value");

let addName = "";
let addValue = "";
let incomeHTMLFragment = "";
let spendHTMLFragment = "";
let incomeTotal = 0;
let spendTotal = 0;

const validateNum = (validElement) => {
    if (isNaN(validElement.value)) {
        validElement.value = "";
    }

    if (validElement.value.indexOf(" ") !== -1) {
        validElement.value = validElement.value.replace(" ", "");
    }
};

const validateMaxLen = (validElement, len) => {
    if (validElement.value.length > len) {
        validElement.value = validElement.value.substr(0, len);
    }
};

const validateMinLen = (validElement, len) => {
    if (validElement.value.length < len) {
        for (let i = 0; i <= len - validElement.value.length; i++) {
            validElement.value = "0" + validElement.value;
        }
    }
};

const validateDecimal = (validElement, len) => {
    if (validElement.value !== "") {
        validElement.value = Number(validElement.value).toFixed(len);
    }
};

addNameInput.forEach(function (element, index) {
    addNameInput[index].value = "";
});

addValueInput.forEach(function (element, index) {
    addValueInput[index].value = "";

    addValueInput[index].addEventListener("input", () => {
        validateNum(addValueInput[index]);
    });

    addValueInput[index].addEventListener("blur", () => {
        validateDecimal(addValueInput[index], 2);
    });
});

addButton.forEach(function (element, index) {
    addButton[index].addEventListener("click", () => {
        addName = addNameInput[index].value;
        addValue = addValueInput[index].value;
        if (!addName) {
            return alert("Nazwa musi być podana!");
        }
        if (!addValue) {
            return alert("Kwota musi być podana!");
        }
        //zarejestruj dane w bazie
        if (element.id === "income-add-button") {
            saveNewIncome(addName, addValue);
        }
        if (element.id === "spend-add-button") {
            saveNewSpend(addName, addValue);
        }
    });
});

// income calculating
const refreshIncomeList = () => {
    let openRequest = indexedDB.open("budget");

    openRequest.onupgradeneeded = function () {
        // jeżeli pierwszy raz dana wersja (2) to stwórz kolekcję (store)
        let db = openRequest.result;
        if (!db.objectStoreNames.contains("income")) {
            db.createObjectStore("income", { autoIncrement: true });
        }
    };

    openRequest.onerror = function () {
        console.error("Error", openRequest.error);
    };

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("income");
        let incomes = transaction.objectStore("income");
        let incomesList = incomes.openCursor();

        incomesList.onsuccess = function () {
            let cursor = incomesList.result;
            if (cursor) {
                let key = cursor.key;
                let value = cursor.value;

                incomeHTMLFragment =
                    incomeHTMLFragment +
                    `<div class="list-row"><div class="list-content"><div class="list-name">${
                        value.name
                    }</div><div class="list-value">${Number(
                        value.value
                    ).toFixed(
                        2
                    )}</div></div><div class="list-buttons"><div class="list-edit" data-key="${key}"><img src="images/pencil.svg" height="16"/></div><div class="list-delete" data-key="${key}"><img src="images/trash.svg" height="16"/></div></div></div>`;

                incomeTotal = incomeTotal + Number(value.value);

                cursor.continue();
            }
        };
    };
};

const saveNewIncome = (name, value) => {
    let openRequest = indexedDB.open("budget");

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("income", "readwrite");
        let incomes = transaction.objectStore("income");

        let income = {
            name: name,
            value: value,
            created: new Date(),
        };

        let request = incomes.add(income);

        request.onsuccess = function () {
            refreshIncomeList();
        };

        request.onerror = function () {
            console.log("Error", request.error);
        };
    };
    window.location.reload(true);
};

const editIncome = (key, name, value) => {
    let openRequest = indexedDB.open("budget");

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("income", "readwrite");
        let incomes = transaction.objectStore("income");

        let income = {
            name: name,
            value: value,
            created: new Date(),
        };

        let request = incomes.put(income, Number(key));

        request.onsuccess = function () {
            refreshIncomeList();
        };

        request.onerror = function () {
            console.log("Error", request.error);
        };
    };
    window.location.reload(true);
};

const deleteIncome = (key) => {
    console.log(typeof key);
    let openRequest = indexedDB.open("budget");

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("income", "readwrite");
        let incomes = transaction.objectStore("income");
        console.log(typeof key);
        console.log(key);
        let request = incomes.delete(Number(key));

        request.onsuccess = function () {
            refreshIncomeList();
        };

        request.onerror = function () {
            console.log("Error", request.error);
        };
    };
    window.location.reload(true);
};

const searchIncome = (key) => {
    let openRequest = indexedDB.open("budget");

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("income");
        let incomes = transaction.objectStore("income");
        let request = incomes.get(Number(key));

        request.onsuccess = function () {
            incomeEditNameLoc.value = request.result.name;
            incomeEditValueLoc.value = request.result.value;
            incomeEditButtonLoc.setAttribute("data-key", key);
        };

        request.onerror = function () {
            console.log("Error", request.error);
        };
    };
};

refreshIncomeList();

// spend calculating
const refreshSpendList = () => {
    let openRequest = indexedDB.open("budget", 2);

    openRequest.onupgradeneeded = function () {
        // jeżeli pierwszy raz dana wersja (2) to stwórz kolekcję (store)
        let db = openRequest.result;
        if (!db.objectStoreNames.contains("spend")) {
            db.createObjectStore("spend", { autoIncrement: true });
        }
    };

    openRequest.onerror = function () {
        console.error("Error", openRequest.error);
    };

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("spend");
        let spends = transaction.objectStore("spend");
        let spendsList = spends.openCursor();

        spendsList.onsuccess = function () {
            let cursor = spendsList.result;
            if (cursor) {
                let key = cursor.key;
                let value = cursor.value;

                spendHTMLFragment =
                    spendHTMLFragment +
                    `<div class="list-row"><div class="list-content"><div class="list-name">${
                        value.name
                    }</div><div class="list-value">${Number(
                        value.value
                    ).toFixed(
                        2
                    )}</div></div><div class="list-buttons"><div class="list-edit" data-key="${key}"><img src="images/pencil.svg" height="16"/></div><div class="list-delete" data-key="${key}"><img src="images/trash.svg" height="16"/></div></div></div>`;

                spendTotal = spendTotal + Number(value.value);

                cursor.continue();
            }
        };
    };
};

const saveNewSpend = (name, value) => {
    let openRequest = indexedDB.open("budget");

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("spend", "readwrite");
        let spends = transaction.objectStore("spend");

        let spend = {
            name: name,
            value: value,
            created: new Date(),
        };

        let request = spends.add(spend);

        request.onsuccess = function () {
            refreshSpendList();
        };

        request.onerror = function () {
            console.log("Error", request.error);
        };
    };
    window.location.reload(true);
};

const editSpend = (key, name, value) => {
    let openRequest = indexedDB.open("budget");

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("spend", "readwrite");
        let spends = transaction.objectStore("spend");

        let spend = {
            name: name,
            value: value,
            created: new Date(),
        };

        let request = spends.put(spend, Number(key));

        request.onsuccess = function () {
            refreshSpendList();
        };

        request.onerror = function () {
            console.log("Error", request.error);
        };
    };
    window.location.reload(true);
};

const deleteSpend = (key) => {
    console.log(typeof key);
    let openRequest = indexedDB.open("budget");

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("spend", "readwrite");
        let spends = transaction.objectStore("spend");
        console.log(typeof key);
        console.log(key);
        let request = spends.delete(Number(key));

        request.onsuccess = function () {
            refreshSpendList();
        };

        request.onerror = function () {
            console.log("Error", request.error);
        };
    };
    window.location.reload(true);
};

const searchSpend = (key) => {
    let openRequest = indexedDB.open("budget");

    openRequest.onsuccess = function () {
        let db = openRequest.result;
        let transaction = db.transaction("spend");
        let spends = transaction.objectStore("spend");
        let request = spends.get(Number(key));

        request.onsuccess = function () {
            spendEditNameLoc.value = request.result.name;
            spendEditValueLoc.value = request.result.value;
            spendEditButtonLoc.setAttribute("data-key", key);
        };

        request.onerror = function () {
            console.log("Error", request.error);
        };
    };
};

refreshSpendList();

const funcAfterLoad = () => {
    //income

    incomeList.innerHTML = incomeHTMLFragment;

    incomeTotalValueLoc.textContent = incomeTotal.toFixed(2);

    const incomeElementEditLoc = document.querySelectorAll(
        ".income-top-wrapper .list-edit"
    );

    incomeElementEditLoc.forEach(function (element) {
        element.addEventListener("click", (e) => {
            element.parentElement.parentElement.style.opacity = 0.3;
            incomeAddLoc.classList.add("hidden");
            incomeEditLoc.classList.remove("hidden");
            searchIncome(e.target.getAttribute("data-key"));
            incomeEditButtonLoc.addEventListener("click", (e) => {
                if (!incomeEditNameLoc.value) {
                    return alert("Nazwa musi być podana!");
                }
                if (!incomeEditValueLoc.value) {
                    return alert("Kwota musi być podana!");
                }
                editIncome(
                    e.target.getAttribute("data-key"),
                    incomeEditNameLoc.value,
                    incomeEditValueLoc.value
                );
            });
        });
    });

    const incomeElementDeleteLoc = document.querySelectorAll(
        ".income-top-wrapper .list-delete"
    );

    incomeElementDeleteLoc.forEach(function (element) {
        element.addEventListener("click", (e) => {
            deleteIncome(e.target.getAttribute("data-key"));
        });
    });

    //spend

    spendList.innerHTML = spendHTMLFragment;

    spendTotalValueLoc.textContent = spendTotal.toFixed(2);

    const spendElementEditLoc = document.querySelectorAll(
        ".spend-top-wrapper .list-edit"
    );
    spendElementEditLoc.forEach(function (element) {
        element.addEventListener("click", (e) => {
            element.parentElement.parentElement.style.opacity = 0.3;
            spendAddLoc.classList.add("hidden");
            spendEditLoc.classList.remove("hidden");
            searchSpend(e.target.getAttribute("data-key"));
            spendEditButtonLoc.addEventListener("click", (e) => {
                if (!spendEditNameLoc.value) {
                    return alert("Nazwa musi być podana!");
                }
                if (!spendEditValueLoc.value) {
                    return alert("Kwota musi być podana!");
                }
                editSpend(
                    e.target.getAttribute("data-key"),
                    spendEditNameLoc.value,
                    spendEditValueLoc.value
                );
            });
        });
    });

    const spendElementDeleteLoc = document.querySelectorAll(
        ".spend-top-wrapper .list-delete"
    );

    spendElementDeleteLoc.forEach(function (element) {
        element.addEventListener("click", (e) => {
            deleteSpend(e.target.getAttribute("data-key"));
        });
    });

    //balance

    let balance = incomeTotal - spendTotal;

    balanceValueLoc.textContent = balance.toFixed(2);

    if (balance < 0) {
        balanceBarLoc.classList.add("red");
        balanceBarLoc.classList.remove("orange");
        balanceBarLoc.classList.remove("green");
        balanceEmojiLoc.classList.add("frown");
        balanceEmojiLoc.classList.remove("smile");
        balanceEmojiLoc.classList.remove("meh");
    }

    if (balance == 0) {
        balanceBarLoc.classList.remove("red");
        balanceBarLoc.classList.add("orange");
        balanceBarLoc.classList.remove("green");
        balanceEmojiLoc.classList.remove("frown");
        balanceEmojiLoc.classList.remove("smile");
        balanceEmojiLoc.classList.add("meh");
    }

    if (balance > 0) {
        balanceBarLoc.classList.remove("red");
        balanceBarLoc.classList.remove("orange");
        balanceBarLoc.classList.add("green");
        balanceEmojiLoc.classList.remove("frown");
        balanceEmojiLoc.classList.add("smile");
        balanceEmojiLoc.classList.remove("meh");
    }
};

window.onload = function () {
    setTimeout(funcAfterLoad, 500);
};
