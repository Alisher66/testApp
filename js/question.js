

export class Question {

    constructor() {

    }

    initDom() {
        this.wrap = document.querySelector(".questions");
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
            // this.addQusetion(db);
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
                <td data-subject=${question.subject_id}">математика</td>
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
    }

    renderVariantes(variantes, answer) {
        let str = "";
        for (let key in variantes) {
            if (answer == key) str += `<li><span class="isTure"> ${key}: ${variantes[key]}</span></li>\n`;
            else str += `<li>${key}: ${variantes[key]}</li>\n`;
        }
        return `<ul class="variantes">${str}</ul>`
    }

    // getSubjectName(id, db) {
    //     let request = db.transaction("subjects")
    //                     .objectStore("subjects")
    //                     .get(id);
    //     request.onsuccess = () =>{
    //         this.tbody.querySelector(".subject_name").innerHTML = 
    //     }
    // }
    showAccardion() {

        const items = document.querySelectorAll(".accardion-item__trigger");
        console.log(items)
        items.forEach(item => {
            item.addEventListener("click", (e) => {
                console.log(1);
                e.target.parentElement.classList.toggle("accardion-item__active");
            });
        })
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


const question = new Question();

question.initDom();
question.openDb();
