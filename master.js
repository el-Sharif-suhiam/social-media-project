

const cardsCont = document.getElementById("cards-container");
const baseUrl = "https://tarmeezacademy.com/api/v1";
const token = localStorage.getItem("Sh-Token");
let currentPage = 1;
let lastPage = 1;
//let endPage = window.innerHeight + window.scrollY >= document.body.offsetHeight;


///// loader /////
function loader(condition) {
  const load = document.getElementsByClassName("loading")[0]
  if (condition) {
    load.style.visibility = "visible"
  }else {
    load.style.visibility = "hidden"
  }
}

window.addEventListener("scroll", function () {
  let endPage =
    window.innerHeight + window.scrollY >= document.body.scrollHeight;
    
    if (endPage && currentPage < lastPage) {
      currentPage += 1;
      postloader(true)
      getposts(currentPage, false);
    }
});

function postloader(condition) {
  const postload = document.getElementsByClassName("post-loading")[0];
  if(condition){
    postload.style.display = "flex"
  } else {
    postload.style.display = "none"
  }
}
function getposts(page = 1, reload = true , ) {
  // loader(true)
  if(reload) {
    loader(true)
  }
  axios.get(`${baseUrl}/posts?limit=3&page=${page}`)
  .then((respone) => {
    lastPage = respone.data.meta.last_page;
    let token = localStorage.getItem("Sh-Token");
    const user = JSON.parse(localStorage.getItem("Sh-user"))
    const responeData = respone.data.data;
    if (reload) {
      cardsCont.innerHTML = "";
    }
    for (post of responeData) {
      const author = post.author;
      const postID = post.id;
      let profileImage = author.profile_image;
      if (String(profileImage) === "[object Object]") {
        profileImage = "Images/blank-person.jpeg";
      }
      let postImage = `<img src="${post.image}" class="mx-3 rounded">`;
      if (String(post.image) === "[object Object]") {
        postImage = "";
      }
      let card ="";
      if(user !== null && author.id === user.id) {
        card = `<div class="card my-4 mx-5 col-8 shadow">
        <div class="card-header">
          <img src="${profileImage}" alt="person icon" class="rounded-circle user-icon me-3">
          <b class="user-id" onclick=profile(${author.id})>${author.username}</b>
          <button class="btn btn-secondary" style="float: right;" type="button" data-bs-toggle="collapse" data-bs-target="#PostCollapse_${postID}" aria-expanded="false" aria-controls="PostCollapse_${postID}">
            <i class="bi bi-gear"></i>
          </button>
          <div class="collapse edit" id="PostCollapse_${postID}">
            <div class="card edit-card ">
              <div class="d-flex justify-content-between mb-1 gap-2" onclick="EditPost(${postID})">
                Edit <i class="bi bi-pencil-square"></i>
              </div>
              <div class="d-flex justify-content-between mb-1 gap-2" onclick="deletePost(${postID})">
                Delete <i class="bi bi-trash"></i>
              </div>
            </div>
          </div>
        </div>
        ${postImage}
        <span class="created-at mx-3 mt-1">${post.created_at}</span>
        <div class="card-body">
          <p class="card-text">${post.body}</p>
          <hr>
          <div style="color: #555;">
            <i class="bi bi-chat-dots"></i>
              <p class="d-inline-flex gap-1">
                <a data-bs-toggle="collapse" href="#collapse-${postID}" role="button" aria-expanded="false" aria-controls="collapse-${postID}">
                <span> <span class="com-num ms-1" id="commentCount-${postID}">${post.comments_count}</span> Comments</span>
                </a>
              </p>
              <div class="collapse comment-collapse" name="${postID}" id="collapse-${postID}">
              </div>
          </div>
        </div>
        </div>`;
      }else{
        card = `<div class="card my-4 mx-5 col-8 shadow">
        <div class="card-header">
          <img src="${profileImage}" alt="person icon" class="rounded-circle user-icon me-3">
          <b class="user-id" onclick=profile(${author.id})>${author.username}</b>
        </div>
        ${postImage}
        <span class="created-at mx-3 mt-1">${post.created_at}</span>
        <div class="card-body">
          <p class="card-text">${post.body}</p>
          <hr>
          <div style="color: #555;">
            <i class="bi bi-chat-dots"></i>
              <p class="d-inline-flex gap-1">
                <a data-bs-toggle="collapse" href="#collapse-${postID}" role="button" aria-expanded="false" aria-controls="collapse-${postID}">
                <span> <span class="com-num ms-1" id="commentCount-${postID}">${post.comments_count}</span> Comments</span>
                </a>
              </p>
              <div class="collapse comment-collapse" name="${postID}" id="collapse-${postID}">
              </div>
          </div>
        </div>
        </div>`;
      }
      showComments(postID,token);
      ////////////////////////////////////
      ////////////////////////////////////
      cardsCont.innerHTML += card;
    }
  })
}
function showComments(ID, token){
  axios.get(`${baseUrl}/posts/${ID}`)
  .then((postRespone) => {
    let comment = document.getElementsByName(ID)[0];
    let commentsList = postRespone.data.data.comments;
    let commentCount = document.getElementById(`commentCount-${ID}`)
    commentCount.innerText = postRespone.data.data.comments_count;
    
    if (postRespone.data.data.comments_count != 0) {
      comment.innerHTML = "";
      for (comm of commentsList) {
        let comT = comm.author.created_at;
        let reExp = /\d{1,4}\W?\d{1,2}\W?\d{1,2}\w?\d{1,2}\W?\d{1,2}/;
        let userImg = comm.author.profile_image;
        let commentTime = String(comT.match(reExp)).replace("T", "  ")
        if (String(comm.author.profile_image) === "[object Object]") {
          userImg = "Images/blank-person.jpeg";
        }
        comment.innerHTML += `
            <div class="card card-body comment-card">
              <div class="comment-head d-flex">
                <img src="${userImg}" alt="img" class="comment-img">
                <b class="user-id" onclick=profile(${comm.author.id}) >${comm.author.username}</b>
              </div>
                <div class="comment-body">
                  <p>${comm.body}</p>
                  <span class="comment-time">${commentTime}</span>
                </div>
            </div>
            `;
      }
    }
    if (token) {
      const userData = JSON.parse(localStorage.getItem("Sh-user"));
      comment.innerHTML += `
          <div class="add-comment d-flex flex-column" >
          <div class="d-flex gap-1">
            <img src="${userData.profile_image}" alt="" class="comment-img">
            <textarea name="" id="add-comment" placeholder="Write your comment here"></textarea>
          </div>
          <button class="btn btn-primary d-flex gap-1 mt-2 align-self-end" id="btn-${ID}" onclick="postComment(${ID})">
            <i class="bi bi-send"></i>
            Send
          </button>
        </div>
          `;
    }  
    loader(false)

  });
}


