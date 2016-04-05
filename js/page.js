"use strict";

class Page {
  constructor(options) {
    this._el = options.element;
    this._cards = cards;
    this._base_el = this._el.querySelector('[data-component="base"]');
    this._base_el.addEventListener("click", this._showBaseCard.bind(this));
    this._base2_el = this._el.querySelector('[data-component="base-2"]');
    this._base = [];
    this._base2 = [];

    this._initCards();
  }
  newGame() {
    this._base = [];
    this._base2 = [];
    this._base2_el.innerHTML = "";
    this._base2_el.classList.add("empty");
    for(let i = 1; i < 8; i++) {
      this._el.querySelector('[data-component="stack-'+i+'"]').innerHTML = "";
      if(i < 5) {
        this._el.querySelector('[data-component="home-'+i+'"]').innerHTML = "";
        this._el.querySelector('[data-component="home-'+i+'"]').classList.add("empty");
      }
    }

    this._initCards();
  }
  _initCards() {
    this._base_el.innerHTML = "<img src='img/cards/card_back.png' draggable='false'>";
    //randomize deck
    for(let i = 0; i < 52; i++) {
      let rand;
      do {
        rand = Math.floor(Math.random() * 52);
      } while(this._base.indexOf(rand) != -1);
      this._base.push(rand);
    }
    //place cards
    for(let i = 1; i < 8; i++) {
      let stack = this._el.querySelector('[data-component="stack-'+i+'"]');
      for(let j = 0; j < i; j++) {
        if(j == i-1) {
          stack.innerHTML += "<img id='"+this._base[0]+"' src='"+this._cards[this._base.shift()].imageURL+"' style='top: "+(j*20-j*160)+"px' ondragstart='page.drag(event)'>";
        } else {
          stack.innerHTML += "<img id='"+this._base.shift()+"' src='img/cards/card_back.png' style='top: "+(j*20-j*160)+"px' draggable='false'>";
        }
      }
    }
  }
  _showBaseCard() {
    console.log("base: "+this._base);
    console.log("base2: "+this._base2);
    if(this._base.length > 0) {
      this._base2.unshift(this._base.shift());
      if (this._base.length == 0) this._base_el.innerHTML = "";
      this._base2_el.innerHTML = "<img id='" + this._base2[0] + "' src='" + this._cards[this._base2[0]].imageURL + "' ondragstart='page.drag(event)'>";
      this._base2_el.classList.remove("empty");
      if (this._base.length == 0) this._base_el.classList.add("empty");
    } else {
      this._base = this._base2.reverse();
      this._base2 = [];
      this._base2_el.innerHTML = "";
      this._base2_el.classList.add("empty");
      this._base_el.classList.remove("empty");
      this._base_el.innerHTML = "<img src='img/cards/card_back.png' draggable='false'>";
    }
  }
  drag(ev) {
    var s = window.getSelection();
    s.modify('extend','forward', 'word');
    //ev.target.style.opacity = '0.1';
    ev.dataTransfer.setData("target_id", ev.target.id);
    ev.dataTransfer.setData("target_component", ev.target.parentNode.dataset.component);
  }
  allowDrop(ev) {
    ev.preventDefault();
  }
  drop(ev) {
    ev.preventDefault();
    let target_id = ev.dataTransfer.getData("target_id");
    let target_component = ev.dataTransfer.getData("target_component");
    let img = document.getElementById(target_id);
    let node;
    let target_card_weight = this._cards[target_id].weight;
    let drop_card_weight = 15;
    let target_card_color = this._cards[target_id].color == "diamonds" || this._cards[target_id].color == "hearts" ? "red" : "black";
    let drop_card_color;
    if(ev.target.tagName == "IMG") node = ev.target.parentNode;
    else node = ev.target;
    if(node.hasChildNodes()) {
      drop_card_weight = this._cards[node.childNodes[node.childNodes.length-1].id].weight;
      drop_card_color = this._cards[node.childNodes[node.childNodes.length-1].id].color == "diamonds" || this._cards[node.childNodes[node.childNodes.length-1].id].color == "hearts" ? "red" : "black";
    }

    if(node.dataset.component == "home-1" || node.dataset.component == "home-2" || node.dataset.component == "home-3" || node.dataset.component == "home-4") {
      if(node.hasChildNodes()) {
        if((target_card_weight == 2 && drop_card_weight == 14 || drop_card_weight == target_card_weight-1) && this._cards[node.childNodes[node.childNodes.length-1].id].color == this._cards[target_id].color) {
          node.innerHTML = "";
          img.style.top = "";
          img.setAttribute("draggable", "false");
          node.appendChild(img);
          this._shiftBase2(target_component);
        }
      } else if(target_card_weight == 14) {
        img.style.top = "";
        img.setAttribute("draggable", "false");
        node.appendChild(img);
        node.classList.remove("empty");
        this._shiftBase2(target_component);
      }
      this._checkWinCondition();
    } else if(target_card_weight == drop_card_weight - 1 && target_card_color != drop_card_color) {
      img.style.top = node.childNodes.length*20-node.childNodes.length*160+"px";
      node.childNodes[node.childNodes.length - 1].setAttribute("draggable", "false");
      node.appendChild(img);
      this._shiftBase2(target_component);
    } else if(!node.hasChildNodes() && target_card_weight == 13) {
      img.style.top = "";
      node.appendChild(img);
      node.classList.remove("empty");
      this._shiftBase2(target_component);
    }
    //open card
    target_component = document.querySelector('[data-component="'+target_component+'"]');
    if(target_component.hasChildNodes()) {
      node = target_component.childNodes[target_component.childNodes.length - 1];
      node.setAttribute("src", this._cards[node.id].imageURL);
      node.setAttribute("ondragstart", "page.drag(event)");
      node.removeAttribute("draggable");
    } else {
      target_component.classList.add("empty");
    }
  }
  _shiftBase2(target_component) {
    if(target_component == "base-2") {
      this._base2.shift();
      if(this._base2.length == 0) this._base2_el.classList.add("empty");
      else this._base2_el.innerHTML = "<img id='"+this._base2[0]+"' src='"+this._cards[this._base2[0]].imageURL+"' ondragstart='page.drag(event)'>";
    }
  }
  _checkWinCondition() {
    if(document.querySelector("[data-component='home-1']").childElementCount == 13 &&
      document.querySelector("[data-component='home-2']").childElementCount == 13 &&
      document.querySelector("[data-component='home-3']").childElementCount == 13 &&
      document.querySelector("[data-component='home-4']").childElementCount == 13) {
      $("#myModal").modal('show');
    }
  }
}

