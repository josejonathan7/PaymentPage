const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("Payment-Page: Transaction")) || []
    },
    set(value) {
        localStorage.setItem("Payment-Page: Transaction", JSON.stringify(value))
    }
}

const date = new Date()

const Transaction = {
    all: Storage.get(),
    addTransaction(newData) {
        Transaction.all.push(newData)

        App.reload()
    },
    removeTransaction() {
        Transaction.all.splice(Transaction.all)

        App.reload()
    },
}

const DOM = {
    transactionContainer: document.querySelector('tbody'),
    insertHTML(transaction, index) {

        const html = `
        <td>${index+1}</td>
        <td class="image-table">${transaction.cardNumber}</td>
        <td>${Utils.formatDate(date)}</td>
        <td>${transaction.securityCode} / ${transaction.expiryDate} Months</td>
        <td class="image-table">${transaction.paymentType}</td>
        <td class="completed-transaction">${transaction.username}</td>
        `;

        return html
    },
    returnData(transaction, index) {
        const tr = document.createElement('tr')

        tr.innerHTML = DOM.insertHTML(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)

        return DOM.transactionContainer
    },
    clearData() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Form = {
    paymentType: document.getElementsByName('payment-mode-input'),
    cardNumber: document.querySelector('div input#card-number'),
    userName: document.querySelector('input#name'),
    expiryDate: document.querySelector('input#date'),
    securityCode: document.querySelector('input#security-code'),
    getValues() {
        let paymentType;

        for(let i=0; i< Form.paymentType.length; i++){
            if(Form.paymentType[i].checked){
                paymentType = Form.paymentType[i].value
                break;
            }
        }

        return {
            paymentType: paymentType,
            cardNumber: Form.cardNumber.value,
            username: Form.userName.value,
            expiryDate: Form.expiryDate.value,
            securityCode: Form.securityCode.value
        }
    },
    validateData() {
        const { paymentType, cardNumber, username, expiryDate, securityCode } = Form.getValues()

        if (paymentType == "" || cardNumber.trim() == "" || username.trim() === ""
            || expiryDate.trim() == "" || securityCode.trim() == "") {

            throw new Error("Por favor preencha todos os campos para continuar!")
        }

    },
    formatData() {
        let { paymentType, cardNumber, username, expiryDate, securityCode } = Form.getValues()
        let expiryDates;
        let cardNumbers;
        let paymentTypes;
        let securityCodes;
        let userName = String(username);

        if (paymentType == "Paypal") {

            paymentTypes = Utils.forPaypal()

        } else if (paymentType == "Card") {

            paymentTypes = Utils.forCard()

        }

        if (cardNumber.length >= 16) {

            cardNumbers = Utils.forStartup()

        } else if (cardNumber.length < 16 && cardNumber.length >= 14) {

            cardNumbers = Utils.forBusiness()

        } else if (cardNumber.length < 14) {

            cardNumbers = Utils.forEconomy()

        }

        expiryDates = Utils.dateDifference(expiryDate, date)

        securityCodes = Utils.toCash(securityCode, date)

        return {
            paymentType: paymentTypes,
            cardNumber: cardNumbers,
            username: userName,
            expiryDate: expiryDates,
            securityCode: securityCodes
        }
    },
    saveData(newData) {
        Transaction.addTransaction(newData)
    },
    clearData() {
        Form.paymentType.value = "",
        Form.cardNumber.value = "",
        Form.userName.value = "",
        Form.expiryDate.value = "",
        Form.securityCode.value = ""
    },
    submit(event) {
        event.preventDefault();

        try {
            Form.getValues();
            Form.validateData();
            const data = Form.formatData();
            Form.saveData(data);
            Form.clearData();
        } catch (error) {
            alert(error.message)
        }

    }
}


const Utils = {
    forPaypal() {
        const tdContentPaypal = `<img src="./assets/paypal.png" alt=""> Paypal`;

        return tdContentPaypal
    },
    forCard() {
        const tdContentCard = `<img src="./assets/card-exchange.png" alt=""> Credit Card`;

        return tdContentCard
    },
    forBusiness() {
        const tdContentBusiness = `<img src="./assets/business.png" alt=""> Business plan`

        return tdContentBusiness
    },
    forStartup() {
        const tdContentStartup = `<img src="./assets/light-on.png" alt=""> Startup plan`

        return tdContentStartup
    },
    forEconomy() {
        const tdContentEconomy = `<img src="./assets/economic-improvement.png" alt="">Economy plan`

        return tdContentEconomy
    },
    formatDate(dates) {
        const date = dates;
        const oldDate = String(date).split(" ")

        let finalDate = `${oldDate[2]}/${oldDate[1]}/${oldDate[3]}`

        return finalDate
    },
    dateDifference(expiryDates,dates) {
        const currentDate = dates
        let expiryDate = expiryDates
        const currentMonth = String(currentDate).split(" ")
        let expiryDateShare = String(expiryDate).split("-")

        switch (currentMonth[1].toLowerCase()) {
            case "jan":
                currentMonth[1] = 01;
                break;
            case "feb":
                currentMonth[1] = 02;
                break;
            case "mar":
                currentMonth[1] = 03;
                break;
            case "apr":
                currentMonth[1] = 04;
                break;
            case "may":
                currentMonth[1] = 05;
                break;
            case "jun":
                currentMonth[1] = 06;
                break;
            case "jul":
                currentMonth[1] = 07;
                break;
            case "aug":
                currentMonth[1] = 08;
                break;
            case "sep":
                currentMonth[1] = 09;
                break;
            case "oct":
                currentMonth[1] = 10;
                break;
            case "nov":
                currentMonth[1] = 11;
                break;
            case "dec":
                currentMonth[1] = 12;
                break;
            default:
                break;
        }

        let differenceYears = currentMonth[3] - expiryDateShare[0]
        let differenceMonths = currentMonth[1] - expiryDateShare[1]
        let MonthsforYears;

        if(differenceYears != 0){
            switch (differenceYears) {
                case -1:
                    MonthsforYears = (12 - currentMonth[1]) + Number(expiryDateShare[1]);
                    break;
                case -2:
                    MonthsforYears = (12- currentMonth[1]) + 12 + Number(expiryDateShare[1]);
                    break;
                case -3:
                    MonthsforYears = (12- currentMonth[1]) + 24 + Number(expiryDateShare[1]);
                    break;
                case -4:
                    MonthsforYears = (12- currentMonth[1]) + 36 + Number(expiryDateShare[1]);
                    break;
                case -5:
                    MonthsforYears = (12- currentMonth[1]) + 48 + Number(expiryDateShare[1]);
                    break;
                                
                default:
                    break;
            }

            differenceMonths = MonthsforYears;
        }


        let result = String(differenceMonths).replace("-", "")

        return result
    },
    toCash(cvv) {
        const cash = String(cvv).replace("[^0-9]+", "")
        let money = Number(cash).toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })

        return money
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.returnData(transaction, index)
        });

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearData()

        App.init()
    }
}