function postComment(ID){
  let token = localStorage.getItem("Sh-Token");
  let comBtn = document.getElementById(`btn-${ID}`);
  let commentValue = comBtn.parentElement.firstElementChild.children[1].value;
  axios.post(`${baseUrl}/posts/${ID}/comments`, {
    "body": commentValue 
  },{
    headers: {
      authorization: `Bearer ${token}`
    }
  })
  .then(reponse => {
  showComments(ID,token)
  })
  .catch( error => console.log(error.data))
}
getposts();

///////////////////////////////////////////////////////////////////////////////////////////////
function profileS() {
  const userData = JSON.parse(localStorage.getItem("Sh-user"));
  const profileDiv = document.getElementById("profile_div");
  if (userData) {
    profileDiv.style.display = "flex";
    profileDiv.innerHTML = `
    <img src="${userData.profile_image}" alt="profile Image" id="profile_IMG">
    <a class="nav-link" id="profile_name" href="#" onclick="profile(${userData.id})">${userData.username}</a>
    `;
  } else {
    profileDiv.style.display = "none";
  }
}
function profile(id) {
  window.location = `profile.html?id=${id}`
}

function personalProfile() {
  let user = JSON.parse(localStorage.getItem("Sh-user"))
  profile(user.id)
}
///////////////////////////////////////////////////////////////////////////////////////////////

// alert massage ////

