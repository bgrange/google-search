 'use strict';

 var CUSTOM_SEARCH_BASEURL="https://www.googleapis.com/customsearch/v1?";
 //var API_KEY = 'AIzaSyC_O1nIR5CCFlFA_58Tav61WJ-Pk5gB6xQ';
 var API_KEY = 'AIzaSyDeNVlJNs_PDGt7ZmlUbbSfzi4e4veyUkE';
 var SEARCH_ENGINE_ID = '016537884841717004065:ydmz8gvwhvq';


function mkURL(base,dict) {
  var urlParams = new URLSearchParams();
  for (var k in dict) {
    urlParams.append(k, dict[k]);
  }
  return base + '?' + urlParams;
}

function mkLink(href,text) {
  return '<a href=' + href + '>' + text + '</a>';
}

function Search(q,showFunc,elem,cont) {
    this.elem = elem;
    this.cont = cont;
    this.showFunc = showFunc;
    this.q = q;
    this.searchType = searchType;

    this.totalResults = this.nextIdx = this.prevIdx = this.itemsOnPage = null;
    this.idx = 0;
    this.done = null;
    this.run(this.idx);
}



Search.prototype.run = function(idx) {
  var self = this;
  var req = new XMLHttpRequest();

  var url = mkURL(CUSTOM_SEARCH_BASEURL,{'searchType': this.searchType,
                                     'startIdx': idx,
                                     'q': this.q,
                                     'key': API_KEY,
                                     'cx': SEARCH_ENGINE_ID});
  this.elem.innerHTML = '';
  req.responseType = "json";
  req.open("GET",url);
  req.send();
  this.done = false;
  req.onreadystatechange = function(e) {
      self.done = true;
       console.log(req.response);

       self.itemsOnPage = req.response.items.length;
       self.idx = req.response.queries.request.startIndex;
       self.totalResults = req.response.queries.request.totalResults;

       try {
         self.nextIdx = req.response.queries.nextPage.startIdx;
         self.prevIdx = req.response.queries.prevPage.startIdx; // CHECK THIS???
       } catch {

       }

       for (var i=0; i < self.itemsOnPage; i++) {
         self.elem.innerHTML += self.showFunc(req.response.items[i]);
       }

       self.cont();
  };
}

Search.prototype.hasPrev = function() {
  return this.prevIdx || false;
}

Search.prototype.hasNext = function() {
  return this.nextIdx || false;
}

Search.prototype.nextPage = function() {
  this.run(this.nextIdx);
}

Search.prototype.prevPage = function() {
  this.run(this.prevIdx);
}

function MetaSearch(q,elem) {
  this.q = q;
  this.elem = elem;
  this.totalResults = null;
  this.normalSearch = new Search(this.q,this.showNormal,this.elem.getElementById('right'),this.barrier);
  this.imgSearch = new ImgSearch(this.q,this.showImg,this.elem.getElementById('left'),this.barrier);
}

MetaSearch.prototype.barrier = function() {
  if (this.imgSearch.done && this.normalSearch.done) {
    // Put async things in here
    this.makeBottomNav()
  }
}

MetaSearch.prototype.hasPrev = function() {
  return this.imgSearch.hasPrev() || this.normalSearch.hasPrev();
}
MetaSearch.prototype.hasNext = function() {
  return this.imgSearch.hasNext() || this.normalSearch.hasNext();
}

MetaSearch.prototype.nextPage = function() {
  this.normalSearch.nextPage();
  this.imgSearch.nextPage();
}

MetaSearch.prototype.prevPage = function() {
  this.normalSearch.prevPage();
  this.imgSearch.prevPage();
}

MetaSearch.prototype.makeBottomNav = function(hasPrev,hasNext) {
  // We need to wait for the requests to complete before we can do this
  var html = 0;
  if (this.hasPrev()) {
    html += '<button id=nextBtn>next</button>';
  }
  if (this.hasNext()) {
    html += '<button id=prevBtn>prev</button>';
  }
  this.elem.getElementById('bottom').innerHTML = html;
  this.elem.getElementById('nextBtn').onclick = function() {
    this.nextPage();
  }
  this.elem.getElementById('prevBtn').onclick = function() {
    this.prevPage();
  }
}

Search.prototype.show = function(it) {
    return '<div class="result">'+'<h3>'+link(it.link,it.title)+'</h3>'+'<h5>'+it.snippet+'</h5></div>';
}

function ImgSearch() {
  this.searchType = 'image';
}

ImgSearch.prototype.show = function(it) {
    return '<div class="imgresult"><a href='+it.link+'><img src='+it.link+'></img></a><h5>'+ it.title + '</h5><h6>' + it.displayLink + '</h6>' + '</div>';
}




window.onload = function() {

    document.getElementById('searchbutton').onclick = function() {
	    var q = document.getElementById('searchbox').value;
      var m = new MetaSearch(q,document);
    };
};
