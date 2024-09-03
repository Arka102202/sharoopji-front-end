
document.body.style.overflow = "Hidden";
document.body.style.pointerEvents = "none";


window.addEventListener('load', function () {

  document.body.style.overflow = "auto";
  document.body.style.pointerEvents = "all";

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////// ----------------------------- Slider Code -----------------------------////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Total number of sliders on the page
  const slidersBoxes = document.querySelectorAll(".silder-box");
  const dotsBoxes = document.querySelectorAll(".dots");
  const sliderCount = slidersBoxes.length;

  // to keep track of the exact translations of all the slides of individual sliders
  let translateArrs = [];

  // 2nd arrow box as this going to be used to provide the height 
  const arrowBox2 = document.querySelector(".arrow-box-2");

  // adding one array for each sliders for each section
  for (let i = 0; i < sliderCount; i++) {
    translateArrs.push([]);
  }

  // to keep track of the mouse movement
  let isMouseDown = false;

  // initial position of the mouse
  let initialPos = 0;

  // different timings for different timing functions
  const animationDuration = ".5s", intervalDurationMs = 5000, durationOfTimeoutAfterInterval = 10;

  const intervalIds = {};

  const addSlidingFacility = (i) => {

    const sliderBox = document.querySelector(`.slider-${i}`);
    // each slide
    let slides = document.querySelectorAll(`.slider-${i} .slide`);
    const leftBtn = document.querySelector(`.left-arr-${i}`);
    const rightBtn = document.querySelector(`.right-arr-${i}`);

    let isButtonDisabled = false;

    // current count
    const currentCount = this.document.querySelector(`.current-${i}`);

    // amount of displacement each time
    let displacement = +sliderBox.dataset.displacement;

    // initial displacement of the first slide
    let initialDisplacement = +sliderBox.dataset.initialDisplacement;

    if (sliderBox.getAttribute("data-initial-displacement-500") && window.innerWidth <= 500) {
      displacement = +sliderBox.getAttribute("data-displacement-500");
      initialDisplacement = +sliderBox.getAttribute("data-initial-displacement-500");
    }

    // show dots 
    let showDots = sliderBox.dataset.showDots === "1";

    if (sliderBox.getAttribute("data-show-dots-500") && window.innerWidth <= 500) {
      showDots = sliderBox.getAttribute("data-show-dots-500") === "1";
    }

    const isDragable = sliderBox.dataset.dragable === "1";

    const autoSlide = sliderBox.dataset.autoSlide === "1";

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
    if (i == 2) {
      arrowBox2.style.height = height + "px";
      if (window.innerWidth <= 500) arrowBox2.style.height = parseFloat(window.getComputedStyle(document.querySelector(".floor-wireframe")).height) - 5 + "px";
    }

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
      if (i == 2) {
        arrowBox2.style.height = height + "px";
        if (window.innerWidth <= 500) arrowBox2.style.height = parseFloat(window.getComputedStyle(document.querySelector(".floor-wireframe")).height) - 5 + "px";
      }
    })

    const removeExtraSlide = () => {

      let elToRemoveIdx = [];
      slides = document.querySelectorAll(`.slider-${i} .slide`);
      slidesCount = slides.length;

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
      if (currentCount) {
        currentCount.innerText = nextDotIdx + 1;
      }
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
    if (autoSlide) {
      intervalId = setInterval(intervalFn, intervalDurationMs);
      intervalIds[`${i}`] = [intervalId, intervalFn];
    } else {
      intervalIds[`${i}`] = [intervalId, intervalFn];
    }


    dots.forEach((el, idx) => {
      el.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        if (!clickableDots) return;

        clearInterval(intervalIds[`${i}`][0]);

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

        if (autoSlide) {
          intervalId = setInterval(intervalFn, intervalDurationMs);
          intervalIds[`${i}`] = [intervalId, intervalFn];
        }

      })
    })


    // add eventListener to btns
    leftBtn && leftBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isButtonDisabled) return;

      isButtonDisabled = true;
      leftBtn.style.cursor = "not-allowed";
      [lastZerothIdx, tempTranslationArr, slides, slidesCount] = afterMouseMovesDown(slides, e, translateArrs, i, maxDisplacement, minDisplacement, displacement, initialDisplacement);

      setTimeout(() => {
        [isMouseDown, intervalId, oldWalkingDistance] = afterMouseMovesUp(slides, translateArrs, i, -100, dots, intervalFn, e, displacement, initialDisplacement, autoSlide, currentCount);
      }, 100);

      setTimeout(() => {
        isButtonDisabled = false;
        leftBtn.style.cursor = "pointer";
      }, 100);

    });

    rightBtn && rightBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isButtonDisabled) return;

      isButtonDisabled = true;
      rightBtn.style.cursor = "not-allowed";
      [lastZerothIdx, tempTranslationArr, slides, slidesCount] = afterMouseMovesDown(slides, e, translateArrs, i, maxDisplacement, minDisplacement, displacement, initialDisplacement);

      setTimeout(() => {
        [isMouseDown, intervalId, oldWalkingDistance] = afterMouseMovesUp(slides, translateArrs, i, +100, dots, intervalFn, e, displacement, initialDisplacement, autoSlide, currentCount);
      }, 100);

      setTimeout(() => {
        isButtonDisabled = false;
        rightBtn.style.cursor = "pointer";
      }, 100);

    })

    // events to swipe the silds
    let tempTranslationArr = new Array(slidesCount).fill(0);
    let oldWalkingDistance = 0;
    // adding mousedown to each Slide

    if (isDragable) {
      sliderBox.addEventListener("mousedown", (e) => {
        e.preventDefault();
        [lastZerothIdx, tempTranslationArr, slides, slidesCount] = afterMouseMovesDown(slides, e, translateArrs, i, maxDisplacement, minDisplacement, displacement, initialDisplacement);

        // getting the initial position
        initialPos = e.pageX - sliderBox.offsetLeft;
        isMouseDown = true;
      });

      sliderBox.addEventListener("touchstart", (e) => {

        [lastZerothIdx, tempTranslationArr, slides, slidesCount] = afterMouseMovesDown(slides, e, translateArrs, i, maxDisplacement, minDisplacement, displacement, initialDisplacement);

        // getting the initial position
        initialPos = e.touches[0].pageX - sliderBox.offsetLeft;
        isMouseDown = true;

      });

      sliderBox.addEventListener("mouseup", (e) => {
        e.preventDefault();
        if (isMouseDown) {
          [isMouseDown, intervalId, oldWalkingDistance] = afterMouseMovesUp(slides, translateArrs, i, oldWalkingDistance, dots, intervalFn, e, displacement, initialDisplacement, autoSlide, currentCount);
        }

      });

      sliderBox.addEventListener("touchend", (e) => {
        if (isMouseDown) {
          [isMouseDown, intervalId, oldWalkingDistance] = afterMouseMovesUp(slides, translateArrs, i, oldWalkingDistance, dots, intervalFn, e, displacement, initialDisplacement, autoSlide, currentCount);
        }
      })

      sliderBox.addEventListener("mousemove", (e) => {
        e.preventDefault();
        // e.stopPropagation();
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
          [isMouseDown, intervalId, oldWalkingDistance] = afterMouseMovesUp(slides, translateArrs, i, oldWalkingDistance, dots, intervalFn, e, displacement, initialDisplacement, autoSlide, currentCount);
        }
      })
    }

  }

  for (let i = 1; i <= sliderCount; i++) {
    addSlidingFacility(i);
  }

  function updateTranslationNDotClass(el, translateArrs, dots, idx, i, currentDotIdx, initialSlideCount) {
    el.style.transform = `translate(${translateArrs[i - 1][idx]}%, 0)`;
    if (dots.length > 0) {
      if (idx === currentDotIdx) dots[idx].classList.add("dot-active");
      else if (idx < initialSlideCount) dots[idx].classList.remove("dot-active");
    }
  }


  function afterMouseMovesDown(slides, e, translateArrs, i, maxDisplacement, minDisplacement, displacement, initialDisplacement) {
    e.stopPropagation();


    // clearing all the interval and timeouts
    clearInterval(intervalIds[`${i}`][0]);

    slides = document.querySelectorAll(`.slider-${i} .slide`);

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


  function afterMouseMovesUp(slides, translateArrs, i, oldWalkingDistance, dots, intervalFn, e, displacement, initialDisplacement, autoSlide, currentCount = null) {
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

    if (currentCount) {
      currentCount.innerText = currentZero + 1;
    }

    let intervalId = 0;
    if (autoSlide) {
      intervalId = setInterval(intervalFn, intervalDurationMs);
      intervalIds[`${i}`] = [intervalId, intervalFn];
    }

    return [false, intervalId, oldWalkingDistance]
  }



  // ///////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////// gallery tab ////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////


  const tabs = this.document.querySelectorAll(".tab");

  const toggleIdx = [];

  tabs.forEach((el, idx) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();

      //   if (el.classList.contains("tab-right")) return;

      const isActive = el.classList.contains("tab-active");

      if (isActive) return;

      tabs.forEach(el => el.classList.toggle("tab-active"));
      let height = -1;
      let activeBoxIdx = -1;
      slidersBoxes.forEach((el, i) => {
        const classList = el.classList;

        if (classList.contains(`tabbed`)) {
          if (toggleIdx.length === 2) {
            toggleIdx.pop();
            toggleIdx.pop();
          }
          toggleIdx.push(i);
          let slides = document.querySelectorAll(`.slider-${i + 1} .slide`);
          if (classList.contains("hide")) {
            activeBoxIdx = i + 1;
          }
          const tempHeight = parseFloat(window.getComputedStyle(slides[0]).height);
          height = tempHeight > height ? tempHeight : height;
        }
      })
      document.querySelector(`.slider-${activeBoxIdx}`).style.height = height + "px";
      document.querySelector(`.total-${activeBoxIdx}`).innerText = `/ ${activeBoxIdx === 3 ? 3 : 4}`;

      // remove the interval reset the position and restart the interval
      clearInterval(intervalIds[activeBoxIdx][0]);

      // resetting the positions:

      const sliderBox = document.querySelector(`.slider-${activeBoxIdx}`);
      // each slide
      let slides = document.querySelectorAll(`.slider-${activeBoxIdx} .slide`);

      const removeIdx = [];
      let tempIdx = -1;

      for (let k = 0; k < slides.length; k++) {
        const actualIdx = +slides[k].classList[0].split("-").at(-1);
        if (tempIdx !== actualIdx) tempIdx = actualIdx;
        else {
          removeIdx.push(k);
        }
      }

      removeSlides(removeIdx, slides);

      slides = document.querySelectorAll(`.slider-${activeBoxIdx} .slide`);

      // box for the dots
      const dots = document.querySelectorAll(`.dots-${activeBoxIdx} .dot`);

      const initialSlideCount = activeBoxIdx === 3 ? 3 : 4;

      // amount of displacement each time
      let displacement = +sliderBox.dataset.displacement;

      // initial displacement of the first slide
      let initialDisplacement = +sliderBox.dataset.initialDisplacement;

      if (sliderBox.getAttribute("data-initial-displacement-500") && window.innerWidth <= 500) {
        displacement = +sliderBox.getAttribute("data-displacement-500");
        initialDisplacement = +sliderBox.getAttribute("data-initial-displacement-500");
      }

      let slidesCount = slides.length;
      const minDisplacement = -displacement + initialDisplacement;

      const arrLength = translateArrs[activeBoxIdx - 1].length;

      for (let e = 0; e < arrLength; e++) translateArrs[activeBoxIdx - 1].pop();

      // array of translation values to maintain the translations
      for (let k = 0; k < slidesCount; k++) {
        translateArrs[activeBoxIdx - 1][k] = (k * displacement) + initialDisplacement;
      }
      // providing the initial translation to each slide
      slides.forEach((el, idx) => {
        // providing height to the slider box according the slide
        updateTranslationNDotClass(el, translateArrs, dots, idx, activeBoxIdx, 0, initialSlideCount);
        if (idx === initialSlideCount - 1) {
          cloneAddTranslate(el, minDisplacement)
          translateArrs[activeBoxIdx - 1].push(minDisplacement);
        }
      });

      this.document.querySelector(`.current-${activeBoxIdx}`).innerText = 1;

      this.setTimeout(() => {
        toggleIdx.forEach(el => {
          slidersBoxes[el].classList.toggle("hide");
          dotsBoxes[el].classList.toggle("hide");
        });
        // restart the interval
        intervalIds[activeBoxIdx][0] = this.setInterval(intervalIds[activeBoxIdx][1], intervalDurationMs);
      }, 10)


    })
  })



  // ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////// videos //////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////


  const vdoBoxes = document.querySelectorAll(".vdo-box");
  const videos = [];
  const vdoTransLationArr = [];
  const leftBtn = document.querySelector(".amenity-sec .left-arr");
  const rightBtn = document.querySelector(".amenity-sec .right-arr");


  vdoBoxes.forEach(el => {
    el.style.height = window.getComputedStyle(el.querySelector("img")).height;

    videos.push(el.querySelectorAll("img"))
  })

  window.addEventListener("resize", () => {
    vdoBoxes.forEach(el => {
      el.style.height = window.getComputedStyle(el.querySelector("img")).height;
    })
  })


  videos.forEach(box => {
    const tempArr = [];
    box.forEach((el, idx) => {
      el.style.transform = `translateX(${idx * 100}%)`;
      tempArr.push(idx * 100);
    });
    vdoTransLationArr.push(tempArr);
  })


  leftBtn.addEventListener("click", () => {

    vdoTransLationArr.forEach((arr, i) => {

      for (let j = 0; j < arr.length; j++) {
        const el = arr[j];
        if (el === (arr.length - 1) * -100) break;
        arr[j] -= 100;
        videos[i][j].style.transform = `translateX(${arr[j]}%)`;
      }
    })


  })

  rightBtn.addEventListener("click", () => {

    vdoTransLationArr.forEach((arr, i) => {

      for (let j = 0; j < arr.length; j++) {
        const el = arr[j];
        if (j === 0 && el === 0) break;
        arr[j] += 100;
        videos[i][j].style.transform = `translateX(${arr[j]}%)`;
      }
    })


  })




  // ///////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////// for the map ////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////

  const mapBox = document.querySelector(".map-box");
  const map = document.querySelector(".map");
  const zoomOut = document.querySelector(".zoom-out");
  const zoomIn = document.querySelector(".zoom-in");
  const mapBoxWidth = mapBox.getBoundingClientRect().width;
  const mapBoxHeight = mapBox.getBoundingClientRect().height;
  let zoomAmount = 1, extension = 0;
  let isMouseDown2 = false, startX = 0, totalX = 0, walkX = 0;
  let startY = 0, totalY = 0, walkY = 0;
  let max = { x: mapBoxWidth * extension, y: mapBoxHeight * extension };

  mapBox.style.width = mapBoxWidth + "px";
  mapBox.style.height = mapBoxHeight + "px";

  map.style.width = mapBoxWidth * zoomAmount + "px";
  map.style.height = mapBoxHeight * zoomAmount + "px";

  zoomIn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (zoomAmount >= 4) return;
    zoomAmount += 1;
    extension += .5;

    map.style.width = mapBoxWidth * zoomAmount + "px";
    map.style.height = mapBoxHeight * zoomAmount + "px";

    max.x = mapBoxWidth * extension;
    max.y = mapBoxHeight * extension;

  })

  zoomOut.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (zoomAmount <= 1) return;
    zoomAmount -= 1;
    extension -= .5;

    map.style.width = mapBoxWidth * zoomAmount + "px";
    map.style.height = mapBoxHeight * zoomAmount + "px";

    max.x = mapBoxWidth * extension;
    max.y = mapBoxHeight * extension;

    if (zoomAmount === 1) {
      totalX = totalY = walkX = walkY = 0;
      map.style.transform = `translate(0%, 0%)`;
    }

  })


  mapBox.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isMouseDown2 = true;
    startX = e.pageX - mapBox.offsetLeft;
    startY = e.pageY - mapBox.offsetTop;
    mapBox.style.cursor = "grab";
  });

  mapBox.addEventListener("mouseup", (e) => {
    e.preventDefault();
    mouseMoveUpFunc2();
    mapBox.style.cursor = "auto";
  });

  mapBox.addEventListener("mouseleave", (e) => {
    e.preventDefault();
    mouseMoveUpFunc2();
  });

  mapBox.addEventListener("mousemove", (e) => {
    e.preventDefault();
    if (!isMouseDown2) return;
    
    const x = e.pageX - mapBox.offsetLeft;
    const y = e.pageY - mapBox.offsetTop;
    walkX = x - startX;
    walkY = y - startY;
  
    // Clamp the values to prevent moving beyond boundaries
    const newTotalX = totalX + walkX;
    const newTotalY = totalY + walkY;
  
    const clampedX = Math.max(-max.x, Math.min(max.x, newTotalX));
    const clampedY = Math.max(-max.y, Math.min(max.y, newTotalY));
  
    map.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  });

  mapBox.addEventListener("touchstart", (e) => {
    // e.preventDefault();
    isMouseDown2 = true;
    startX = e.touches[0].pageX - mapBox.offsetLeft;
    startY = e.touches[0].pageY - mapBox.offsetTop;
    if (zoomAmount !== 1)
      document.body.style.overflow = "hidden";
  });

  mapBox.addEventListener("touchend", (e) => {
    // e.preventDefault();
    mouseMoveUpFunc2();
    document.body.style.overflow = "auto";
  });

  mapBox.addEventListener("touchmove", (e) => {
    if (!isMouseDown2) return;
    mapBox.style.cursor = "grab";
    const x = e.touches[0].pageX - mapBox.offsetLeft;
    const y = e.touches[0].pageY - mapBox.offsetTop;
    walkX = x - startX;
    walkY = y - startY;
  
    // Clamp the values to prevent moving beyond boundaries
    const newTotalX = totalX + walkX;
    const newTotalY = totalY + walkY;
  
    const clampedX = Math.max(-max.x, Math.min(max.x, newTotalX));
    const clampedY = Math.max(-max.y, Math.min(max.y, newTotalY));
  
    map.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  });





  const mouseMoveUpFunc2 = () => {
  isMouseDown2 = false;
  // Update totalX and totalY while clamping the values
  totalX = Math.max(-max.x, Math.min(max.x, totalX + walkX));
  totalY = Math.max(-max.y, Math.min(max.y, totalY + walkY));
  
  walkX = 0;
  walkY = 0;
};




  // ///////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////// video play //////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////


  const playBtn = document.querySelector(".play-btn");
  const iframe = document.querySelector("iframe");
  const form = this.document.querySelector(".form-box");
  const formOpenBtn = document.querySelector(".form-open");
  const subBtn = this.document.querySelector(".sub-btn");
  const thankBox = document.querySelector(".thanyou-msg-box");

  playBtn.addEventListener("click", () => {
    document.querySelector(".modal-box").classList.remove("hide");
    this.document.body.style.overflow = "hidden";
    form.style.display = "none";
    iframe.style.display = "block";
    thankBox.style.display = "none";
  })

  formOpenBtn.addEventListener("click", () => {
    document.querySelector(".modal-box").classList.remove("hide");
    this.document.body.style.overflow = "hidden";
    form.style.display = "flex";
    iframe.style.display = "none";
    thankBox.style.display = "none";
    this.document.querySelector(".modal-inner-box").style.width = "320px";
  })

  const modalCLoseBtn = this.document.querySelector(".modal-close-btn");

  modalCLoseBtn.addEventListener("click", () => {
    document.querySelector(".modal-box").classList.add("hide");
    if (thankBox.style.display === "block") this.window.location.href = "#";
    form.style.display = "none";
    iframe.style.display = "none";
    thankBox.style.display = "none";
    this.document.body.style.overflow = "auto";
    iframe.src = iframe.src;
  })


  // form submit

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    subBtn.disabled = true;
    subBtn.innerText = "Submitting .....";

    form.submit();
  })


  // ///////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////// menu tabs //////////////////////
  // //////////////////////////////////////////////////////////////////////////

  const menuBtns = document.querySelectorAll(".nav-tab-box");
  let clicked = "";

  menuBtns.forEach((el, idx) => {
    el.addEventListener("click", () => {

      const elemToReach = el.dataset.id;
      clicked = "elemToReach";
      menuBtns.forEach(el => el.querySelector(".nav-tab-line").style.width = "0%");
      el.querySelector(".nav-tab-line").style.width = "120%";

      if (elemToReach === "CONTACT") return;

      this.document.getElementById(elemToReach).scrollIntoView({ behavior: "smooth" });

    });

    el.addEventListener("mouseover", () => {
      el.querySelector(".nav-tab-line").style.width = "120%";
    })
    el.addEventListener("mouseout", () => {
      if (clicked === el.dataset.id) return;
      el.querySelector(".nav-tab-line").style.width = "0%";
    })
  })

  // Select all sections to observe
  const sections = document.querySelectorAll(".sec");

  // Define the observer options
  const observerOptions = {
    threshold: 0.5 // Trigger when 80% of the element is visible
  };

  // Define the callback function
  const observerCallback = (entries) => {
    entries.forEach(entry => {
      // Check if the entry is intersecting and the intersection ratio is at least 80%
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const tabEl = entry.target.id;
        if (tabEl === "CONTACT") return;
        clicked = tabEl;

        // Reset all menu button line widths
        menuBtns.forEach(el => el.querySelector(".nav-tab-line").style.width = "0%");

        // Set the current target's nav-tab-line to 120% width
        this.document.querySelector(`.${tabEl} .nav-tab-line`).style.width = "120%";

      } else {
        const tabEl = entry.target.id;
        // Set the nav-tab-line width to 0% when not at least 80% visible
        this.document.querySelector(`.${tabEl} .nav-tab-line`).style.width = "0%";
      }
    });
  };

  // Create a single Intersection Observer instance
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Start observing each section
  sections.forEach((el) => observer.observe(el));

  // when clicked on the contact tab
  this.document.querySelector(".CONTACT").addEventListener("click", () => {
    document.querySelector(".modal-box").classList.remove("hide");
    this.document.body.style.overflow = "hidden";
    form.style.display = "flex";
    iframe.style.display = "none";
    thankBox.style.display = "none";
    this.document.querySelector(".modal-inner-box").style.width = "320px";
  })

  ////////////////////////// hide menu on scroll

  let lastScrollTop = 0, visible = false; // Keeps track of the last scroll position
  const element = document.querySelector('header'); // Replace with your element's ID

  window.addEventListener('scroll', function () {
    let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollTop > lastScrollTop) {
      // Scrolling down
      element.style.transform = 'translateY(-100%)'; // Hide element by moving it up
      visible = false;
    } else {
      // Scrolling up
      element.style.transform = 'translateY(0)'; // Show element by resetting position
      visible = true;
    }

    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // For Mobile or negative scroll

  });

  const showThreshold = 10; // Distance from the top of the viewport in pixels

  // Hide the element initially
  // element.style.transform = 'translateY(-100%)'; // Start with the element off-screen

  window.addEventListener('mousemove', function (event) {
    const mouseY = event.clientY;

    if (mouseY < showThreshold) {
      // Mouse is near the top of the screen
      element.style.transform = 'translateY(0)'; // Show the element
    } else if (mouseY >= 100) {
      // Mouse is not near the top of the screen
      element.style.transform = 'translateY(-100%)'; // Hide the element
    }
  });


})


// out side
const cloneAddTranslate = (elToClone, translate) => {
  const cloned = elToClone.cloneNode(true);
  elToClone.insertAdjacentElement('afterend', cloned);
  cloned.style.transform = `translate(${translate}%, 0)`;
}

const removeSlides = (elToRemoveIdx = [], slides = []) => {
  if (elToRemoveIdx.length) {
    elToRemoveIdx.forEach(el => {
      const elToRemove = slides[el];
      elToRemove.remove();
    })
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Get the full URL of the current page
  const url = window.location.href;

  // Create a URL object
  const urlObj = new URL(url);

  // Get the query parameters
  const params = new URLSearchParams(urlObj.search);

  // Example: Get a specific query parameter
  const value = params.get('submitId'); // Replace 'yourParamName' with the actual parameter name

  const iframe = document.querySelector("iframe");
  const form = this.document.querySelector(".form-box");;
  const thankBox = document.querySelector(".thanyou-msg-box");

  if (value) {
    document.querySelector(".modal-box").classList.remove("hide");
    this.document.body.style.overflow = "hidden";
    form.style.display = "none";
    iframe.style.display = "none";
    thankBox.style.display = "block";
  }
})