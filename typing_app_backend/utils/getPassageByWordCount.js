const { countWords } = require('./normalizeText');

function getPassageByWordCountUtil(text,time) {
  const words = countWords(text);

  if (time === '5 Min'){
    if(words<500){
      throw new Error(
        `Word count too low for 5 Min. Minimum 500 words required. Got ${words}`
      );
    }else{
    return 500;
    }
  }

    if (time === '10 Min'){
    if(words<1000){
      throw new Error(
        `Word count too low for 10 Min. Minimum 1000 words required. Got ${words}`
      );
    }else{
    return 1000;
    }
  }
    if (time === '15 Min'){
    if(words<1500){
      throw new Error(
        `Word count too low for 15 Min. Minimum 1500 words required. Got ${words}`
      );
    }else{
    return 1500;
    }
  }
    if (time === 'Free'){
    if(words<1800){
      throw new Error(
        `Word count too low for Free Test. Minimum 1800 words required. Got ${words}`
      );
    }else{
    return 1800;
    }
  }
  throw new Error(`Invalid time parameter: ${time}`);
}

module.exports = { getPassageByWordCountUtil };
