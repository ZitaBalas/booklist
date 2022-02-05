/*global data*/
const root = document.getElementById('root');
const fields = ['name', 'author', 'image', 'plot'];
let dynamicSection, books;

const getData = () => {
    for (let i = 0; i < localStorage.length; i++) {
        const book = JSON.parse(localStorage.getItem(i));
        books.push(book);
    }
};

const init = () => {
    books = [];
    getData();
    const listSection = document.createElement('section');
    listSection.id = 'container';
    dynamicSection = document.createElement('section');
    dynamicSection.id = 'dynamic';
    const list = document.createElement('ul');
    const addBtn = document.createElement('button');
    addBtn.id = 'add-btn';
    addBtn.innerText = 'Add';
    addBtn.onclick = e => setState(e, 'add');
    const delAllBtn = document.createElement('button');
    delAllBtn.id = 'del-all-btn';
    delAllBtn.innerText = 'Delete All';
    delAllBtn.onclick = e => setState(e, 'deleteall');

    list.id = 'list';
    root.append(listSection, dynamicSection);
    listSection.append(list, addBtn, delAllBtn);

    if (books.length > 0) {
        for (let i = 0; i < books.length; i++) {
            const item = document.createElement('li');
            item.id = i;
            const link = document.createElement('span');
            link.innerText = books[i].name;
            link.onclick = e => setState(e, 'preview');
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.innerText = 'Edit';
            editBtn.onclick = e => setState(e, 'edit');
            const delBtn = document.createElement('button');
            delBtn.classList.add('del-btn');
            delBtn.innerText = 'Delete';
            delBtn.onclick = e => setState(e, 'delete');
            list.append(item);
            item.append(link, editBtn, delBtn);
        }
    }
};

const setInitState = () => {
    history.replaceState(null, '', 'index.html');
    dynamicSection.innerHTML = '';
    dynamicSection.style.display = 'none';
};

const setState = (e, sectionID) => {
    if (sectionID === 'add' || sectionID === 'deleteall') {
        history.pushState(null, '', 'index.html');
        history.replaceState({
            name: sectionID
        }, '', `#${sectionID}`);
    } else {
        const id = e.target.parentElement.id;
        history.pushState({
            name: sectionID,
            id: id
        }, '', `?id=${id}#${sectionID}`);
    }
};

const getState = () => {

    if (window.location.hash === '#preview') {
        const str = window.location.search;
        const id = str[str.length - 1];
        if (books[id]) {
            previewItem(id);
        } else {
            setInitState();
        }
    } else if (window.location.hash === '#edit') {
        const str = window.location.search;
        const id = str[str.length - 1];
        if (books[id]) {
            editItem(id);
        } else {
            setInitState();
        }
    } else if (window.location.hash === '#delete') {
        const str = window.location.search;
        const id = str[str.length - 1];
        if (books[id]) {
            deleteItem(id);
        } else {
            setInitState();
        }
    } else if (window.location.hash === '#add' && window.location.search === '') {
        addItem(books.length);
    } else if (window.location.hash === '#deleteall' && window.location.search === '') {
        deleteAllItem();
    } else {
        setInitState();
    }
};

window.onload = () => {
    init();
    getState();
};

let oldLocation = location.href;
setInterval(function () {
    if (location.href !== oldLocation) {
        getState();
        oldLocation = location.href
    }
}, 1);

const resetDynamic = () => {
    window.history.pushState(null, '', 'index.html');
    dynamicSection.style.display = 'none';
};

const previewItem = id => {
    dynamicSection.innerHTML = '';
    const book = books[id];
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content-wrapper');
    const name = document.createElement('h1');
    name.innerText = book.name;
    const author = document.createElement('h2');
    author.innerText = 'by ' + book.author;
    const plot = document.createElement('p');
    plot.innerText = book.plot;
    const image = document.createElement('img');
    image.src = book.image;
    const closeBtn = document.createElement('span');
    closeBtn.id = 'close-btn';
    closeBtn.innerText = 'x';
    closeBtn.addEventListener('click', resetDynamic);
    dynamicSection.append(image, contentWrapper, closeBtn);
    contentWrapper.append(name, author, plot);
    dynamicSection.style.display = 'block';
};

const cancelChanges = e => {
    const cancelBtn = e.target;
    const saveBtn = document.getElementById('save-btn');
    const modal = document.createElement('div');
    modal.id = 'modal-menu';
    const question = document.createElement('p');
    question.innerText = 'Discard changes?';
    const noBtn = document.createElement('button');
    noBtn.innerText = 'No';
    noBtn.onclick = () => {
        modal.remove();
        cancelBtn.disabled = false;
        saveBtn.disabled = false;
    };
    const yesBtn = document.createElement('button');
    yesBtn.classList.add('yes-btn');
    yesBtn.innerText = 'Yes';
    yesBtn.onclick = () => {
        modal.remove();
        window.history.back();
    };
    dynamicSection.append(modal);
    modal.append(question, noBtn, yesBtn);
    cancelBtn.disabled = true;
    saveBtn.disabled = true;
};

