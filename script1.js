const progressBar = document.getElementById("progressBar");

    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY; 
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight; 
      const scrollPercentage = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = scrollPercentage + "%";
    });