(function(){
  // Registers a simple KrutiDev input method for jquery.ime using mappings from Mapping/KrutiDev.json
  function registerKrutiDev(mapping){
    try{
      // build flat mapping of single-key sequences
      var patterns = {};
      function copyMap(src){
        if(!src) return;
        Object.keys(src).forEach(function(k){
          patterns[k] = src[k];
        });
      }
      copyMap(mapping.letters);
      copyMap(mapping.capitals);
      copyMap(mapping.matras);
      copyMap(mapping.special);
      copyMap(mapping.punctuation);
      copyMap(mapping.digits);

      if(window.jQuery && window.jQuery.ime){
        window.jQuery.ime.register({
          id: 'krutidev',
          name: 'Kruti Dev 010',
          description: 'Kruti Dev 010 mapping loaded from KrutiDev.json',
          patterns: patterns
        });
        console.log('Kruti Dev IME registered with', Object.keys(patterns).length, 'patterns');
      }
    }catch(e){
      console.error('Failed to register KrutiDev IME', e);
    }
  }

  // fetch mapping and register IME
  fetch('/Mapping/KrutiDev.json')
    .then(function(res){ return res.json(); })
    .then(function(data){ if(data && data.krutiDev) registerKrutiDev(data.krutiDev); })
    .catch(function(err){ console.error('Failed to load KrutiDev.json for IME', err); });
})();