const appendAlert = (message, type, DivId) => {
  const alertPlaceholder = document.getElementById(DivId);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} d-flex align-items-center alert-dismissible" role="alert">`,
    `   <div>  
          <div>
            ${message}
          </div>
        </div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");
  alertPlaceholder.append(wrapper);
};

// end  alert massage ////

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// login and sign in functions  //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function login() {
  const username = document.querySelector("#user-name").value;
  const password = document.querySelector("#password-text").value;
  const loginModel = document.querySelector("#loginModal");
  const loginData = {
    username: username,
    password: password,
  };
  axios
    .post(`${baseUrl}/login`, loginData)
    .then((respone) => {
      localStorage.setItem("Sh-Token", respone.data.token);
      localStorage.setItem("Sh-user", JSON.stringify(respone.data.user));
      console.log("you have logged in secc ");

      const modelInst = bootstrap.Modal.getInstance(loginModel);
      modelInst.hide();
      appendAlert(
        "Congratulation, you have been logged in successfully!",
        "success",
        "liveAlertSecc"
      );
      setupUI();
      getposts();
    })
    .catch((erorr) => {
      appendAlert(`${erorr.response.data.message}`, "danger", "loginAlert");
    });
}
///////////////////////////////////////////////////////////////////////////
function signin() {
  const username = document.querySelector("#new-username").value;
  const password = document.querySelector("#new-password").value;
  const urName = document.querySelector("#newName").value;
  const newEmail = document.querySelector("#newEmail").value;
  const loginModel = document.querySelector("#signinModal");
  const profileImg = document.getElementById("profile-img").files[0];
  // const signinData = {
  //   "username": username,
  //   "name": urName,
  //   "email": newEmail,
  //   "password": password,
  //   "image": profileImg
  // }
  const signinData = new FormData();
  signinData.append("username", username);
  signinData.append("name", urName);
  signinData.append("email", newEmail);
  signinData.append("password", password);
  signinData.append("image", profileImg);

  axios
    .post(`${baseUrl}/register`, signinData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((respone) => {
      localStorage.setItem("Sh-Token", respone.data.token);
      localStorage.setItem("Sh-user", JSON.stringify(respone.data.user));
      console.log("you have signed in secc ");
      const modelInst = bootstrap.Modal.getInstance(loginModel);
      modelInst.hide();
      appendAlert(
        "Congratulation, you have been signed in successfully!",
        "success",
        "liveAlertSecc"
      );
      setupUI();
      getposts()
    })
    .catch((respone) => {
      appendAlert(`${respone.response.data.message}`, "danger", "signinAlert");
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// setup the User interface //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function setupUI() {
  const token = localStorage.getItem("Sh-Token");
  const logInBtn = document.getElementById("login");
  const signInBtn = document.getElementById("signIn");
  const logoutBtn = document.getElementById("logOut");
  const newPostBtn = document.getElementById("post-btn");
  const bottomBar = document.getElementsByClassName("mob-b-bar")[0];
    if (token) {
    newPostBtn.style.display = "grid";
    logInBtn.style.display = "none";
    signInBtn.style.display = "none";
    logoutBtn.style.display = "block";
    bottomBar.style.display = "block";
    profileS();
  } else {
    newPostBtn.style.display = "none";
    logInBtn.style.display = "block";
    signInBtn.style.display = "block";
    logoutBtn.style.display = "none";
    bottomBar.style.display = "none";
    profileS();
  }
}
setupUI();

function logout() {
  localStorage.removeItem("Sh-Token");
  localStorage.removeItem("Sh-user");
  appendAlert(
    "you have been logged out successfully!",
    "danger",
    "liveAlertSecc"
  );
  setupUI();
  getposts()
}
///////////////////////////////////////////////////////////////////////////////
/////////////////////////// send new post /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function clearP() {
  const postText = document.getElementById("add-post-text");
  const postImage = document.getElementById("add-post-image");
  const PmLable =  document.getElementById("addPostModalLabel")
  const pmBtn = document.getElementById("postBtn");
  let isEdit = document.getElementById("IsEdit");

  pmBtn.innerText = "Create"
  PmLable.innerText = "Create a New Post"
  isEdit.value = "";
  postText.value = "";
  postImage.value = "";
}

function sendNewPost() {
  let isEdit = document.getElementById("IsEdit").value;
  const postText = document.getElementById("add-post-text").value;
  const postImage = document.getElementById("add-post-image").files[0];
  const token = localStorage.getItem("Sh-Token");
  // const PmLable =  document.getElementById("addPostModalLabel")
  // const pmBtn = document.getElementById("postBtn");
  // PmLable.innerText = "Create a New Post"
  // pmBtn.innerText = "Create"
  
  let postData = new FormData();
  postData.append("body", postText);
  postData.append("image", postImage);

  const headers = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };
  if(isEdit){
    postData.append("_method","put")
    axios.post(`${baseUrl}/posts/${isEdit}`, postData, {
      headers: headers,
    })
    .then((respone) => {
      const modelInst = bootstrap.Modal.getInstance(addPostModal);
      modelInst.hide();
      if (location.pathname == "/profile.html") {
        userPosts()
      }else {
        getposts();
      }
    })
    .catch((error) => {
      console.log(error)
      appendAlert(`${error}`, "danger", "postAlert");
    });
  }else{
  axios
    .post(`${baseUrl}/posts`, postData, {
      headers: headers,
    })
    .then((test) => {
      const modelInst = bootstrap.Modal.getInstance(addPostModal);
      modelInst.hide();
      getposts();
    })
    .catch((error) => {
      appendAlert(`${error.message}`, "danger", "postAlert");
    });
  }
}

function EditPost(PostId) {
  const PmLable =  document.getElementById("addPostModalLabel")
  const PmText =  document.getElementById("add-post-text")
  const PmImage =  document.getElementById("add-post-image")
  const pmBtn = document.getElementById("postBtn");
  PmLable.innerText = "Edit Post"
  pmBtn.innerText = "update"
  PmImage.value = ""
  PmText.value = ""
  const modelInst = new bootstrap.Modal(document.getElementById("addPostModal"));
  modelInst.toggle();
  let IsEdit = document.getElementById("IsEdit")
  IsEdit.value = PostId;
}

let isDelete = document.getElementById("isDelete");
const DeleteModel = new bootstrap.Modal(document.getElementById("deletePostModal"));

function deletePost(PostId) {
  DeleteModel.toggle();
  isDelete.value = PostId;
}

function confirmDelete() {
  let token = localStorage.getItem("Sh-Token")
  axios.delete(`${baseUrl}/posts/${isDelete.value}`, {
    headers : {
      authorization: `Bearer ${token}`
    }
  })
  .then(respone => {
    DeleteModel.hide()
    appendAlert(`the Post has been deleted successfully`, "success", "liveAlertSecc")
    isDelete.value = "";
    getposts()
  })
}

