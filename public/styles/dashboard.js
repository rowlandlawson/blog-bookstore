// Logout function
function logout() {
    window.location.href = "/logout";
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

// Alert section
$(document).ready(function () {
    setTimeout(function () {
      $(".alert").fadeOut("slow");
    }, 3000); // Alert disappears after 3 seconds
  });

// Edit Post
function editPost(id) {
    // Find the post from the page
    const post = document.querySelector(`[data-post-id="${id}"]`);
    
    if (!post) {
      alert("Post not found!");
      return;
    }
  
    const title = post.querySelector(".card-title").innerText;
    const content = post.querySelector(".card-text").innerText;
  
    // Populate the form fields with the post data
    document.querySelector("input[name='title']").value = title;
    document.querySelector("textarea[name='content']").value = content;
    document.querySelector("#blogPostForm").action = `/posts/${id}?_method=PUT`; // Set form action to PUT request
  }

  document.addEventListener("DOMContentLoaded", function () {
    const showMoreBtn = document.getElementById("showMoreBtn");
    const showMoreModal = new bootstrap.Modal(document.getElementById("showMoreModal"));
    const readMoreModal = new bootstrap.Modal(document.getElementById("readMoreModal"));
    
    if (showMoreBtn) {
      showMoreBtn.addEventListener("click", function () {
        showMoreModal.show(); // Open full-screen modal
      });
    }
  
    // Read More Button
    document.querySelectorAll(".read-more-btn").forEach(button => {
      button.addEventListener("click", function () {
        const fullContent = this.getAttribute("data-fullcontent");
        document.getElementById("fullContent").innerHTML = fullContent;
        readMoreModal.show();
      });
    });
  });
    