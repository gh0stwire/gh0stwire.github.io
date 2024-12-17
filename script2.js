let obj = {};

const asteroidSetUp = (x) => {
  let asteroids = new Set();
  while (asteroids.size < 11) {
    const randomX = Math.floor(Math.random() * x) + 1;
    const randomY = Math.floor(Math.random() * x) + 1;
    asteroids.add(`#cell-${randomX}-${randomY}`);
  }

  let arr = Array.from(asteroids);
  return arr;
};

let highestArr=[];

const gridGenerator = (n) => {
  let score = 0;
  let highest = Math.max(...highestArr)==-Infinity?0:Math.max(...highestArr);

  let strTable = `<div class="scoretable">
        <pre>
        <p style="margin:0px; padding:10px;color:rgb(226,212,185); font-family:'Source Code Pro';">
          Score: 0     Highest: ${highest}
        </p>
        </pre>
      </div><table>`;
  
  for (let i = 0; i < n; i++) {
    strTable += `<tr>`;
    for (let j = 0; j < n; j++) {
      strTable += `<td class="field" id="cell-${i + 1}-${j + 1}"></td>`;
    }
    strTable += `</tr>`;
  }
  strTable += `</table>`;

  document.querySelector(".container").innerHTML = strTable;

  
  const blocks = asteroidSetUp(n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cell = document.querySelector(`#cell-${i + 1}-${j + 1}`);

      cell.addEventListener("mouseenter", () => {
        if (!cell.classList.contains("active")) {
          cell.style.border = "solid";
          cell.style.borderWidth = "2px";
          cell.style.height = "96px";
          cell.style.width = "96px";
          cell.style.backgroundColor = "rgb(248, 165, 165)";
          cell.style.borderColor = "rgb(248,118,127)";
          cell.style.boxShadow = "3px 3px 6px rgba(0,0,0,0.6)";
          cell.style.cursor = "pointer";
        }
      });

      cell.addEventListener("mouseleave", () => {
        if (!cell.classList.contains("active")) {
          cell.removeAttribute("style");
        }
      });

      cell.addEventListener("click", () => {
        if (blocks.includes(`#${cell.id}`) && !cell.classList.contains("active")) {
          alert("You have crashed!");
          for (let p = 0; p < n; p++) {
            for (let q = 0; q < n; q++) {
              document.querySelector(`#cell-${p + 1}-${q + 1}`).classList.add("active");
            }
          }
          if (score > highest) highest = score;

          document.querySelector(".scoretable").innerHTML = `
            <pre>
            <p style="margin:0px; padding:10px;color:rgb(226,212,185); font-family:'Source Code Pro';">
              Score: ${score}     Highest: ${highest}
              
              <button id='reset' style="background-color:rgb(166,7,47);color:rgb(255,255,255);height:36px;border-radius:18px;font-family:'Source Code Pro';width:80px;">Reset</button>
            </p>
            </pre>`;

          resetButtonHandler(n);
        } else if (!cell.classList.contains("active")) {
          cell.classList.add("active");
          score++;
          if (score > highest) highest = score;
          if (score >= n*n-11){
            alert("Woohoo! You have escaped the asteroid belt. \u{1F38A} \u{1F973}");
            return;
          }
          document.querySelector(".scoretable").innerHTML = `
            <pre>
            <p style="margin:0px; padding:10px;color:rgb(226,212,185); font-family:'Source Code Pro';">
              
              Score: ${score}     Highest: ${highest}
              
              <button id='reset' style="background-color:rgb(166,7,47);color:rgb(255,255,255);height:36px;border-radius:18px;font-family:'Source Code Pro';width:80px;">Reset</button>
            </p>
            </pre>`;

          resetButtonHandler(n);
        }
      });
    }
  }

  console.log(blocks.sort());


  function resetButtonHandler(x) {
    document.querySelector("#reset").addEventListener("click", () => {
      highestArr.push(highest);
      gridGenerator(x);
    });
  }
};

const dropdown = document.querySelector(".dropdown");
dropdown.addEventListener("change", () => {
  let x = dropdown.value;
  if (x == "6 \u00D7 6") gridGenerator(6);
  else if (x == "7 \u00D7 7") gridGenerator(7);
  else if (x == "--- Select a size ---")
    document.querySelector(".container").innerHTML = "";
});
