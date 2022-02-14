

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
            this.deleteQusetion(db);
            this.editQusetion(db);
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
            <tr data-question=${question.id}>
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

                if (subject) td.textContent = subject.name;
                else td.textContent = "Предмет не определен";
            });
        }

    }
    addQusetion(db) {
        this.formWrap = document.querySelector(".questions-form");

        const questionText = this.formWrap.querySelector("#question_text");
        const subjectSelect = this.formWrap.querySelector("#subject_select");
        const variantAText = this.formWrap.querySelector("#variantA");
        const variantBText = this.formWrap.querySelector("#variantB");
        const variantCText = this.formWrap.querySelector("#variantC");
        const variantDText = this.formWrap.querySelector("#variantD");
        const variants = this.formWrap.querySelectorAll(".variantInput");
        const addBtn = this.formWrap.querySelector("#question_add");

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
                this.showMessage(this.formWrap, "message", "Заполните все поля");
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
                this.showNotification(this.formWrap, "notification", "Вопрос добавлен");
            }

        });

    }
    getSubjectsOptions(db, el, id = 0) {
        let request = db.transaction("subjects")
            .objectStore("subjects")
            .getAll();

        request.onsuccess = () => {
            let tempHtml = [`<option ${id == 0 ? "selected" : ""} value='0'>Выберите предмет</option>`];
            request.result.forEach(subject => {
                tempHtml.push(`<option ${id == +subject.id ? "selected" : ""} value="${subject.id}">${subject.name}</option>`);
            });
            el.innerHTML = tempHtml.join("");
        }

    }

    deleteQusetion(db) {
        this.tbody.addEventListener("click", (e) => {
            if (!e.target.classList.contains("delete")) return
            let id = e.target.parentElement.parentElement.dataset.question;

            let request = db.transaction("questions")
                .objectStore("questions")
                .get(+id);

            request.onsuccess = () => {
                this.openDeleteModal(db, request.result);
            }
        })
    }

    openDeleteModal(db, question) {
        const modalHtml = `
        <div class="modal modal_delete_question show" data-modal = "${question.id}">
            <svg class="modal__cross" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve">
            <polygon fill="black" points="96,14 82,0 48,34 14,0 0,14 34,48 0,82 14,96 48,62 82,96 96,82 62,48 "/>
            </svg>
            <div class="modal_delete_message">
                <p>Вы действительно хотите удалить вопрос <br>"${question.question}" ?</p>
            </div>
            <div class="modal_delete_btns">
                <button type="button" class="btn btn-warning btn-sm modal_delete_exit">Отмена</button>
                <button type="button" class="btn btn-danger btn-sm modal_delete_btn">Удалить</button>
            </div>
        </div>`;

        document.querySelector("main").insertAdjacentHTML("beforeend", modalHtml);
        this.overlay.classList.add("show");

        // this.closeDeleteModal();
        this.closeModal("modal_delete_question", "modal_delete_exit");
        this.remove(db, question.id);
    }
    closeDeleteModal() {
        const modal = document.querySelector(".modal_delete_question")
        this.overlay.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            modal.remove();
        })

        const modalCross = document.querySelector(".modal__cross");
        if (modalCross) {
            modalCross.addEventListener("click", (e) => {
                this.overlay.classList.remove("show");
                modal.remove();
            })
        }
        const exitBtn = document.querySelector(".modal_delete_exit");
        exitBtn.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            modal.remove();
        })
    }
    remove(db, id) {
        const modal = document.querySelector(".modal_delete_question")
        const deleteBtn = document.querySelector(".modal_delete_btn");
        deleteBtn.addEventListener("click", (e) => {
            let request = db.transaction("questions", "readwrite")
                .objectStore("questions")
                .delete(id);

            request.onsuccess = () => {
                this.overlay.classList.remove("show");
                modal.remove();
                this.showAllQuestions(db);
                this.showNotification(this.formWrap, "notification", "Вопрос удален");
            }
        });
    }

    editQusetion(db) {
        this.tbody.addEventListener("click", (e) => {
            if (!e.target.classList.contains("edit")) return
            let id = e.target.parentElement.parentElement.dataset.question;

            let request = db.transaction("questions")
                .objectStore("questions")
                .get(+id);

            request.onsuccess = () => {
                this.openEditModal(db, request.result);
            }
        })

    }
    openEditModal(db, question) {
        const modalHtml = `
        <div class="modal modal_edit_question show" data-modal = "${question.id}">
            <svg class="modal__cross" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve">
            <polygon fill="black" points="96,14 82,0 48,34 14,0 0,14 34,48 0,82 14,96 48,62 82,96 96,82 62,48 "/>
            </svg>
            <div class="">
                <h3>Изменить предет</h3>
            </div>
            <div class="form-floating">
                <textarea type="text" class="form-control" style="height: 100px" id="modal_question_name" placeholder="Вопрос" >${question.question}</textarea>
                <label for="modal_question_name">Вопрос</label>
            </div>
            <div class = "row"> 
                <div class="col-md-6">
                    <div class="form-check mt-20">
                    <input class="form-check-input variantInput" data-id="a" type="radio" name="variants" id="" >
                    <input type="text" class="form-control" placeholder="Вариант A:" id="variantA" value="${question.variantes.a}">
                    </div>
                    <div class="form-check mt-20">
                        <input class="form-check-input variantInput" data-id="b" type="radio" name="variants" id="" >
                        <input type="text" class="form-control" placeholder="Вариант B:" id="variantB" value="${question.variantes.b}">
                    </div>
                    <div class="form-check mt-20">
                        <input class="form-check-input variantInput" data-id="c" type="radio" name="variants" id="">
                        <input type="text" class="form-control" placeholder="Вариант C:" id="variantC" value="${question.variantes.c}">
                    </div>
                    <div class="form-check mt-20">
                        <input class="form-check-input variantInput" data-id="d" type="radio" name="variants" id="">
                        <input type="text" class="form-control" placeholder="Вариант D:" id="variantD" value="${question.variantes.d}">
                    </div>
                </div>
                <div class="col-md-6 mt-20">
                    <select class="form-select" name="select"  id="subject_select_modal" aria-label="Floating label select example" aria-placeholder="Выберите предмет"> 
                    </select>
                </div>
            </div>
            <div class="modal_edit_btns">
                <button type="button" class="btn btn-warning btn-sm modal_edit_exit">Отмена</button>
                <button type="button" class="btn btn-success btn-sm modal_edit_save">Сохранить</button>
            </div>
        </div>`;

        document.querySelector("main").insertAdjacentHTML("beforeend", modalHtml);
        this.overlay.classList.add("show");

        document.querySelectorAll(".modal .variantInput").forEach(el => {
            if (el.dataset.id == question.answer) el.checked = true;
        })
        let select = document.querySelector(".modal #subject_select_modal");
        this.getSubjectsOptions(db, select, question.subject_id);

        this.closeModal("modal_edit_question", "modal_edit_exit");
        this.saveChanges(db, question);
    }

    closeModal(modalClassName, exitBtnClassName) {
        const modal = document.querySelector("." + modalClassName)
        this.overlay.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            modal.remove();
        })

        const modalCross = document.querySelector(".modal__cross");
        if (modalCross) {
            modalCross.addEventListener("click", (e) => {
                this.overlay.classList.remove("show");
                modal.remove();
            })
        }
        const exitBtn = document.querySelector("." + exitBtnClassName);
        exitBtn.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            modal.remove();
        })
    }

    saveChanges(db, question) {
        const formWrap = document.querySelector(".modal_edit_question");

        let textEl = formWrap.querySelector("#modal_question_name")
        let selectEl = formWrap.querySelector("#subject_select_modal");
        let variantAEl = formWrap.querySelector("#variantA")
        let variantBEl = formWrap.querySelector("#variantB")
        let variantCEl = formWrap.querySelector("#variantC")
        let variantDEl = formWrap.querySelector("#variantD")

        const checkboxes = formWrap.querySelectorAll(".variantInput");
        const saveBtn = formWrap.querySelector(".modal_edit_save");
        const exitBtn = formWrap.querySelector(".modal_edit_exit")

        exitBtn.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            formWrap.remove();
        })

        saveBtn.addEventListener("click", (e) => {
            let trueId;
            let select = selectEl.value;
            let text = textEl.value.trim();
            let variantA = variantAEl.value.trim()
            let variantB = variantBEl.value.trim()
            let variantC = variantCEl.value.trim()
            let variantD = variantDEl.value.trim()

            for (let el of checkboxes) {
                if (el.checked) trueId = el.dataset.id;
            }

            if (text == "" || variantA == "" || variantB == "" || variantC == "" || variantD == "" || !trueId || select == 0 || select == "") {
                this.showMessage(formWrap, "message", "Заполните все поля");
                return;
            }

            const newQuestion = {
                id: question.id,
                answer: trueId,
                question: text,
                subject_id: select,
                variantes: { a: variantA, b: variantB, c: variantC, d: variantD },
            };
            let request = db.transaction("questions", "readwrite")
                .objectStore("questions")
                .put(newQuestion);

            request.onsuccess = () => {
                formWrap.remove();
                this.overlay.classList.remove("show");

                this.showAllQuestions(db);
                this.showNotification(this.formWrap, "notification", "Вопрос изменен");
            }
            request.onerror = () =>{
                console.log("error");
            }
        })
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
        element.insertAdjacentElement("afterBegin", message);
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
