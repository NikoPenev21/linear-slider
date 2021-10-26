class MaterialSlider extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('material-slider-template');
    this.attachShadow({ mode: 'open' })
      .appendChild(template.content.cloneNode(true));

    this.width = Number(this.getAttribute('width')) || 300;
    this.min = Number(this.getAttribute('min')) || 0;
    this.max = Number(this.getAttribute('max')) || 100;
    this.step = Number(this.getAttribute('step')) || 10;
    this.value = Number(this.getAttribute('value'));
    this.total = Number || 100;

    this.checkValues();

    this.circle = this.shadowRoot.getElementById('circle');
    this.line = this.shadowRoot.getElementById('line');
    this.progressLine = this.shadowRoot.getElementById('progressLine');
    this.wrapper = this.shadowRoot.getElementById('wrapper');
    this.currentValueLabel = this.shadowRoot.getElementById('currentValue');
    this.minValueLabel = this.shadowRoot.getElementById('minValue');
    this.maxValueLabel = this.shadowRoot.getElementById('maxValue');
    this.wrapper.style.width = `${this.width}px`;
    this.line.style.width = `${this.width}px`;


    if (this.value) {
      var that = this;
      setTimeout(function () {
        that.setPosition();
      }, 20);
    }

    this.bootstrapLabels();
    this.setAriaAttributes();
  }

  connectedCallback() {
    var that = this;
    this.circle.addEventListener('mousedown', this.startSliding);
    this.line.addEventListener('mousedown', this.startSliding);
    this.wrapper.addEventListener('mousedown', this.startSliding);

    this.circle.addEventListener('mousemove', this.slide);
    this.ownerDocument.addEventListener('mousemove', this.slide);

    this.ownerDocument.addEventListener('mouseup', this.stopSliding);
    this.ownerDocument.addEventListener('contextmenu', this.stopSliding);

    this.circle.addEventListener('keydown', function (e) {
      if (e.code === "ArrowLeft" || e.code === "ArrowDown") {
        that.decrementValue();
        that.flashLabel()
      }
      if (e.code === "ArrowRight" || e.code === "ArrowUp") {
        that.incrementValue();
        that.flashLabel()
      }
      if (e.code === "Home") {
        that.setValueToMax();
        that.flashLabel()
      }
      if (e.code === "End") {
        that.setValueToMin();
        that.flashLabel()
      }
    });
  }

  setPosition = (event) => {
    const percent = Math.round((this.value - this.min) * 100 / this.total);
    const initialPosition = Math.round(percent * (this.width) / 100);

    this.progressLine.style.width = `${initialPosition}px`;
    this.circle.style.left = `${initialPosition + this.line.offsetLeft - 10}px`;
  }

  startSliding = (event) => {
    this.isSliding = true;
    this.pinpoint(event);
    this.circle.style.boxShadow = "0 0 0 9px rgba(98, 0, 238, 0.17)";
  }
  stopSliding = () => {
    this.isSliding = false;
    this.shadowRoot.getElementById('circle').setAttribute("aria-valuenow", this.value);
    this.circle.style.boxShadow = "0 0 0 9px rgba(98, 0, 238, 0.11)";
  }
  pinpoint = (event) => {
    this.isSliding = true;
    const position = event.pageX;
    const startPoint = this.progressLine.offsetLeft;
    const endPoint = this.width + this.progressLine.offsetLeft; //here - 20 //15px is circle width, we want this so that circle hits end of line

    if (position >= (startPoint) && position <= (endPoint)) {
      this.calculateCurrentValue(startPoint, position);
      this.setPosition();
    }
  }

  slide = (event) => {
    if (this.isSliding) {
      this.pinpoint(event);
    }
  }

  decrementValue = () => {
    this.value = this.value - this.step;
    if (this.value < this.min) {
      this.value = this.min
    }
    this.setPosition();
    this.updateLabel();
  }

  incrementValue = () => {
    this.value = this.value + this.step;
    if (this.value > this.max) {
      this.value = this.max
    }
    this.setPosition();
    this.updateLabel();
  }

  setValueToMax = () => {
    this.value = this.max;
    this.setPosition();
    this.updateLabel()
  }

  setValueToMin = () => {
    this.value = this.min;
    this.setPosition();
    this.updateLabel()
  }

  checkValues = () => {
    if (this.min > this.max) {
      this.min = this.min ^ this.max;
      this.max = this.min ^ this.max;
      this.min = this.min ^ this.max;
    }

    if (this.value < this.min) {
      this.value = this.min;
    }

    if (this.value > this.max) {
      this.value = this.max;
    }

    if ((this.min || this.min === 0) && this.max) {
      this.total = this.max - this.min;
    }
  }

  calculateCurrentValue = (startPoint, position) => {
    const percent = Math.ceil((position - startPoint) * 100 / (this.width)); //here - 20
    this.value = Math.ceil(this.min + (percent * this.total / 100));
    this.updateLabel();
  }

  bootstrapLabels = () => {
    this.currentValueLabel.innerHTML = this.value;
    this.minValueLabel.innerHTML = this.min;
    this.maxValueLabel.innerHTML = this.max;
  }

  setAriaAttributes = () => {
    this.shadowRoot.getElementById('circle').setAttribute("aria-valuemax", this.max);
    this.shadowRoot.getElementById('circle').setAttribute("aria-valuemin", this.min);
    this.shadowRoot.getElementById('circle').setAttribute("aria-valuenow", this.value);
  }

  updateLabel = () => {
    this.currentValueLabel.innerHTML = this.value;
  }

  flashLabel = () => {
    const label = this.shadowRoot.getElementById('currentValue')
    label.style.opacity = "1"
    setTimeout(function () {
      label.style.opacity = "0"
      label.style.transition = "opacity 0.5s linear"
    }, 1000)
  }

  disconnectedCallback() {
    this.circle.removeEventListener('mousedown', this.startSliding);
    this.circle.removeEventListener('mousemove', this.slide);
    this.ownerDocument.removeEventListener('mouseup', this.stopSliding);
  }
}

window.addEventListener('load', () => {
  customElements.define('material-slider', MaterialSlider);
});
