

export class Subject {

    constructor() {

    }

    initDom() {
        this.wrap = document.querySelector(".subjects");
        this.table = document.querySelector(".subject-table");
        this.tbody = this.table.querySelector("tbody");
        this.overlay = document.querySelector(".overlay");
    }

    openDb() {
        let openRequest = indexedDB.open("Quiz", 1);
        let db;

        openRequest.onupgradeneeded = () =>{
            db = openRequest.result;
        }
        openRequest.onerror = () => {
            console.error("Error");
        };

        openRequest.onsuccess = () => {
            db = openRequest.result;
            this.operations(db);
        };
    }

    operations(db) {
        this.showTable(db);

        if (window.location.href.includes("subject.html")) {
            this.addSubject(db);
            this.deleteSubject(db);
            this.editSubject(db);
        }

    }

    showTable(db) {
        let request = db.transaction("subjects")
            .objectStore("subjects")
            .getAll();

        request.onsuccess = () => {
            this.getTable(request.result);
            this.updateQuestions(db);
        }
    }

    getTable(subjects) {

        this.tbody.innerHTML = "";

        const tempHtml = subjects.map((subject, index) => {
            return `
                <tr>
                    <th scope="row">${++index}</th>
                    <td data-subject=${subject.id}>${subject.name}</td>
                    <td data-question>0</td>
                    <td class="edit_td"><button type="button" class="btn btn-outline-info btn-sm edit" data-id=${subject.id}>Изменить</button></td>
                    <td class="delete_td"><button type="button" class="btn btn-outline-danger btn-sm delete" data-id=${subject.id}>Удалить</button></td>
                </tr>`;
        });

        this.tbody.innerHTML = tempHtml.join("");

    }

    addSubject(db) {

        const nameEl = this.wrap.querySelector("#subjet_name")
        const addBtn = this.wrap.querySelector(".add_btn");

        addBtn.addEventListener("click", (e) => {
            if (nameEl.value.trim() == "") {
                return;
            }

            let request = db.transaction("subjects", "readwrite")
                .objectStore("subjects")
                .add({ name: nameEl.value.trim() });

            request.onsuccess = () => {
                this.showNotification("notification", "Предмет добавлен");
                nameEl.value = "";
                this.showTable(db);

            }
            request.onerror = () => {
                this.showNotification("notification", "Ошибка");
            }

        });
    }

    deleteSubject(db) {
        this.tbody.addEventListener('click', (e) => {
            if (!e.target.matches(".delete")) return;

            let request = db.transaction("subjects")
                .objectStore("subjects")
                .get(+e.target.dataset.id);

            request.onsuccess = () => {
                this.openDeleteModal(db, request.result);
            }
        })
    }

    openDeleteModal(db, subject) {

        const modalHtml = `
        <div class="modal modal_delete_subject show" data-modal = "${subject.id}">
            <svg class="modal__cross" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve">
            <polygon fill="black" points="96,14 82,0 48,34 14,0 0,14 34,48 0,82 14,96 48,62 82,96 96,82 62,48 "/>
            </svg>
            <div class="modal_delete_message">
                <p>Вы действительно хотите удалить предмет "${subject.name}" ?</p>
            </div>
            <div class="modal_delete_btns">
                <button type="button" class="btn btn-warning btn-sm modal_delete_exit">Отмена</button>
                <button type="button" class="btn btn-danger btn-sm modal_delete_btn">Удалить</button>
            </div>
        </div>`;

        document.querySelector("main").insertAdjacentHTML("beforeend", modalHtml);
        this.overlay.classList.add("show");

        this.closeDeleteModal();
        this.remove(db, subject.id);
    }

    closeDeleteModal() {
        const modal = document.querySelector(".modal_delete_subject")
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
        const modal = document.querySelector(".modal_delete_subject")
        const deleteBtn = document.querySelector(".modal_delete_btn");
        deleteBtn.addEventListener("click", (e) => {
            let request = db.transaction("subjects", "readwrite")
                .objectStore("subjects")
                .delete(id);

            request.onsuccess = () => {
                this.overlay.classList.remove("show");
                modal.remove();
                this.showTable(db);
                this.showNotification("notification", "Предмет удален");
            }
        });
    }

    editSubject(db) {
        this.tbody.addEventListener('click', (e) => {
            if (!e.target.matches(".edit")) return;

            let request = db.transaction("subjects")
                .objectStore("subjects")
                .get(+e.target.dataset.id);

            request.onsuccess = () => {
                this.openEditeModal(db, request.result);
            }
        })
    }

    openEditeModal(db, subject) {
        const modalHtml = `
        <div class="modal modal_edit_subject show" data-modal = "${subject.id}">
            <svg class="modal__cross" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve">
            <polygon fill="black" points="96,14 82,0 48,34 14,0 0,14 34,48 0,82 14,96 48,62 82,96 96,82 62,48 "/>
            </svg>
            <div class="">
                <h3>Изменить предет</h3>
            </div>
            <div class="form-floating">
                <input type="text" class="form-control" id="modal_subjet_name" placeholder="Название предмета" value=${subject.name}>
                <label for="modal_subjet_name">Название предмета</label>
            </div>
            <div class="modal_edit_btns">
                <button type="button" class="btn btn-warning btn-sm modal_edit_exit">Отмена</button>
                <button type="button" class="btn btn-success btn-sm modal_edit_save">Сохранить</button>
            </div>
        </div>`;

        document.querySelector("main").insertAdjacentHTML("beforeend", modalHtml);
        this.overlay.classList.add("show");

        this.closeEditModal();
        this.saveChanges(db, subject)

    }

    closeEditModal() {
        const modal = document.querySelector(".modal_edit_subject")
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
        const exitBtn = document.querySelector(".modal_edit_exit");
        exitBtn.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            modal.remove();
        })
    }
    saveChanges(db, subject) {
        const modal = document.querySelector(".modal_edit_subject")
        const saveBtn = document.querySelector(".modal_edit_save");
        const nameEl = modal.querySelector("#modal_subjet_name");

        saveBtn.addEventListener("click", (e) => {
            let name = nameEl.value.trim();

            if (name == subject.name) {
                this.showNotification("notification", "Изменение сохранено")
                this.overlay.classList.remove("show");
                modal.remove();
                return;
            }
            let item = {
                id: subject.id,
                name,
            }

            let request = db.transaction("subjects", "readwrite")
                .objectStore("subjects")
                .put(item);

            request.onsuccess = () => {
                this.overlay.classList.remove("show");
                modal.remove();
                this.showTable(db);
                this.showNotification("notification", "Изменение сохранено");
            }
        });
    }

    updateQuestions(db) {
        let request = db.transaction("questions")
            .objectStore("questions")
            .getAll();

        request.onsuccess = () => {
            
            let questions = request.result;

            let subjectTd = this.tbody.querySelectorAll("[data-subject]");
            let questionTd = this.tbody.querySelectorAll("[data-question]");
    
            questionTd.forEach((td, index) => {
                let id = subjectTd[index].dataset.subject;
                let count = questions.filter(question => question.subject_id == id).length;
                td.innerHTML = count;
            })
        }
    }
    
    showNotification(className, text) {
        const message = document.createElement("p");
        message.classList.add(className);
        message.textContent = text;
        this.wrap.insertAdjacentElement("afterend", message);
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

const subject1 = new Subject();
subject1.initDom();
subject1.openDb();