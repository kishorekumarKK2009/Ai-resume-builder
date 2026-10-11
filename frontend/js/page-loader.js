const PAGE_LOADER_ID = 'globalPageLoader';

function createLoader(){
  if(document.getElementById(PAGE_LOADER_ID)) return;
  const loader = document.createElement('div');
  loader.id = PAGE_LOADER_ID;
  loader.className = 'page-loader';
  loader.innerHTML = '<div class="page-loader__spinner"></div>';
  document.body.appendChild(loader);
}

function hideLoader(){
  const loader = document.getElementById(PAGE_LOADER_ID);
  if(!loader) return;
  loader.classList.add('page-loader--hidden');
  setTimeout(()=>loader.remove(), 300);
}

function showLoader(){
  createLoader();
  document.body.classList.add('page-loading');
}

function readyPage(callback){
  showLoader();
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    window.setTimeout(()=>{
      hideLoader();
      if(typeof callback === 'function') callback();
    }, 100);
    return;
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    window.setTimeout(()=>{
      hideLoader();
      if(typeof callback === 'function') callback();
    }, 100);
  });
}

window.pageLoader = { show: showLoader, hide: hideLoader, ready: readyPage };
