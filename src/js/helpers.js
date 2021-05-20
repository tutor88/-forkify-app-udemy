import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    //checking if uploadData exists otherwise just fetching url
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    ///throw error if status is not ok, usually when links doesnt exist, 404
    if (!res.ok) throw new Error(`${data.message}`);
    return data;
  } catch (err) {
    ///rethrow error so the promise that will be returned is rejected
    throw err;
  }
};

///refactorea above
// export const getJSON = async function (url) {
//   try {
//     ///race against the timer
//     const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
//     const data = await res.json();

//     ///throw error if status is not ok, usually when links doesnt exist, 404
//     if (!res.ok) throw new Error(`${data.message}`);
//     return data;
//   } catch (err) {
//     ///rethrow error zo the promise that will be returned is rejected
//     throw err;
//   }
// };
// export const sendJSON = async function (url, uploadData) {
//   try {
//     ///race against the timer
//     const fetchPro = fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(uploadData),
//     });
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
//     const data = await res.json();

//     ///throw error if status is not ok, usually when links doesnt exist, 404
//     if (!res.ok) throw new Error(`${data.message}`);
//     return data;
//   } catch (err) {
//     ///rethrow error so the promise that will be returned is rejected
//     throw err;
//   }
// };
