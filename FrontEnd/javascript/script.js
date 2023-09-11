const filters = document.querySelectorAll(".filter");
const gallery = document.querySelector(".gallery");

let works = [];
let categories = [];

//******************RECUPERATION TO FETCH***********************//

function recupWorks() {
    fetch("http://localhost:5678/api/works")
        .then((rep) => rep.json())
        .then((data) => {
            works = data;
            insertWorks(works);
            displayModal(works);
        });
}

function categoriesRecup() {
    fetch("http://localhost:5678/api/categories")
        .then((rep) => rep.json())
        .then((data) => {
            categories = data;
        });
}

//****************** ARRAY ==> INSERTION IMG HTML****************//

function insertWorks(workArray) {
    gallery.innerHTML = "";

    workArray.forEach((work) => {
        const figure = document.createElement("figure");
        gallery.appendChild(figure);
        figure.classList = work.category.name;
        figure.setAttribute("data-id", work.id);

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        figure.appendChild(img);

        const figcaption = document.createElement("figcaption");
        figcaption.innerHTML = work.title;
        figure.appendChild(figcaption);
    });
}

//******************** FILTERS*********************//

function categoriesFilter() {
    filters.forEach((filter) => {
        const valueFilter = filter.textContent;

        filter.addEventListener("click", () => {
            let filteredCategories = [];
            if (valueFilter === "Tous") {
                filteredCategories = works;
            } else {
                filteredCategories = works.filter((work) => work.category.name === valueFilter);
            }
            insertWorks(filteredCategories);
        });
    });
}

/****************************************LOGIN PAGE AND MODAL**************************************/

const editButton = document.querySelectorAll(".edit-button");
const modal = document.querySelector("dialog");
const modalImg = document.querySelector(".modal-img");
const modalContent = document.querySelector(".modal-content");
const filterName = document.querySelector(".filter_name");
const editBanner = document.querySelector(".edit-banner");
const login = document.querySelector(".login");


/************************************DISPLAY LOGIN PAGE******************************************/


/****************************DISPLAY LOGIN***************************/

let token = localStorage.getItem("Token");

if (token) {
    editBanner.style.display = "flex";
    editButton.forEach((button) => {
        button.style.visibility = "visible";
    });
    filterName.style.visibility = "hidden";
    login.innerHTML = "logout";

    login.addEventListener("click", () => {
        localStorage.removeItem("Token");
        window.location.href = "login.html";
    });
}

/***********************DISPLAY and FUNCTION MODAL************************/


/******************OPEN/CLOSE MODAL*************************/

function openCloseModal() {
    editButton[0].addEventListener("click", () => {
        modal.showModal();
    });
}
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.close();
    }
});




/***********************************Delete work*******************************/
function displayModal(workArray) {
    let modalContentHTML = "";
    workArray.forEach((work) => {
        modalContentHTML += `
        <div class="modal-img-position">
            <img src="${work.imageUrl}">
            <i class="fa-regular fa-trash-can modal-trash-icon" data-id="${work.id}"></i>
            <i class="fa-solid fa-arrows-up-down-left-right modal-arrow-icon"></i>
            <p>éditer</p>
        </div>
    `;
    });
    modalImg.innerHTML = modalContentHTML;

    const modalDeleteWorkIcon = document.querySelectorAll(".modal-trash-icon");
    let deleteRequest = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    modalDeleteWorkIcon.forEach((trashcan) => {
        trashcan.addEventListener("click", () => {
            const workId = trashcan.getAttribute("data-id");
            fetch(`http://localhost:5678/api/works/${workId}`, deleteRequest).then((rep) => {
                if (rep.ok) {
                    trashcan.parentElement.remove();
                    const deletefigure = document.querySelector(`figure[data-id="${workId}"]`);
                    deletefigure.remove();
                }
            });
        });
    });
}



/*******************Windows add project***************************/

