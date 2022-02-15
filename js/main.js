// import {Subject} from "./subject.js"
// import {Question} from "./question.js"
// import { LocalData } from "./data.js";


const subjects = [
    { "name": "Математика", },
    { "name": "Физика", }
];
const questions = [
    {  "subject_id": 1, "question": "1+1 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "a" },
    {  "subject_id": 1, "question": "1+2 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "b" },
    {  "subject_id": 1, "question": "1+3 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "c" },
    {  "subject_id": 1, "question": "1+4 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "d" },
    {  "subject_id": 1, "question": "1+5 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "a" },
    {  "subject_id": 1, "question": "1+1 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "b" },
    {  "subject_id": 1, "question": "1+2 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "c" },
    {  "subject_id": 1, "question": "1+3 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "d" },
    {  "subject_id": 1, "question": "1+4 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "a" },
    {  "subject_id": 1, "question": "1+5 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "b" },
    {  "subject_id": 1, "question": "1+6 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "c" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "d" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "d" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "c" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "a" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "b" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "b" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "a" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "c" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "d" },
];




initDB([
    {key: "subjects", data:  subjects},
    {key: "questions", data:  questions},
]);



function initDB(arr) {
    let openRequest = indexedDB.open("Quiz", 1);
    let db;
    openRequest.onupgradeneeded = () => {
        db = openRequest.result;
        arr.forEach(item => {
            creatTables(db, item.key, item.data);
        });
    }

    openRequest.onerror = () => {
        console.error("Error");
    };

    openRequest.onsuccess = () => {
        db = openRequest.result;
    };
}
function creatTables(db, key, arr) {
    let objectStore = db.createObjectStore(key, {
        keyPath: 'id',
        autoIncrement: true,
    });

    for (let i in arr) {
        objectStore.add(arr[i]);
    }
}

// const openSubject = new Subject();
// openSubject.initDom();
// openSubject.openDb();


// const openQuestion = new Question();
// openQuestion.initDom();
// openQuestion.openDb();



  