var cards = [
  {
    "id": 0,
    "color": "diamonds",
    "weight": 2,
    "imageURL": "img/cards/2_diamonds.png"
  },
  {
    "id": 1,
    "color": "diamonds",
    "weight": 3,
    "imageURL": "img/cards/3_diamonds.png"
  },
  {
    "id": 2,
    "color": "diamonds",
    "weight": 4,
    "imageURL": "img/cards/4_diamonds.png"
  },
  {
    "id": 3,
    "color": "diamonds",
    "weight": 5,
    "imageURL": "img/cards/5_diamonds.png"
  },
  {
    "id": 4,
    "color": "diamonds",
    "weight": 6,
    "imageURL": "img/cards/6_diamonds.png"
  },
  {
    "id": 5,
    "color": "diamonds",
    "weight": 7,
    "imageURL": "img/cards/7_diamonds.png"
  },
  {
    "id": 6,
    "color": "diamonds",
    "weight": 8,
    "imageURL": "img/cards/8_diamonds.png"
  },
  {
    "id": 7,
    "color": "diamonds",
    "weight": 9,
    "imageURL": "img/cards/9_diamonds.png"
  },
  {
    "id": 8,
    "color": "diamonds",
    "weight": 10,
    "imageURL": "img/cards/10_diamonds.png"
  },
  {
    "id": 9,
    "color": "diamonds",
    "weight": 11,
    "imageURL": "img/cards/jack_diamonds.png"
  },
  {
    "id": 10,
    "color": "diamonds",
    "weight": 12,
    "imageURL": "img/cards/queen_diamonds.png"
  },
  {
    "id": 11,
    "color": "diamonds",
    "weight": 13,
    "imageURL": "img/cards/king_diamonds.png"
  },
  {
    "id": 12,
    "color": "diamonds",
    "weight": 14,
    "imageURL": "img/cards/ace_diamonds.png"
  },

  {
    "id": 13,
    "color": "hearts",
    "weight": 2,
    "imageURL": "img/cards/2_hearts.png"
  },
  {
    "id": 14,
    "color": "hearts",
    "weight": 3,
    "imageURL": "img/cards/3_hearts.png"
  },
  {
    "id": 15,
    "color": "hearts",
    "weight": 4,
    "imageURL": "img/cards/4_hearts.png"
  },
  {
    "id": 16,
    "color": "hearts",
    "weight": 5,
    "imageURL": "img/cards/5_hearts.png"
  },
  {
    "id": 17,
    "color": "hearts",
    "weight": 6,
    "imageURL": "img/cards/6_hearts.png"
  },
  {
    "id": 18,
    "color": "hearts",
    "weight": 7,
    "imageURL": "img/cards/7_hearts.png"
  },
  {
    "id": 19,
    "color": "hearts",
    "weight": 8,
    "imageURL": "img/cards/8_hearts.png"
  },
  {
    "id": 20,
    "color": "hearts",
    "weight": 9,
    "imageURL": "img/cards/9_hearts.png"
  },
  {
    "id": 21,
    "color": "hearts",
    "weight": 10,
    "imageURL": "img/cards/10_hearts.png"
  },
  {
    "id": 22,
    "color": "hearts",
    "weight": 11,
    "imageURL": "img/cards/jack_hearts.png"
  },
  {
    "id": 23,
    "color": "hearts",
    "weight": 12,
    "imageURL": "img/cards/queen_hearts.png"
  },
  {
    "id": 24,
    "color": "hearts",
    "weight": 13,
    "imageURL": "img/cards/king_hearts.png"
  },
  {
    "id": 25,
    "color": "hearts",
    "weight": 14,
    "imageURL": "img/cards/ace_hearts.png"
  },

  {
    "id": 26,
    "color": "clubs",
    "weight": 2,
    "imageURL": "img/cards/2_clubs.png"
  },
  {
    "id": 27,
    "color": "clubs",
    "weight": 3,
    "imageURL": "img/cards/3_clubs.png"
  },
  {
    "id": 28,
    "color": "clubs",
    "weight": 4,
    "imageURL": "img/cards/4_clubs.png"
  },
  {
    "id": 29,
    "color": "clubs",
    "weight": 5,
    "imageURL": "img/cards/5_clubs.png"
  },
  {
    "id": 30,
    "color": "clubs",
    "weight": 6,
    "imageURL": "img/cards/6_clubs.png"
  },
  {
    "id": 31,
    "color": "clubs",
    "weight": 7,
    "imageURL": "img/cards/7_clubs.png"
  },
  {
    "id": 32,
    "color": "clubs",
    "weight": 8,
    "imageURL": "img/cards/8_clubs.png"
  },
  {
    "id": 33,
    "color": "clubs",
    "weight": 9,
    "imageURL": "img/cards/9_clubs.png"
  },
  {
    "id": 34,
    "color": "clubs",
    "weight": 10,
    "imageURL": "img/cards/10_clubs.png"
  },
  {
    "id": 35,
    "color": "clubs",
    "weight": 11,
    "imageURL": "img/cards/jack_clubs.png"
  },
  {
    "id": 36,
    "color": "clubs",
    "weight": 12,
    "imageURL": "img/cards/queen_clubs.png"
  },
  {
    "id": 37,
    "color": "clubs",
    "weight": 13,
    "imageURL": "img/cards/king_clubs.png"
  },
  {
    "id": 38,
    "color": "clubs",
    "weight": 14,
    "imageURL": "img/cards/ace_clubs.png"
  },

  {
    "id": 39,
    "color": "spades",
    "weight": 2,
    "imageURL": "img/cards/2_spades.png"
  },
  {
    "id": 40,
    "color": "spades",
    "weight": 3,
    "imageURL": "img/cards/3_spades.png"
  },
  {
    "id": 41,
    "color": "spades",
    "weight": 4,
    "imageURL": "img/cards/4_spades.png"
  },
  {
    "id": 42,
    "color": "spades",
    "weight": 5,
    "imageURL": "img/cards/5_spades.png"
  },
  {
    "id": 43,
    "color": "spades",
    "weight": 6,
    "imageURL": "img/cards/6_spades.png"
  },
  {
    "id": 44,
    "color": "spades",
    "weight": 7,
    "imageURL": "img/cards/7_spades.png"
  },
  {
    "id": 45,
    "color": "spades",
    "weight": 8,
    "imageURL": "img/cards/8_spades.png"
  },
  {
    "id": 46,
    "color": "spades",
    "weight": 9,
    "imageURL": "img/cards/9_spades.png"
  },
  {
    "id": 47,
    "color": "spades",
    "weight": 10,
    "imageURL": "img/cards/10_spades.png"
  },
  {
    "id": 48,
    "color": "spades",
    "weight": 11,
    "imageURL": "img/cards/jack_spades.png"
  },
  {
    "id": 49,
    "color": "spades",
    "weight": 12,
    "imageURL": "img/cards/queen_spades.png"
  },
  {
    "id": 50,
    "color": "spades",
    "weight": 13,
    "imageURL": "img/cards/king_spades.png"
  },
  {
    "id": 51,
    "color": "spades",
    "weight": 14,
    "imageURL": "img/cards/ace_spades.png"
  }
];