function displayAddPicModal() {
    let initialModalContentHTML = "";
    const modalAddPicBtn = document.querySelector(".modal-add-btn");

    modalAddPicBtn.addEventListener("click", () => {
        initialModalContentHTML = modalContent.innerHTML;
        modalContent.innerHTML = "";
        modalContent.innerHTML = `
          <i class="fa-solid fa-arrow-left modal-add-work_return-icon"></i>
          <div class="modal-content_add-work">
              <h3>Ajout photo</h3>
              <form action="">
                  <div class="add-img-form">
                      <i class="fa-sharp fa-regular fa-image"></i>
                      <img src="" class="selected-img">
                      <label for="photo" class="form-add-img-button">+ Ajouter photo</label>
                      <input type="file" id="photo" name="photo">
                      <p>jpg, png : 4mo max</p>
                  </div>
                  <div>
                      <div class="modal-add-work_input">
                          <label for="titre">Titre</label>
                          <input type="text" id="titre" name="titre" autocomplete="off">
                      </div>
                      <div class="modal-add-work_input">
                          <label for="categories">Catégorie</label>
                          <select name="categorie" id="categorie">
                              <option value=""></option>
                              ${categorieChoice()}
                          </select>
                      </div>
                  </div>
              </form>
              <p class="invalid-form-message">Veuillez remplir tous les champs pour ajouter un projet</p>
              <p class="valid-form-message">Formulaire enregistré !</p>
              <p class="invalid-request-form-message">Une erreur s'est produite lors de la soumission du formulaire</p>
              <button class="modal-add-work_confirm-btn">Valider</button>
          </div>
      `;

        const photoInput = document.getElementById("photo");
        const selectedImage = document.querySelector(".selected-img");
        const returnToDefaultModalButton = document.querySelector(".modal-add-work_return-icon");

        /***************************RETURN BACK***************************/

        returnToDefaultModalButton.addEventListener("click", () => {
            modalContent.innerHTML = initialModalContentHTML;
            displayModal(works);
            displayAddPicModal();
        });

        /******************************SELECT AND ADD IMG**************************/

        photoInput.addEventListener("change", () => {
            const file = photoInput.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                selectedImage.src = e.target.result;
                const addImgForm = document.querySelector(".add-img-form");
                const formElements = addImgForm.querySelectorAll(".add-img-form > *");

                formElements.forEach((element) => {
                    element.style.display = "none";
                });
                selectedImage.style.display = "flex";
            };
            reader.readAsDataURL(file);
        });

    

        createNewWork();
    });
}

    /******************************CREATE WORK**************************/

function createNewWork() {
    const titleInput = document.getElementById("titre");
    const categorieInput = document.getElementById("categorie");
    const submitWorkButton = document.querySelector(".modal-add-work_confirm-btn");
    const invalidFormMessage = document.querySelector(".invalid-form-message");
    const validFormMessage = document.querySelector(".valid-form-message");
    const invalidRequestFormMessage = document.querySelector(".invalid-request-form-message");
    const photoInput = document.getElementById("photo");

    submitWorkButton.addEventListener("click", () => {
        if (photoInput.value === "" || titleInput.value === "" || categorieInput.value === "") {
            invalidFormMessage.style.display = "block";
            return;
        }

        let formData = new FormData();

        formData.append("image", photoInput.files[0]);
        formData.append("title", titleInput.value);
        formData.append("category", categorieInput.value);

        let addRequest = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        };

        fetch("http://localhost:5678/api/works", addRequest).then((rep) => {
            if (rep.ok) {
                invalidFormMessage.style.display = "none";
                validFormMessage.style.display = "block";
                submitWorkButton.classList.add("active");
            } else {
                invalidFormMessage.style.display = "none";
                invalidRequestFormMessage.style.display = "block";
            }
        });
    });
}


/*********************add categorie*************************/
function categorieChoice() {
    let optionHTML = "";
    categories.forEach((category) => {
        optionHTML += `<option value="${category.id}">${category.name}</option>`;
    });
    return optionHTML;
}

//*************************APPEL FUNCTION ****************/
recupWorks();
categoriesRecup();
categoriesFilter();
openCloseModal();
displayAddPicModal();
