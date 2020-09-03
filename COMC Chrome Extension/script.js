const goingRates = document.querySelectorAll('.goingRate');
const head = document.querySelector('head');
const body = document.querySelector('body');

/* Returns true if [goingRate] indicates that a user has been outpriced and 
false otherwise. */
function outpriced(goingRate) {
  const aArray = goingRate.querySelectorAll("a");
  if (aArray.length !== 2) {
    return false;
  }
  const userStart = aArray[0].innerText.indexOf('$');
  const userEnd = aArray[0].innerText.indexOf('.') + 2;
  const userPrice =
    parseFloat(aArray[0].innerText.slice(userStart + 1, userEnd + 1));
  const siteStart = aArray[1].innerText.indexOf('$');
  const siteEnd = aArray[1].innerText.indexOf('.') + 2;
  const sitePrice =
    parseFloat(aArray[1].innerText.slice(siteStart + 1, siteEnd + 1));
  if (userPrice > sitePrice) {
    return true;
  }
  return false;
}

/* For each item entry, if that item has not been outpriced then a 
'notOutpriced' class will be added to that item's tr. Otherwise, an 
'outpriced' class will be added to that item's tr. Style is added in the head
of the document to hide all elements with a class of 'notOutpriced'. */
function onlyLeaveOutpriced() {
  goingRates.forEach(goingRate => {
    const tr = goingRate.parentNode.parentNode;
    if (!outpriced(goingRate)) {
      tr.classList.add('notOutpriced');
    } else {
      tr.classList.add('outpriced');
    }
  });
  head.innerHTML +=
    '<style id="hideNotOutpriced"> .notOutpriced {display: none;} </style>';
}

/* If present, the styling that hides all items with a 'notOutpriced' class 
will be removed, which once again displays these items on the page. */
function reset() {
  const style = document.getElementById("hideNotOutpriced");
  style.parentNode.removeChild(style);
}

/* Adds a button and the styling for it to the head of the document. */
function addButton() {
  const buttonDiv = document.createElement('div');
  buttonDiv.textContent = "SHOW OUTPRICED";
  buttonDiv.id = "opButton";
  body.append(buttonDiv);
  head.innerHTML +=
    `<style id="opButtonStyle"> 
      #opButton {
        box-sizing: border-box;
        position: absolute;
        top: 30%;
        left: 10%;
        cursor: pointer;
        font-size: 14px;
        width: 100px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        background-color: #B91F24;
        color: #f5f5f5;
      } 

      #opButton.clicked {
        background-color: #f5f5f5;
        color: #B91F24;
      }
    </style>`;
  const button = document.getElementById("opButton");
  const buttonStyle = document.getElementById("opButtonStyle");
  button.addEventListener('click', () => {
    button.classList.toggle('clicked');
    if (button.classList.contains('clicked')) {
      button.innerText = "SHOW ALL";
      onlyLeaveOutpriced();
    } else {
      button.innerText = "SHOW OUTPRICED";
      reset();
    }
  });
}

// ADDS THE BUTTON
addButton();