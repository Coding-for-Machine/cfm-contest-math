import test from 'node:test';
import assert from 'node:assert/strict';
import {
  solveQuadratic,
  solveLinear,
  solveSystem2x2,
  matrixDet2x2,
  matrixDet3x3,
  matrixMultiply,
  matrixTranspose,
  integrateSimpsons,
  derivativeAt,
  solveTriangle,
  convertAngle,
  convertBase
} from './mathEngine';

test('solveQuadratic calculates roots and discriminant correctly', () => {
  // x^2 - 5x + 6 = 0 -> roots 3 and 2
  const res = solveQuadratic(1, -5, 6);
  assert.equal(res.discriminant, 1);
  assert.equal(res.roots.isComplex, false);
  assert.equal(res.roots.r1, '3');
  assert.equal(res.roots.r2, '2');
  assert.equal(res.vertex.x, 2.5);
  assert.equal(res.vertex.y, -0.25);
  assert.equal(res.steps.length, 4);

  // x^2 + 4 = 0 -> complex roots
  const resComplex = solveQuadratic(1, 0, 4);
  assert.equal(resComplex.discriminant, -16);
  assert.equal(resComplex.roots.isComplex, true);
  assert.ok(resComplex.roots.r1.includes('2i'));
});

test('solveLinear handles unique, infinite and no roots', () => {
  // 2x + 4 = 10 -> x = 3
  const res1 = solveLinear(2, 4, 10);
  assert.equal(res1.x, 3);
  assert.equal(res1.noRoots, false);

  // 0x + 5 = 10 -> no roots
  const res2 = solveLinear(0, 5, 10);
  assert.equal(res2.noRoots, true);

  // 0x + 5 = 5 -> infinite roots
  const res3 = solveLinear(0, 5, 5);
  assert.equal(res3.infiniteRoots, true);
});

test('solveSystem2x2 solves using Kramer rule', () => {
  // 2x + y = 5
  // x - y = 1
  // x = 2, y = 1
  const res = solveSystem2x2(2, 1, 5, 1, -1, 1);
  assert.equal(res.status, 'unique');
  assert.equal(res.delta, -3);
  assert.equal(res.x, 2);
  assert.equal(res.y, 1);
});

test('matrix operations calculate determinant, transpose and multiplication', () => {
  const m2 = [[1, 2], [3, 4]];
  assert.equal(matrixDet2x2(m2), -2);

  const m3 = [
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0]
  ];
  // 1*(0 - 24) - 2*(0 - 20) + 3*(0 - 5) = -24 + 40 - 15 = 1
  assert.equal(matrixDet3x3(m3), 1);

  const prod = matrixMultiply([[1, 2], [3, 4]], [[2, 0], [1, 2]]);
  // row 1: 1*2+2*1=4, 1*0+2*2=4
  // row 2: 3*2+4*1=10, 3*0+4*2=8
  assert.deepEqual(prod, [[4, 4], [10, 8]]);

  const trans = matrixTranspose([[1, 2, 3], [4, 5, 6]]);
  assert.deepEqual(trans, [[1, 4], [2, 5], [3, 6]]);
});

test('calculus numerical routines: derivative and integral', () => {
  // f(x) = x^2, derivative at x=3 is 6
  const d = derivativeAt((x) => x * x, 3);
  assert.ok(Math.abs(d - 6) < 1e-4);

  // \int_0^2 x^2 dx = 8/3 = 2.6666...
  const integral = integrateSimpsons((x) => x * x, 0, 2);
  assert.ok(Math.abs(integral - 8 / 3) < 1e-4);
});

test('triangle solver calculates area and angles', () => {
  // 3, 4, 5 right triangle -> area 6, angles 90, 53.13, 36.87
  const tri = solveTriangle(3, 4, 5);
  assert.equal(tri.perimeter, 12);
  assert.equal(tri.area, 6);
  assert.ok(tri.type.includes("To'g'ri burchakli"));
  assert.ok(Math.abs(tri.anglesDeg.C - 90) < 0.01);
});

test('conversion helpers work accurately', () => {
  // 180 deg = pi rad
  const rad = convertAngle(180, 'deg', 'rad');
  assert.ok(Math.abs(rad - Math.PI) < 1e-6);

  // Base 10 '255' -> hex 'FF'
  assert.equal(convertBase('255', 10, 16), 'FF');
  // Base 2 '1010' -> dec '10'
  assert.equal(convertBase('1010', 2, 10), '10');
});
