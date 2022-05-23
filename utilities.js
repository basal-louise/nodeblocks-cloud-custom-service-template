/**========================================================================
 *                           Libraries
 *========================================================================**/
import assert from 'assert';

/**============================================
 *              Helper Functions
 *=============================================**/
 export function getImageUrl(imageId, size){
    // https://iiif.io/api/image/2.0/#size 
    const _size = {
        "full": 848,
        "small": 150
    }
    return `https://www.artic.edu/iiif/2/${imageId}/full/${_size[size]},/0/default.jpg`
}

// Loggers values to the Nodeblock's Cloud Studio under "view logs"
export function log(){
    console.log('🪵 ', ...arguments)
}
// get an Environment Variable and if its not set return the default value
export function getEnvironmentVariable(name, defaultValue) {
    const value = process.env[name] || defaultValue;
    assert(value, `${name} not set`);
    return value;
  }

