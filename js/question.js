

export class Question {

    constructor() {

    }

    initDom() {
        this.wrap = document.querySelector("main");
        this.table = document.querySelector(".subject-table");
        this.tbody = this.table.querySelector("tbody");
        this.overlay = document.querySelector(".overlay");
    }

    openDb() {
        let openRequest = indexedDB.open("Quiz", 1);
        let db;

        openRequest.onerror = () => {
            console.error("Error");
        };

        openRequest.onsuccess = () => {
            db = openRequest.result;
            this.operations(db);
        };
    }

    operations(db) {
        if (window.location.href.includes("question.html")) {
            this.showAllQuestions(db);
            this.addQusetion(db);
            // this.deleteQusetion(db);
            // this.editQusetion(db);
        }
    }



    showAllQuestions(db) {
        let request = db.transaction("questions")
            .objectStore("questions")
            .getAll();
        request.onsuccess = () => {
            this.getTable(request.result, db);
        }

    }

    getTable(questions, db) {
        this.tbody.innerHTML = "";
        const tempHtml = questions.map((question, index) => {
            return `
            <tr>
                <td scope="row">${++index}</td>
                <td class="question_td">
                <div class="question-wrap accardion-item">
                    <div class="accardion-item__trigger">
                    ${question.question}
                    </div>
                    <div class="accardion-item__content">
                        ${this.renderVariantes(question.variantes, question.answer)}
                    </div>
                </div>
                </td>
                <td data-subject="${question.subject_id}"></td>
                <td>
                <td class="edit_td"><button type="button"
                    class="btn btn-outline-info btn-sm edit">Изменить</button></td>
                <td class="delete_td"><button type="button"
                    class="btn btn-outline-danger btn-sm delete">Удалить</button></td>
                </td>
            </tr>`
        })
        this.tbody.innerHTML = tempHtml.join("");
        this.showAccardion();
        this.getSubjectNames(db);
    }

    renderVariantes(variantes, answer) {
        let str = "";
        for (let key in variantes) {
            if (answer == key) str += `<li><span class="isTure"> ${key}: ${variantes[key]}</span></li>\n`;
            else str += `<li>${key}: ${variantes[key]}</li>\n`;
        }
        return `<ul class="variantes">${str}</ul>`
    }

    getSubjectNames(db) {
       
        const tdEls = document.querySelectorAll("td[data-subject]");
    
        let request = db.transaction("subjects")
            .objectStore("subjects")
            .getAll();

        return request.onsuccess = () => {
            tdEls.forEach(td => {
                let index = td.dataset.subject;
             
                let subject = request.result.find(question => question.id == index);
                
                if(subject) td.textContent = subject.name;
                else td.textContent = "Предмет не определен";
            });
        }
        
    }
    addQusetion(db) {
        const formWrap = document.querySelector(".questions-form");

        const questionText = formWrap.querySelector("#question_text");
        const subjectSelect = formWrap.querySelector("#subject_select");
        const variantAText = formWrap.querySelector("#variantA");
        const variantBText = formWrap.querySelector("#variantB");
        const variantCText = formWrap.querySelector("#variantC");
        const variantDText = formWrap.querySelector("#variantD");
        const variants = formWrap.querySelectorAll(".variantInput");
        const addBtn = formWrap.querySelector("#question_add");

        this.getSubjectsOptions(db, subjectSelect);

        addBtn.addEventListener("click", (e) => {

            const text = questionText.value.trim();
            const select = subjectSelect.value;
            const variantA = variantAText.value.trim();
            const variantB = variantBText.value.trim();
            const variantC = variantCText.value.trim();
            const variantD = variantDText.value.trim();

            let trueId;
            for (let el of variants) {
                if (el.checked) trueId = el.dataset.id;
            }

            if (text == "" || select == "" || variantA == "" || variantB == "" || variantC == "" || variantD == "" || !trueId || select == 0) {
                this.showMessage(formWrap, "message", "Заполните все поля");
                return;
            }

            const newQuestion = {
                answer: trueId,
                question: text,
                subject_id: select,
                variantes: { a: variantA, b: variantB, c: variantC, d: variantD },
            };

            let request = db.transaction("questions", "readwrite")
                .objectStore("questions")
                .add(newQuestion);

            request.onsuccess = () => {
                for (let el of variants) {
                    el.checked = false;
                }
                this.clearInputs(questionText, subjectSelect, variantAText, variantBText, variantCText, variantDText);
                this.showAllQuestions(db);
                this.showNotification(formWrap, "notification", "Вопрос добавлен");
            }

        });

    }
    getSubjectsOptions(db, el) {
        let request = db.transaction("subjects")
            .objectStore("subjects")
            .getAll();

        request.onsuccess = () => {
            let tempHtml = ["<option selected value='0'>Выберите предмет</option>"];
            request.result.forEach(subject => {
                tempHtml.push(`<option value="${subject.id}">${subject.name}</option>`);
            });
            el.innerHTML = tempHtml.join("");
        }

    }

    clearInputs(...args) {
        args.forEach(el => {
            if (el.type == "radio" || el.type == "checkbox") {
                el.checked = false;
            } else if (el.name = "select") el.value = "0";
            el.value = "";
        });
    }
    showAccardion() {
        const items = document.querySelectorAll(".accardion-item__trigger");
        items.forEach(item => {
            item.addEventListener("click", (e) => {
                e.target.parentElement.classList.toggle("accardion-item__active");
            });
        })
    }

    showMessage(element, className, text) {
        const message = document.createElement("p");
        message.classList.add(className);
        message.textContent = text;
        element.insertAdjacentElement("beforeBegin", message);
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
    showNotification(element, className, text) {
        const message = document.createElement("p");
        message.classList.add(className);
        message.textContent = text;
        element.insertAdjacentElement("afterend", message);
        setTimeout(() => {
            message.style.right = "1px";
        }, 250);
        setTimeout(() => {
            message.style.right = "-175px";

            setTimeout(() => {
                message.remove();
            }, 500);

        }, 2000);
    }
}


const question = new Question();

question.initDom();
question.openDb();
