/**========================================================================
 *                           Libraries
 *========================================================================**/
 import assert from 'assert';

 /**============================================
  *              Helper Functions
  *=============================================**/
 // get an Environment Variable and if its not set return the default value
 export function getEnvironmentVariable(name, defaultValue) {
     const value = process.env[name] || defaultValue;
     assert(value, `${name} not set`);
     return value;
   }
 