// Animated counter function
function animateCounters() {
    const counters = document.querySelectorAll('.number');
    const speed = 200; // Animation duration in ms
    
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const increment = target / speed;
      
      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(animateCounters, 200);
      } else {
        counter.innerText = target;
      }
    });
  }
  
  // Start animation when page loads
//   window.addEventListener('load', animateCounters);
  
//   Optional: Start when element is visible
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounters();
    }
  });
  observer.observe(document.querySelector('.Counter'));


  // READ MORE BUTTON FOR THE BLOG
  document.addEventListener('DOMContentLoaded', function() {
    // Select all read more buttons
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    // Add click event to each button
    readMoreButtons.forEach(button => {
      button.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        const preview = document.getElementById(`content-${postId}`);
        const fullContent = document.getElementById(`full-content-${bookId}`);

        const bookId = this.getAttribute('data-post-id');
        const prev = document.getElementById(`content-${bookId}`);
        const Content = document.getElementById(`full-content-${bookId}`);
        
        
        if (fullContent.style.display === 'none') {
          preview.style.display = 'none';
          fullContent.style.display = 'block';
          this.textContent = 'See Less';
        } else {
          fullContent.style.display = 'none';
          preview.style.display = 'block';
          this.textContent = 'Read More';
        }

        if (Content.style.display === 'none') {
          prev.style.display = 'none';
          fullContent.style.display = 'block';
          this.textContent = 'See Less';
        } else {
          Content.style.display = 'none';
          prev.style.display = 'block';
          this.textContent = 'Read More';
        }
      });
    });
  });

  // see less
  
  function toggleReadMore(index) {
    const preview = document.getElementById(`preview${index}`);
    const full = document.getElementById(`fullContent${index}`);
    const btn = document.getElementById(`toggleBtn${index}`);

    if (full.style.display === "none") {
      preview.style.display = "none";
      full.style.display = "block";
      btn.textContent = "See Less";
    } else {
      preview.style.display = "block";
      full.style.display = "none";
      btn.textContent = "Read More";
    }
  }

  // Book Management
$(document).ready(function() {
  // Handle edit book button click
  $('.edit-book-btn').click(function() {
    const bookId = $(this).data('book-id');
    const bookTitle = $(this).data('book-title');
    const bookDescription = $(this).data('book-description');
    const bookPrice = $(this).data('book-price');
    
    $('#editBookTitle').val(bookTitle);
    $('#editBookDescription').val(bookDescription);
    $('#editBookPrice').val(bookPrice);
    $('#editBookForm').attr('action', '/books/' + bookId);
    
    const editBookModal = new bootstrap.Modal(document.getElementById('editBookModal'));
    editBookModal.show();
  });

  // Handle logout
  $('#logout-btn').click(function(e) {
    e.preventDefault();
    window.location.href = '/logout';
  });
});

