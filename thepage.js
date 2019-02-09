 'use strict';

 var CUSTOM_SEARCH_BASEURL="https://www.googleapis.com/customsearch/v1";
 //var API_KEY = 'AIzaSyC_O1nIR5CCFlFA_58Tav61WJ-Pk5gB6xQ';
 var API_KEY = 'AIzaSyDeNVlJNs_PDGt7ZmlUbbSfzi4e4veyUkE';
 var SEARCH_ENGINE_ID = '016537884841717004065:ydmz8gvwhvq';


function mkURL(base,dict) {
  var urlParams = new URLSearchParams();
    for (var k in dict) {
	if (dict[k]) {
	    urlParams.append(k, dict[k]);
	}
    }
    return base + '?' + urlParams;
}

function mkLink(href,text) {
  return '<a href=' + href + '>' + text + '</a>';
}

function Search(q,elem,cont) {
    this.elem = elem;
    this.cont = cont;
    this.q = q;

    this.totalResults = this.nextIdx = this.prevIdx = this.itemsOnPage = null;
    this.idx = 0;
    this.done = null;
    this.run(this.idx);
}



Search.prototype.run = function(idx) {
    var self = this;
    var req = new XMLHttpRequest();
    var res = null;
    var url = mkURL(CUSTOM_SEARCH_BASEURL,{'searchType': this.searchType,
					   'start': idx,
					   'q': this.q,
					   'key': API_KEY,
					   'cx': SEARCH_ENGINE_ID});
    this.elem.innerHTML = '';
    req.responseType = "json";
    req.open("GET",url);
    req.send();
    this.done = false;
    req.onreadystatechange = function(e) {
	if (req.readyState == 4 && req.status == 200) {
	    res = req.response;
	    console.log(res);
	    
	    self.itemsOnPage = res.items.length;
	    self.idx = res.queries.request[0].startIndex - 1;
	    self.totalResults = res.queries.request[0].totalResults;

	    if (self.totalResults > self.idx+self.itemsOnPage) {
		self.nextIdx = res.queries.nextPage[0].startIndex;
	    }
	    if (self.idx > 0) {
		self.prevIdx = res.queries.previousPage[0].startIndex;
	    }
	    for (var i=0; i < self.itemsOnPage; i++) {
		self.elem.innerHTML += self.show(res.items[i]);
	    }
	    self.done = true;
	    self.cont();
	}
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
    this.normalSearch = new Search(this.q,this.elem.getElementById('right'),this.barrier.bind(this));
    this.imgSearch = new ImgSearch(this.q,this.elem.getElementById('left'),this.barrier.bind(this));
    this.mkBottomNav();
}

MetaSearch.prototype.barrier = function() {
  if (this.imgSearch.done && this.normalSearch.done) {
    // Put async things in here
    this.refreshBottomNav()
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

MetaSearch.prototype.refreshBottomNav = function() {
    this.elem.getElementById('nextBtn').style.visibility = this.hasNext() ? 'visible' : 'hidden';
    this.elem.getElementById('prevBtn').style.visibility = this.hasPrev() ? 'visible' : 'hidden';
}

MetaSearch.prototype.mkBottomNav = function() {
    var self = this;
  this.elem.getElementById('nextBtn').onclick = function() {
    self.nextPage();
  }
  this.elem.getElementById('prevBtn').onclick = function() {
    self.prevPage();
  }
}

Search.prototype.show = function(it) {
    return '<div class="result">'+'<h3>'+mkLink(it.link,it.title)+'</h3>'+'<h5>'+it.snippet+'</h5></div>';
}

function ImgSearch() {
    this.searchType = 'image';
    Search.apply(this,arguments);
}

ImgSearch.prototype = Object.create(Search.prototype);
ImgSearch.prototype.constructor = ImgSearch;

ImgSearch.prototype.show = function(it) {
    return '<div class="imgresult"><a href='+it.link+'><img src='+it.link+'></img></a><h5>'+ it.title + '</h5><h6>' + it.displayLink + '</h6>' + '</div>';
}




window.onload = function() {

    document.getElementById('searchbutton').onclick = function() {
	    var q = document.getElementById('searchbox').value;
      var m = new MetaSearch(q,document);
    };
};
