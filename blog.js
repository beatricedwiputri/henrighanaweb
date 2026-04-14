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

// function formatDate(data) {
//   let formattedDate = "-";

//   if (data.date) {
//     const dateObj = new Date(data.date);
//     formattedDate = dateObj.toLocaleDateString("de-DE");
//   }

//   return formattedDate;
// }

function formatDate(data) {
  let formattedDate = "-";

  if (data.date) {
    const dateObj = new Date(data.date);
    formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  return formattedDate;
}

// Load all blogs for listing page
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
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;
      const formattedDate = formatDate(data);

      html += `
        <div class="blog-post" data-aos="fade-up">
          <img src="${data.imageUrl}" alt="${data.title}">
          <div class="blog-content">
            <h4>${data.title}</h4>
            <p class="date">${formattedDate}</p>
            <p>${data.content.substring(0, 550)}...</p>
            <a href="blog1.html?id=${id}" class="readmore">Read more</a>
          </div>
        </div>
      `;
    });

    blogList.innerHTML = html;
  } catch (err) {
    console.error(err);
    blogList.innerHTML = "<p>Failed to load blogs.</p>";
  }
}

// Load single blog post for blog1.html
async function loadBlogPost() {
  const params = new URLSearchParams(window.location.search);
  const blogId = params.get("id");
  const container = document.getElementById("blogPostContainer");
  if (!blogId || !container) return;

  try {
    const docRef = doc(db, "blogs", blogId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      container.innerHTML = "<p>Blog not found.</p>";
      return;
    }

    const data = docSnap.data();
    const formattedDate = formatDate(data);

    container.innerHTML = `
      <h1 data-aos="fade-up">${data.title}</h1>
      <p<p class="meta" data-aos="fade-up" data-aos-delay="200">
        ${formattedDate} by ${data.author}
      </p>
      <img src="${data.imageUrl}" alt="${data.title}" data-aos="fade-up" data-aos-delay="400">
      <div class="blog-body">${data.content}</div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load blog.</p>";
  }
}

// Automatically run functions depending on page
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("blogList")) loadBlogs(); // listing page
  if (document.getElementById("blogPostContainer")) loadBlogPost(); // single post page
});
