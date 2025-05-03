document.addEventListener("DOMContentLoaded", function () {
    const numbers = document.querySelectorAll('.number');
  
    function animateCount(element) {
      const target = +element.getAttribute('data-count');
      let current = +element.innerText;
  
      if (current < target) {
        const increment = target / 100; // Increment step
        element.innerText = Math.ceil(current + increment);
        setTimeout(() => animateCount(element), 2000);
      } else {
        element.innerText = target; // Ensuring it stops exactly at the target
      }
    }
  
    function onScroll() {
      numbers.forEach((num) => {
        if (window.innerHeight + window.scrollY >= num.offsetTop) {
          animateCount(num);
        }
      });
    }
  
    window.addEventListener('scroll', onScroll);
  });
  
  // CAROUSAL SLIDE

  const carouselBox = document.querySelector('.carousel-box');
  let currentAngle = 0;

  // Function to rotate the carousel
  const rotateCarousel = (direction) => {
    currentAngle += direction === 'next' ? -120 : 120;
    carouselBox.style.transform = `rotateY(${currentAngle}deg)`;
  };

  // Automatically rotate the carousel every 3 seconds
  setInterval(() => rotateCarousel('next'), 3000);



  // QUOTE TYPEWRITTER
  // Quotes array
  const quotes = [
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Success doesn’t just find you; you have to go out and get it.",
    "Dream bigger. Do bigger.",
  ];

  const typewriterElement = document.getElementById("typewriter");
  let quoteIndex = 0; 
  let charIndex = 0; 
  let isDeleting = false; 
  const typingSpeed = 100; 
  const deletingSpeed = 50; 
  const pauseBetweenQuotes = 2000; 

  function typeWriterEffect() {
    const currentQuote = quotes[quoteIndex];
    const displayText = currentQuote.substring(0, charIndex);

    // Update the typewriter text
    typewriterElement.textContent = displayText;

    // Adjust behavior for typing and deleting
    if (!isDeleting && charIndex < currentQuote.length) {
      charIndex++; // Type a character
      setTimeout(typeWriterEffect, typingSpeed);
    } else if (isDeleting && charIndex > 0) {
      charIndex--; // Delete a character
      setTimeout(typeWriterEffect, deletingSpeed);
    } else {
      // Transition between typing and deleting
      if (!isDeleting) {
        isDeleting = true; // Start deleting after typing is complete
        setTimeout(typeWriterEffect, pauseBetweenQuotes);
      } else {
        // Move to the next quote
        isDeleting = false;
        quoteIndex = (quoteIndex + 1) % quotes.length; // Loop back to the first quote
        setTimeout(typeWriterEffect, typingSpeed);
      }
    }
  }

  // Start the typewriter effect after DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    typeWriterEffect();
  });

