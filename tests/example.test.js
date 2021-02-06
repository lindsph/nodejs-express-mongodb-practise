const { calculateTip, add } = require('../src/math');
require('dotenv').config({ path: './test.env' })

test('should calculate total with tip', () => {
    const total = calculateTip(10, .3);

    expect(total).toBe(13);
});

// test('will use the default tip percentage when tip not provided', () => {
//     expect(calculateTip(10)).toBe(12)
// });

// test('async', (done) => {
//     setTimeout(()=> {
//         expect(2).toBe(2);
//         done();
//     }, 2000)
// });

// test('add function success', async () => {
//     const addFunc = await add(2, 2);
//     expect(addFunc).toBe(4);
// });

// test('add function success deux', (done) => {
//     add(5, 2).then(sum => {
//         expect(sum).toBe(7);
//         done()
//     })
// })

// test('add function failure', async () => {
//     try {
//         await add(9, -2);
//     } catch (error) {
//         expect(error).toMatch('Numbers must be positive')
//     }
// })