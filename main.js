// let input = document.querySelector("input");
// let btn = document.querySelector("button");
// let meme_name = document.querySelector(".meme_name");
// let meme_image = document.querySelector(".image");
// btn.addEventListener("click", () => {
//   fetch("https://api.imgflip.com/get_memes")
//     .then((res) => res.json())
//     .then((data) => {
//       if (!isNaN(+input.value)) {
//         if (+input.value <= 99) {
//           meme_name.innerHTML = data.data.memes[input.value].name;
//           meme_image.src = data.data.memes[input.value].url;
//         } else {
//           meme_name.innerHTML = "invalid number";
//           meme_image.src = "";
//         }
//       } else {
//         meme_name.innerHTML = "please enter valid number";
//         meme_image.src = "";
//       }
//     })
//     .catch((e) => {
//       return e.message;
//     });
// });

let input = document.querySelector("input");
let btn = document.querySelector("button");
let meme_name = document.querySelector(".meme_name");
let meme_image = document.querySelector(".image");

function showmeme() {
  fetch("https://api.imgflip.com/get_memes")
    .then((res) => res.json())
    .then((data) => {
      if (!isNaN(+input.value)) {
        if (+input.value <= 99) {
          meme_name.innerHTML = data.data.memes[input.value].name;
          meme_image.src = data.data.memes[input.value].url;
        } else {
          meme_name.innerHTML = "Invalid number (must be 0 to 99)";
          meme_image.src = "";
        }
      } else {
        meme_name.innerHTML = "Please enter a valid number";
        meme_image.src = "";
      }
    })
    .catch((e) => {
      meme_name.innerHTML = "Something went wrong!";
      meme_image.src = "";
    });
}

btn.addEventListener("click", showmeme);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    showmeme();
  }
});
