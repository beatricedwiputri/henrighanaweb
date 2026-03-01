import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBYtqS1Az_bRk6yopZ3prUtZfeb1LxJoSI",
  authDomain: "henrighanaweb.firebaseapp.com",
  projectId: "henrighanaweb",
  storageBucket: "henrighanaweb.firebasestorage.app",
  messagingSenderId: "15069329514",
  appId: "1:15069329514:web:b70d904d3e1ccc257cf213",
  measurementId: "G-CXDJFWTW6Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let allDocs = [];

/* =========================
   LOAD BLOGS
========================= */
async function loadBlogs() {
  const blogList = document.getElementById("blogList");
  if (!blogList) return;

  try {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      blogList.innerHTML = "<p>No blogs uploaded yet.</p>";
      return;
    }

    let html = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      // Use data-* attributes to store info safely
      html += `
        <div class="blog-card" 
             data-id="${id}"
             data-title="${data.title}"
             data-author="${data.author}"
             data-date="${data.date}"
             data-content='${encodeURIComponent(data.content)}'
             data-imageurl="${data.imageUrl}"
             data-imagepath="${data.imagePath || ''}"
             style="border:1px solid #ccc; padding:15px; margin-bottom:15px; border-radius:10px; background:#f9f9f9;">
          <h3>${data.title}</h3>
          <p><strong>Author:</strong> ${data.author}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <div class="blog-content" style="margin-top:10px;">
            ${data.content}
          </div>
          <button class="edit-btn" style="margin-top:10px;">Edit</button>
          <button class="delete-btn" style="margin-top:10px;">Delete</button>
        </div>
      `;
    });

    blogList.innerHTML = html;

    // Add event listeners for Edit/Delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.blog-card');
        const id = card.dataset.id;
        const title = card.dataset.title;
        const author = card.dataset.author;
        const date = card.dataset.date;
        const content = decodeURIComponent(card.dataset.content);
        const imageUrl = card.dataset.imageurl;
        const imagePath = card.dataset.imagepath;

        editBlog(id, title, author, date, content, imageUrl, imagePath);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.blog-card');
        const id = card.dataset.id;
        const imageUrl = card.dataset.imageurl;
        deleteBlog(id, imageUrl);
      });
    });

  } catch (error) {
    console.error(error);
    blogList.innerHTML = "<p>Failed to load blogs.</p>";
  }
}
const blogMessage = document.getElementById("blogMessage");
const blogLoading = document.getElementById("blogLoading");

function showMessage(msg, color = "green") {
  blogMessage.style.color = color;
  blogMessage.textContent = msg;
  setTimeout(() => blogMessage.textContent = "", 3000); // hide after 3s
}

function showLoading(show = true) {
  blogLoading.style.display = show ? "block" : "none";
}

/* =========================
   LOAD FORM DATA
========================= */
async function loadData() {
  const dataList = document.getElementById("dataList");
  if (!dataList) return;

  try {
    const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      dataList.innerHTML = "<p>No data found.</p>";
      return;
    }

    allDocs = [];
    snapshot.forEach(doc => allDocs.push(doc.data()));

    renderData(allDocs);

  } catch (err) {
    console.error(err);
    dataList.innerHTML = "<p>Failed to load data.</p>";
  }
}

/* =========================
   RENDER FORM DATA
========================= */
function renderData(docs) {
  const dataList = document.getElementById("dataList");
  if (!dataList) return;

  if (!docs.length) {
    dataList.innerHTML = "<p>No data found.</p>";
    return;
  }

  let html = "";

  docs.forEach((data) => {
    html += `<div style="border:1px solid #ddd; padding:15px; margin-bottom:15px;">`;
    html += `<p><strong>Type:</strong> ${data.type}</p>`;
    html += `<p><strong>Name:</strong> ${data.name}</p>`;
    html += `<p><strong>Email:</strong> ${data.email}</p>`;
    html += `<p><strong>Submitted At:</strong> ${data.timestamp ? data.timestamp.toDate() : "-"}</p>`;
    html += `</div>`;
  });

  dataList.innerHTML = html;
}

/* =========================
   FILTER
========================= */
const typeFilter = document.getElementById("typeFilter");
if (typeFilter) {
  typeFilter.addEventListener("change", () => {
    const filterValue = typeFilter.value;

    if (filterValue === "all") {
      renderData(allDocs);
    } else {
      const filtered = allDocs.filter(doc => doc.type === filterValue);
      renderData(filtered);
    }
  });
}

