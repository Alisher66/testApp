

export class Question {

    constructor() {
        this.initDom();
        this.openDb();
    }

    initDom() {
        this.table = document.querySelector(".subject-table");
        this.tbody = this.table.querySelector("tbody");
    }


    openDb() {
        let openRequest = indexedDB.open("Quiz", 1);
        let db;

        openRequest.onerror = () => {
            console.error("Error");
        };

        openRequest.onsuccess = () => {
            db = openRequest.result;
            this.showTable(db);
        };
    }

    showTable(db) {
        let request = db.transaction("questions")
            .objectStore("questions")
            .getAll();

        request.onsuccess = () => {
            this.getTable(request.result)
        }
    }

    getTable(questions) {

        let subjectTd = this.tbody.querySelectorAll("[data-subject]");
        let questionTd = this.tbody.querySelectorAll("[data-question]");

        questionTd.forEach((td, index) => {
            let id = subjectTd[index].dataset.subject;
            let count = questions.filter(question => question.subject_id == id).length;
            td.innerHTML = count;
        })
    }


}