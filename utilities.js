import assert from 'assert';

export function getImageUrl(imageId, size){
    // https://iiif.io/api/image/2.0/#size 
    const _size = {
        "full": 848,
        "small": 150
    }
    return `https://www.artic.edu/iiif/2/${imageId}/full/${_size[size]},/0/default.jpg`
}

export function log(){
    console.log('🪵 ', ...arguments)
}

export function getEnvironmentVariable(name, defaultValue) {
    const value = process.env[name] || defaultValue;
    assert(value, `${name} not set`);
    return value;
  }