/* =========================
   BLOG UPLOAD
========================= */
const blogForm = document.getElementById("blogForm");

if (blogForm) {
  blogForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading(true);

    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const author = document.getElementById("author").value;
    // const content = document.getElementById("content").value;
    const content = quill.root.innerHTML;
    const imageFile = document.getElementById("image").files[0];

    try {
      const fileName = Date.now() + "_" + imageFile.name;
      const imagePath = "blogImages/" + fileName;
      const imageRef = ref(storage, imagePath);

      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "blogs"), {
        title,
        date,
        author,
        content,
        imageUrl,
        imagePath, // simpan path yang sama persis
        createdAt: serverTimestamp()
      });

      showMessage("Blog uploaded successfully!");
      blogForm.reset();
      loadBlogs();

    } catch (error) {
      console.error(error);
      showMessage("Failed to upload blog.");
    } finally {
      showLoading(false);
    }
  });
}

/* =========================
   DELETE BLOG
========================= */
window.deleteBlog = async function(id) {
  if (!confirm("Delete this blog?")) return;

  try {
    const blogRef = doc(db, "blogs", id);
    const blogSnap = await getDoc(blogRef);

    if (blogSnap.exists()) {
      const blogData = blogSnap.data();

      // Hapus gambar dari Storage pakai imagePath
      if (blogData.imagePath) {
        const oldImageRef = ref(storage, blogData.imagePath);
        await deleteObject(oldImageRef).catch(err => console.warn("Failed to delete image:", err));
      }
    }

    await deleteDoc(blogRef);

    alert("Blog deleted successfully!");
    loadBlogs();

  } catch (error) {
    console.error(error);
    alert("Failed to delete blog.");
  }
};

/* =========================
   EDIT BLOG
========================= */
let currentEditId = null;
let currentImageUrl = null;
let currentImagePath = null;

window.editBlog = function(id, title, author, date, content, imageUrl, imagePath) {
  currentEditId = id;
  currentImageUrl = imageUrl;
  currentImagePath = imagePath || null;

  document.getElementById("editTitle").value = title;
  document.getElementById("editAuthor").value = author;
  document.getElementById("editDate").value = date;
  // document.getElementById("editContent").value = content;
  quillEdit.root.innerHTML = content;

  // Tampilkan preview gambar lama
  const preview = document.getElementById("editImagePreview");
  if (preview) {
    preview.src = imageUrl || "";
    preview.style.display = imageUrl ? "block" : "none";
  }

  document.getElementById("editModal").style.display = "flex";
};

window.closeEditModal = function() {
  document.getElementById("editModal").style.display = "none";
};

const saveEditBtn = document.getElementById("saveEditBtn");
if (saveEditBtn) {
  saveEditBtn.addEventListener("click", async () => {
    showLoading(true);

    try {
      const newTitle = document.getElementById("editTitle").value;
      const newAuthor = document.getElementById("editAuthor").value;
      const newDate = document.getElementById("editDate").value;
      // const newContent = document.getElementById("editContent").value;
      const newContent = quillEdit.root.innerHTML;
      const newImageFile = document.getElementById("editImage")?.files[0];

      let updatedData = {
        title: newTitle,
        author: newAuthor,
        date: newDate,
        content: newContent
      };

      // Jika ada file baru, replace image lama
      if (newImageFile) {
        if (currentImagePath) {
          const oldImageRef = ref(storage, currentImagePath);
          await deleteObject(oldImageRef).catch(err => console.warn("Failed to delete old image:", err));
        }

        const fileName = Date.now() + "_" + newImageFile.name;
        const newImagePath = "blogImages/" + fileName;
        const newImageRef = ref(storage, newImagePath);

        await uploadBytes(newImageRef, newImageFile);
        const newImageUrl = await getDownloadURL(newImageRef);

        updatedData.imageUrl = newImageUrl;
        updatedData.imagePath = newImagePath;
        currentImageUrl = newImageUrl;
        currentImagePath = newImagePath;
      }

      await updateDoc(doc(db, "blogs", currentEditId), updatedData);

      showMessage("Edit successful!");
      closeEditModal();
      loadBlogs();

    } catch (error) {
      console.error(error);
      showMessage("Failed to edit blog");
    } finally {
      showLoading(false);
    }
  });
}


/* =========================
   AUTO LOAD PER PAGE
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadBlogs();
  loadData();
});


// Initialize Quill for upload
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  }
});

// Initialize Quill for edit modal
const quillEdit = new Quill('#editEditor', {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  }
});