const showNotification = (str, color) => {
    const modal = document.createElement('div');
    modal.id = 'modal-menu';
    const question = document.createElement('p');
    question.innerText = str;
    question.style.color = color;
    const showAfter = 200;
    const hideAfter = 3000;

    setTimeout(() => {
        dynamicSection.append(modal);
        modal.append(question);
    }, showAfter);

    setTimeout(() => {
        modal.remove();
    }, hideAfter);
};

const saveChanges = (e, bookId) => {
    e.preventDefault();
    const inputs = dynamicSection.querySelectorAll('input');
    const plotField = dynamicSection.querySelector('textarea');
    const edited = {};

    for (let i = 0; i < inputs.length; i++) {
        edited[fields[i]] = inputs[i].value;
        edited.plot = plotField.value;
    }
    const values = Object.values(edited);

    if (!values.includes('') && !values.includes('undefined')) {
        const editedBook = JSON.stringify(edited);
        localStorage.setItem(`${bookId}`, editedBook);
        root.innerHTML = '';
        init();

        history.pushState({
            name: 'preview',
            id: bookId
        }, '', `?id=${bookId}#preview`);
        showNotification('Book successfully updated', 'lightseagreen');
    } else {
        showNotification('All field required', 'red');
    }
};

const createForm = id => {
    dynamicSection.innerHTML = '';
    const form = document.createElement('form');
    const cancel = document.createElement('button');
    cancel.classList.add('cancel-btn');
    cancel.innerText = 'Cancel';
    cancel.onclick = e => cancelChanges(e);
    const save = document.createElement('button');
    save.id = 'save-btn';
    save.innerText = 'Save';
    save.onclick = e => saveChanges(e, id);
    dynamicSection.append(form);

    for (let i = 0; i < fields.length; i++) {
        let input;
        if (i === fields.length - 1) {
            input = document.createElement('textarea');
            input.rows = '15';
        } else {
            input = document.createElement('input');
            input.type = 'text';
        }
        input.id = fields[i];
        input.required = true;
        const label = document.createElement('label');
        label.setAttribute('for', fields[i]);
        label.innerText = fields[i].charAt(0).toUpperCase() + fields[i].slice(1, fields[i].length);
        form.append(label, input, cancel, save);
    }
    dynamicSection.style.display = 'block';
};

const editItem = id => {
    createForm(id);
    const book = books[id];
    const inputFields = dynamicSection.querySelectorAll('input');

    for (let i = 0; i < inputFields.length; i++) {
        inputFields[i].value = book[fields[i]];
    }

    const plotField = dynamicSection.querySelector('textarea');
    const words = book[fields[fields.length - 1]].split(' ');
    let trimmed = [];
    words.filter(word => {
        if (word !== '') {
            trimmed.push(word);
        }
        return trimmed;
    });
    plotField.value = trimmed.join(' ');
};

const addItem = id => {
    createForm(id);
};

const deleteItem = id => {
    const toRemove = books[id].name;
    const modal = document.createElement('div');
    modal.id = 'modal-menu';
    const question = document.createElement('p');
    question.innerText = 'Do you want to delete the book?';
    const noBtn = document.createElement('button');
    noBtn.innerText = 'No';
    noBtn.onclick = () => {
        modal.remove();
        window.history.back();
    };
    const yesBtn = document.createElement('button');
    yesBtn.classList.add('yes-btn');
    yesBtn.innerText = 'Yes';
    yesBtn.onclick = () => {
        modal.remove();
        const nextId = Number(id) + 1;

        if (localStorage.getItem(`${nextId}`)) {
            for (let i = nextId; i < localStorage.length; i++) {
                const nextBook = localStorage.getItem(`${i}`);
                localStorage.setItem(`${i - 1}`, nextBook);
            }
            localStorage.removeItem(localStorage.length - 1);
        } else {
            localStorage.removeItem(id);
        }
        root.innerHTML = '';
        init();
        setInitState();
        showNotification(`${toRemove} has been deleted`, 'orange');
    };
    root.append(modal);
    modal.append(question, noBtn, yesBtn);
};

const deleteAllItem = () => {
    const modal = document.createElement('div');
    modal.id = 'modal-menu';
    const question = document.createElement('p');
    question.innerText = 'Are you sure? All data will be deleted!';
    const noBtn = document.createElement('button');
    noBtn.innerText = 'No';
    noBtn.onclick = () => {
        modal.remove();
        window.history.back();
    };
    const yesBtn = document.createElement('button');
    yesBtn.classList.add('yes-btn');
    yesBtn.innerText = 'Yes';
    yesBtn.onclick = () => {
        modal.remove();
        localStorage.clear();
        root.innerHTML = '';
        init();
        setInitState();
        showNotification('All data deleted', 'orange');
    };
    root.append(modal);
    modal.append(question, noBtn, yesBtn);
};
