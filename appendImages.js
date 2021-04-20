const imagesSrc = ['planet0.jpg', 'planet1.jpg', 'planet2.jpg', 'planet3.jpg', 'planet4.jpg', 'planet5.jpg'];

let ul = document.querySelector('.sim-slider-list');

let li;
let img;

imagesSrc.forEach(element => {
    li = document.createElement('li');
    li.className = 'sim-slider-element';

    img = document.createElement('img');
    img.src = "images/" + element;

    li.appendChild(img)
    ul.appendChild(li);
});
