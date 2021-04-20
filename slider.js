function Sim(sldrId) {

    let id = document.getElementById(sldrId);
    if (id) {
        this.sldrRoot = id;
    } else {
        this.sldrRoot = document.querySelector('.sim-slider');
    }

    // Carousel objects
    this.sldrList = this.sldrRoot.querySelector('.sim-slider-list');
    this.sldrElements = this.sldrList.querySelectorAll('.sim-slider-element');
    this.leftArrow = this.sldrRoot.querySelector('div.sim-slider-arrow-left');
    this.rightArrow = this.sldrRoot.querySelector('div.sim-slider-arrow-right');
    this.indicatorDots = this.sldrRoot.querySelector('div.sim-slider-dots');
    this.autoplayButton = this.sldrRoot.querySelector('button.sim-slider-autoplay-btn');

    this.options = Sim.defaults;
    Sim.initialize(this);
}

Sim.defaults = {
    loop: true,     // Бесконечное зацикливание слайдера
    auto: true,     // Автоматическое пролистывание
    interval: 2000, // Интервал между пролистыванием элементов (мс)
    arrows: true,   // Пролистывание стрелками
    dots: true      // Индикаторные точки
};

Sim.prototype.elemPrev = function (num) {
    num = num || 1;

    let prevElement = this.currentElement;
    this.currentElement -= num;
    if (this.currentElement < 0) {
        this.currentElement = this.elemCount - 1;
    }

    if (!this.options.loop) {
        if (this.currentElement == 0) {
            this.leftArrow.style.display = 'none'
        }
        this.rightArrow.style.display = 'block'
    }


    this.sldrElements[prevElement].style.opacity = '0';
    this.sldrElements[this.currentElement].style.opacity = '1';

    if (this.options.dots) {
        this.dotOn(prevElement);
        this.dotOff(this.currentElement)
    }
    localStorage.setItem('currentElement', JSON.stringify(this.currentElement));
};

Sim.prototype.elemNext = function (num) {
    num = num || 1;

    let prevElement = this.currentElement;
    this.currentElement += num;
    if (this.currentElement >= this.elemCount) this.currentElement = 0;

    if (!this.options.loop) {
        if (this.currentElement == this.elemCount - 1) {
            this.rightArrow.style.display = 'none'
        }
        this.leftArrow.style.display = 'block'
    }


    this.sldrElements[this.currentElement].style.opacity = '1';
    this.sldrElements[prevElement].style.opacity = '0';

    if (this.options.dots) {
        this.dotOn(prevElement);
        this.dotOff(this.currentElement)
    }
    localStorage.setItem('currentElement', JSON.stringify(this.currentElement));
};

Sim.prototype.dotOn = function (num) {
    this.indicatorDotsAll[num].style.cssText = 'background-color:#BBB; cursor:pointer;'
};

Sim.prototype.dotOff = function (num) {
    this.indicatorDotsAll[num].style.cssText = 'background-color:#556; cursor:default;'
};

Sim.initialize = function (that) {
    that.elemCount = that.sldrElements.length; // Количество элементов

    let autoplay;
    if (localStorage.getItem('autoplay') !== null) {
        autoplay = JSON.parse(localStorage.getItem("autoplay"));
    } else {
        autoplay = true;
    }

    if (autoplay) {
        that.autoplayButton.innerText = 'Stop';
    } else {
        that.autoplayButton.innerText = 'Start';
    }

    if (localStorage.getItem('currentElement') !== null) {
        that.currentElement = JSON.parse(localStorage.getItem("currentElement"));
    } else {
        that.currentElement = 0;
    }

    let bgTime = getTime();

    function getTime() {
        return new Date().getTime();
    }

    function setAutoScroll() {

        that.autoScroll = setInterval(function () {
            let fnTime = getTime();

            if (fnTime - bgTime + 10 > that.options.interval) {
                bgTime = fnTime;
                if (that.options.auto) {
                    that.elemNext()
                }
            }
        }, that.options.interval)
    }

    if (that.elemCount <= 1) {   // Отключить навигацию
        that.options.auto = false;
        that.options.arrows = false;
        that.options.dots = false;
        that.leftArrow.style.display = 'none';
        that.rightArrow.style.display = 'none'
    }

    if (that.elemCount >= 1) {   // показать первый элемент
        that.sldrElements[that.currentElement].style.opacity = '1';
    }

    if (!that.options.loop) {
        that.leftArrow.style.display = 'none';  // отключить левую стрелку
        that.options.auto = false; // отключить автопркрутку
    } else if (that.options.auto && autoplay) {   // инициализация автопрокруки
        setAutoScroll();
    }

    if (that.options.arrows) {  // инициализация стрелок
        that.leftArrow.addEventListener('click', function () {
            let fnTime = getTime();
            if (fnTime - bgTime > 1000) {
                bgTime = fnTime;
                that.elemPrev();
            }
        }, false);
        that.rightArrow.addEventListener('click', function () {
            let fnTime = getTime();
            if (fnTime - bgTime > 1000) {
                bgTime = fnTime;
                that.elemNext()
            }
        }, false)
    } else {
        that.leftArrow.style.display = 'none';
        that.rightArrow.style.display = 'none'
    }

    that.autoplayButton.addEventListener('click', function () { // листенер кнопки автоплея
        autoplay = !autoplay;
        if (autoplay) {
            that.autoplayButton.innerText = 'Stop';
            setAutoScroll();
        } else {
            that.autoplayButton.innerText = 'Start';
            clearInterval(that.autoScroll);
        }
        localStorage.setItem('autoplay', JSON.stringify(autoplay));
    }, false)

    if (that.options.dots) {  // инициализация индикаторных точек
        let sum = '', diffNum;
        for (let i = 0; i < that.elemCount; i++) {
            sum += '<span class="sim-dot"></span>'
        }

        that.indicatorDots.innerHTML = sum;
        that.indicatorDotsAll = that.sldrRoot.querySelectorAll('span.sim-dot');
        // Назначаем точкам обработчик события 'click'
        for (let n = 0; n < that.elemCount; n++) {
            that.indicatorDotsAll[n].addEventListener('click', function () {
                diffNum = Math.abs(n - that.currentElement);
                if (n < that.currentElement) {
                    bgTime = getTime();
                    that.elemPrev(diffNum)
                } else if (n > that.currentElement) {
                    bgTime = getTime();
                    that.elemNext(diffNum);
                }
            }, false)
        }

        that.dotOff(that.currentElement);  // текущая точка выключена, остальные включены
        for (let i = 1; i < that.elemCount, i != that.currentElement; i++) {
            that.dotOn(i)
        }
    }

    document.onkeydown = function (evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27 ) {
            window.close();
        }
        if (evt.keyCode == 37 || evt.keyCode == 123) {
            let fnTime = getTime();
            if (fnTime - bgTime > 1000) {
                bgTime = fnTime;
                that.elemPrev()
            }
        }
        if (evt.keyCode == 39 || evt.keyCode == 124) {

            let fnTime = getTime();
            if (fnTime - bgTime > 1000) {
                bgTime = fnTime;
                that.elemNext()
            }
        }
    };
};

new Sim();