document.addEventListener('DOMContentLoaded', function () {

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////// ----------------------------- Slider Code -----------------------------////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Total number of sliders on the page
  const sliderCount = document.querySelectorAll(".slider").length;

  // to keep track of the exact translations of all the slides of individual sliders
  let translateArrs = [];

  // 2nd arrow box
  const arrowBox2 = document.querySelector(".arrow-box-2");

  // adding one array for each sliders
  for (let i = 0; i < sliderCount; i++) {
    translateArrs.push([]);
  }

  // to keep track of the mouse movement
  let isMouseDown = false;

  // initial position of the mouse
  let initialPos = 0;

  // different timings for different timing functions
  const animationDuration = "1s", intervalDurationMs = 5000, durationOfTimeoutAfterInterval = 10;
  // const timeoutDurationMs = 10000, intervalDurationMs = 15000, durationOfTimeoutAfterInterval = 2000;


  for (let i = 1; i <= sliderCount; i++) {
    // slider box element
    const sliderBox = document.querySelector(`.slider-${i}`);

    // each slide
    let slides = document.querySelectorAll(`.slider-${i} .slide`);

    // amount of displacement each time
    const displacement = +sliderBox.dataset.displacement;

    // initial displacement of the first slide
    const initialDisplacement = +sliderBox.dataset.initialDisplacement;

    const isDragable = sliderBox.dataset.dragable === "1";

    const autoSlide = sliderBox.dataset.autoSlide === "1";

    const showDots = sliderBox.dataset.showDots === "1";

    const clickableDots = sliderBox.dataset.dotsClickable === "1";

    let slidesCount = slides.length;
    const initialSlideCount = slides.length;
    const maxDisplacement = (initialSlideCount * displacement) + initialDisplacement;
    const minDisplacement = -displacement + initialDisplacement;

    // array of translation values to maintain the translations
    for (let k = 0; k < slidesCount; k++) translateArrs[i - 1][k] = (k * displacement) + initialDisplacement;

    // box for the dots
    const dotBox = document.querySelector(`.dots-${i}`);
    let dots = [];

    // creating and adding dots to the dot box
    if (showDots) {
      for (let j = 0; j < slidesCount; j++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dotBox.appendChild(dot);
      }

      // capturing the dots as element
      dots = document.querySelectorAll(`.dots-${i} .dot`);
    }

    let height = -1;

    // providing the initial translation to each slide
    slides.forEach((el, idx) => {
      // providing height to the slider box according the slide
      const tempHeight = parseFloat(window.getComputedStyle(el).height);
      height = tempHeight > height ? tempHeight : height;
      updateTranslationNDotClass(el, translateArrs, dots, idx, i, 0, initialSlideCount);
      el.className = `slide-${idx} ` + el.className;
      if (idx === initialSlideCount - 1) {
        cloneAddTranslate(el, minDisplacement)
        translateArrs[i - 1].push(minDisplacement);
      }
    });

    sliderBox.style.height = height + "px";
    if (i == 2) arrowBox2.style.height = height + "px";

    slides = document.querySelectorAll(`.slider-${i} .slide`);
    slidesCount = slides.length;

    window.addEventListener("resize", () => {
      let height = -1;
      slides.forEach(el => {
        const tempHeight = parseFloat(window.getComputedStyle(el).height);
        height = tempHeight > height ? tempHeight : height;
        sliderBox.style.height = height;
      });
      sliderBox.style.height = height + "px";
      if (i == 2) arrowBox2.style.height = height + "px";
    })

    const removeExtraSlide = () => {

      let elToRemoveIdx = [];

      for (let idx = 0; idx < slidesCount; idx++) {
        const val = translateArrs[i - 1][idx];
        if (val >= maxDisplacement || val < minDisplacement) {
          elToRemoveIdx.push(idx);
        }
      }

      removeSlides(elToRemoveIdx, slides);

      slides = document.querySelectorAll(`.slider-${i} .slide`);
      const arr = [];
      let count = 0;
      translateArrs[i - 1].forEach((el, idx) => {
        if (!elToRemoveIdx.includes(idx)) arr[count++] = el;
      })
      slidesCount = slides.length;

      slides.forEach(el => {
        el.style.transitionDuration = animationDuration;
      })

      translateArrs[i - 1] = arr;

    };

    const intervalFn = () => {
      removeExtraSlide();
      let addingIdx = -1;

      // first translation each slide by 100% to the left
      for (let idx = 0; idx < slidesCount; idx++) {
        if (translateArrs[i - 1][idx] === initialDisplacement) {
          addingIdx = idx;
          break;
        }
      }

      if (addingIdx !== -1) cloneAddTranslate(slides[addingIdx], maxDisplacement);

      slides = document.querySelectorAll(`.slider-${i} .slide`);
      translateArrs[i - 1].splice(addingIdx + 1, 0, maxDisplacement);
      slidesCount = slides.length;

      const currentDotIdx = +slides[addingIdx].classList[0].split("-").at(-1);
      const nextDotIdx = currentDotIdx === initialSlideCount - 1 ? 0 : currentDotIdx + 1;

      setTimeout(() => {
        // first translation each slide by 100% to the left
        slides.forEach((el, idx) => {
          translateArrs[i - 1][idx] -= displacement;
          updateTranslationNDotClass(el, translateArrs, dots, idx, i, nextDotIdx, initialSlideCount);
          el.style.transitionDuration = animationDuration;
        });

      }, durationOfTimeoutAfterInterval)
    };


    let intervalId = 0;
    if (autoSlide)
      intervalId = setInterval(intervalFn, intervalDurationMs);


    dots.forEach((el, idx) => {
      el.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        if (!clickableDots) return;

        clearInterval(intervalId);

        removeExtraSlide();

        const nxtDotIdx = idx;

        let currentSlidePosition = 0, currentDotIdx = 0, maxTranslatedSlideIdx = 0;

        // Calculate positions and indices
        slides.forEach((slide, slideIdx) => {
          const slideActualIdx = +slide.classList[0].split("-").at(-1);

          const translation = translateArrs[i - 1][slideIdx];

          if (translation === initialDisplacement) {
            currentDotIdx = slideActualIdx;
          } else if (translation !== minDisplacement && slideActualIdx === nxtDotIdx) {
            currentSlidePosition = translation;
          } else if (translation === maxDisplacement - displacement) {
            maxTranslatedSlideIdx = slideActualIdx;
          }
        });

        const arr = [];
        let arrCurrIdx = 0;

        slides.forEach((slide, idx) => {
          arr[arrCurrIdx] = translateArrs[i - 1][idx];
          slide.style.transform = `translate(${arr[arrCurrIdx++]}%, 0)`;

          if (translateArrs[i - 1][idx] !== minDisplacement) {
            cloneAddTranslate(slide, translateArrs[i - 1][idx] + (maxDisplacement - initialDisplacement));
            arr[arrCurrIdx++] = translateArrs[i - 1][idx] + (maxDisplacement - initialDisplacement);
          }
        });

        translateArrs[i - 1] = arr;

        slides = document.querySelectorAll(`.slider-${i} .slide`);
        slidesCount = slides.length;

        setTimeout(() => {
          slides.forEach((el, idx) => {
            translateArrs[i - 1][idx] -= (currentSlidePosition - initialDisplacement);
            el.style.transform = `translate(${arr[idx]}%, 0)`;
          });

          dots[currentDotIdx].classList.remove("dot-active");
          dots[nxtDotIdx].classList.add("dot-active");

        }, 100)

        if (autoSlide)
          intervalId = setInterval(intervalFn, intervalDurationMs);

      })
    })

    // events to swipe the silds
    let tempTranslationArr = new Array(slidesCount).fill(0);
    let oldWalkingDistance = 0;
    // adding mousedown to each Slide

    if (isDragable) {
      sliderBox.addEventListener("mousedown", (e) => {
        e.preventDefault();
        [lastZerothIdx, tempTranslationArr, slides, slidesCount] = afterMouseMovesDown(slides, e, intervalId, translateArrs, i, maxDisplacement, minDisplacement, displacement, initialDisplacement);

        // getting the initial position
        initialPos = e.pageX - sliderBox.offsetLeft;
        isMouseDown = true;
      });

      sliderBox.addEventListener("touchstart", (e) => {

        [lastZerothIdx, tempTranslationArr, slides, slidesCount] = afterMouseMovesDown(slides, e, intervalId, translateArrs, i, maxDisplacement, minDisplacement, displacement, initialDisplacement);

        // getting the initial position
        initialPos = e.touches[0].pageX - sliderBox.offsetLeft;
        isMouseDown = true;

      });

      sliderBox.addEventListener("mouseup", (e) => {
        e.preventDefault();
        if (isMouseDown) {
          [isMouseDown, intervalId, oldWalkingDistance] = afterMouseMovesUp(slides, translateArrs, i, oldWalkingDistance, dots, intervalFn, e, displacement, initialDisplacement, autoSlide);
        }

      });

      sliderBox.addEventListener("touchend", (e) => {
        if (isMouseDown) {
          [isMouseDown, intervalId, oldWalkingDistance] = afterMouseMovesUp(slides, translateArrs, i, oldWalkingDistance, dots, intervalFn, e, displacement, initialDisplacement, autoSlide);
        }
      })

      sliderBox.addEventListener("mousemove", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isMouseDown) {
          let movement = e.pageX - sliderBox.offsetLeft;
          const walk = (initialPos - movement);
          const walkInPercent = parseInt(walk / parseInt(window.getComputedStyle(sliderBox).width) * 100);
          tempTranslationArr = tempTranslationArr.map(val => val - walkInPercent + oldWalkingDistance);
          oldWalkingDistance = walkInPercent;
          slides.forEach((val, i) => val.style.transform = `translate(${tempTranslationArr[i]}%, 0)`);
        }
      })

      sliderBox.addEventListener('touchmove', (e) => {
        if (isMouseDown) {
          let movement = e.touches[0].pageX - sliderBox.offsetLeft;
          const walk = (initialPos - movement);
          const walkInPercent = parseInt(walk / parseInt(window.getComputedStyle(sliderBox).width) * 100);
          tempTranslationArr = tempTranslationArr.map(val => val - walkInPercent + oldWalkingDistance);
          oldWalkingDistance = walkInPercent;
          slides.forEach((val, i) => val.style.transform = `translate(${tempTranslationArr[i]}%, 0)`);
        }
      }, { passive: false });

      sliderBox.addEventListener("mouseout", (e) => {
        e.preventDefault();
        if (isMouseDown) {
          [isMouseDown, intervalId, oldWalkingDistance] = afterMouseMovesUp(slides, translateArrs, i, oldWalkingDistance, dots, intervalFn, e, displacement, initialDisplacement, autoSlide);
        }
      })
    }

  }


  function updateTranslationNDotClass(el, translateArrs, dots, idx, i, currentDotIdx, initialSlideCount) {
    el.style.transform = `translate(${translateArrs[i - 1][idx]}%, 0)`;
    if (dots.length > 0) {
      if (idx === currentDotIdx) dots[idx].classList.add("dot-active");
      else if (idx < initialSlideCount) dots[idx].classList.remove("dot-active");
    }
  }


  function afterMouseMovesDown(slides, e, intervalId, translateArrs, i, maxDisplacement, minDisplacement, displacement, initialDisplacement) {
    e.stopPropagation();

    // clearing all the interval and timeouts
    clearInterval(intervalId);


    let lastZerothIdx = null, prevToFirstSlideIdx = null, elToRemoveIdx = [];

    for (let idx = 0; idx < slides.length; idx++) {
      const val = translateArrs[i - 1][idx];

      if (val === maxDisplacement - (2 * displacement)) {
        prevToFirstSlideIdx = idx;
      }

      if (val === initialDisplacement) {
        lastZerothIdx = idx;
      }
      if (val >= maxDisplacement || val < minDisplacement) elToRemoveIdx.push(idx);

    }

    cloneAddTranslate(slides[prevToFirstSlideIdx], minDisplacement - displacement);

    cloneAddTranslate(slides[lastZerothIdx], maxDisplacement);

    removeSlides(elToRemoveIdx, slides);

    slides = document.querySelectorAll(`.slider-${i} .slide`);
    const arr = [];
    let count = 0;
    translateArrs[i - 1].forEach((el, idx) => {

      if (!elToRemoveIdx.includes(idx)) arr[count++] = el;

      if (idx === lastZerothIdx) {
        arr[count++] = maxDisplacement;
      }
      if (idx === prevToFirstSlideIdx) {
        arr[count++] = minDisplacement - displacement;
      }
    })

    slides.forEach(el => {
      el.style.transitionDuration = `0s`;
    })

    const tempTranslationArr = [];

    arr.forEach((val, idx) => {
      tempTranslationArr[idx] = val;
      translateArrs[i - 1][idx] = val
    });

    return [lastZerothIdx, tempTranslationArr, slides, slides.length];
  }


  function afterMouseMovesUp(slides, translateArrs, i, oldWalkingDistance, dots, intervalFn, e, displacement, initialDisplacement, autoSlide) {
    e.stopPropagation();

    let displaceAmount = 0, currentZero = -1, prevZero = -1;

    if (Math.abs(oldWalkingDistance) > 10) {
      displaceAmount = oldWalkingDistance > 0 ? -displacement : displacement;
    }

    slides.forEach((el, idx) => {
      el.style.transitionDuration = animationDuration
      el.style.transform = `translate(${translateArrs[i - 1][idx] + displaceAmount}%, 0)`;
      if (translateArrs[i - 1][idx] === initialDisplacement) prevZero = +el.classList[0].split("-").at(-1);
      translateArrs[i - 1][idx] += displaceAmount;
      if (translateArrs[i - 1][idx] === initialDisplacement) currentZero = +el.classList[0].split("-").at(-1);
    });


    oldWalkingDistance = 0;

    if (dots.length > 0) {
      dots[prevZero].classList.remove("dot-active");
      dots[currentZero].classList.add("dot-active");
    }


    let intervalId = 0;
    if (autoSlide)
      intervalId = setInterval(intervalFn, intervalDurationMs);

    return [false, intervalId, oldWalkingDistance]
  }

  const removeSlides = (elToRemoveIdx = [], slides = []) => {
    if (elToRemoveIdx.length) {
      elToRemoveIdx.forEach(el => {
        const elToRemove = slides[el];
        elToRemove.remove();
      })
    }
  }

})

const cloneAddTranslate = (elToClone, translate) => {
  const cloned = elToClone.cloneNode(true);
  elToClone.insertAdjacentElement('afterend', cloned);
  cloned.style.transform = `translate(${translate}%, 0)`;
}