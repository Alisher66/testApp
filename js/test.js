class Test {

    constructor() {
        this.initDom();

    }

    initDom() {
        this.wrap = document.querySelector(".question-wrap");
        this.listWrap = document.querySelector(".question_list");
    }

    openDb() {
        let openRequest = indexedDB.open("Quiz", 1);
        let db;

        openRequest.onupgradeneeded = () => {
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
        this.testing(db);
    }

    testing(db) {
        const subjectId = 1;

        let request = db.transaction("subjects")
            .objectStore("subjects")
            .get(subjectId);

        request.onsuccess = () => {
            this.getQuestions(request.result, db);

        }
    }

    getQuestions(subject, db) {
        let request = db.transaction("questions")
            .objectStore("questions")
            .getAll();

        request.onsuccess = () => {
            let questionsAll = request.result;

            let questions = questionsAll.filter(question => question.subject_id == subject.id);

            this.showQuestions(questions);
            this.showNavigation(subject.name, questions);
            this.finishTest(questions);
        }
    }

    showQuestions(questions) {
        const itemInner = questions.map((question, index) => {
            return `
                <div class="item hide" data-id=${question.id}>
                    <h4>Вопрос ${index + 1} </h4>
                    <p class="question_text">
                        ${question.question}
                    </p>
                    <div class="form-check ">
                    <input class="form-check-input variantInput" data-id="a" type="radio" name="variant${index + 1}"
                        id="variantA${index + 1}">
                    <label class="form-control" placeholder="" for="variantA${index + 1}">${question.variantes.a}</label>
                    </div>
                    <div class="form-check mt-20">
                    <input class="form-check-input variantInput" data-id="b" type="radio" name="variant${index + 1}"
                        id="variantB${index + 1}">
                    <label class="form-control" placeholder="" for="variantB${index + 1}">${question.variantes.b}</label>
                    </div>
                    <div class="form-check mt-20">
                    <input class="form-check-input variantInput" data-id="c" type="radio" name="variant${index + 1}"
                        id="variantC${index + 1}">
                    <label class="form-control" placeholder="" for="variantC${index + 1}">${question.variantes.c}</label>
                    </div>
                    <div class="form-check mt-20">
                    <input class="form-check-input variantInput" data-id="d" type="radio" name="variant${index + 1}"
                        id="variantD${index + 1}">
                    <label class="form-control" placeholder="" for="variantD${index + 1}">${question.variantes.d}</label>
                    </div>
                </div>`
        })

        this.wrap.insertAdjacentHTML("afterbegin", itemInner.join(""));

    }

    showNavigation(name, questions) {
        const subjectItem = document.createElement("div");
        subjectItem.classList.add("question_list-item");

        subjectItem.innerHTML = `
        <p class="subject_name">${name}</p>
        <div class="list-wrap">
            ${this.getLinks(questions)}
        </div>`;
        this.listWrap.append(subjectItem);

        const finishEl = document.createElement("div");
        finishEl.classList.add("mt-20")
        finishEl.innerHTML = '<button type="button" class="btn btn-success " id="finish_test">Завершить тест</button>';
        this.listWrap.append(finishEl);

        this.getActive(subjectItem.querySelector(".list-wrap").children[0]);
        subjectItem.addEventListener("click", (e) => {
            if (!e.target.matches("a")) return;
            e.preventDefault();
            this.getActive(e.target);
        })
    }

    getLinks(questions) {
        let tempHtml = questions.map((question, index) => {
            return `
                <a href="" data-id=${question.id} >${index + 1}</a>`;
        });
        return tempHtml.join("");
    }


    getActive(link) {
        const questionsEl = this.wrap.querySelectorAll(".item");

        questionsEl.forEach(question => {
            if (question.dataset.id == link.dataset.id) {
                question.classList.add("show");
                question.classList.remove("hide");
            }
            else {
                question.classList.remove("show");
                question.classList.add("hide");
            }
        });

        const links = this.listWrap.querySelectorAll("a");
        links.forEach(link => link.classList.remove("active"));
        link.classList.add("active");

        const variantInputs = this.wrap.querySelectorAll(".variantInput");
        this.trackEvents(variantInputs, links);
    }

    trackEvents(variantInputs, links) {
        variantInputs.forEach(input => {
            if (input.checked) {
                let id = input.closest(".item").dataset.id;
                links.forEach(link => link.dataset.id == id ? link.classList.add("checked") : "");
            }
        });
    }

    finishTest(questions) {
        const finishBtn = document.querySelector("#finish_test");

        
        finishBtn.addEventListener("click", (e) => {
            const current = [];
            const variantInputs = document.querySelectorAll(".variantInput");
            variantInputs.forEach(input => {
                if (input.checked) {
                    let obj = {
                        question_id: input.closest(".item").dataset.id,
                        answer: input.dataset.id,
                    }
                    current.push(obj);
                }
            })
            this.showResult(questions, current);
        })
        
    }

    showResult(questions, answers){
        let correct = 0;
        answers.forEach(answer => {
            questions.find(question => {
                if(question.id == answer.question_id) {
                    (question.answer == answer.answer) ? correct++ : correct;
                }
            })
            
        });

        const resultWrap = document.createElement("div");
        resultWrap.classList.add("result_test");
        resultWrap.innerHTML = `<p>${correct} правельных ответа из ${questions.length}</p>`

        this.listWrap.append(resultWrap);
        
    }
}

const test1 = new Test();
test1.openDb();