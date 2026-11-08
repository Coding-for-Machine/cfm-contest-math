/**
 * MathPro Core Mathematical Engine
 * Pure logic decoupled from UI for deterministic calculations,
 * equation solving, matrix operations, and calculus.
 */

// Format numbers nicely: remove floating point glitches like 0.30000000000000004
export function formatNumber(n: number, precision = 6): string {
  if (Number.isNaN(n)) return 'NaN';
  if (!Number.isFinite(n)) return n > 0 ? '\\infty' : '-\\infty';
  // Round tiny floating precision errors
  const fixed = Number(n.toFixed(precision));
  // If it's effectively an integer
  if (Math.abs(fixed - Math.round(fixed)) < 1e-10) {
    return Math.round(fixed).toString();
  }
  return fixed.toString();
}

/** Quadratic equation: a*x^2 + b*x + c = 0 */
export interface QuadraticStep {
  title: string;
  latex: string;
  explanation: string;
}

export interface QuadraticResult {
  a: number;
  b: number;
  c: number;
  discriminant: number;
  roots: { r1: string; r2: string; isComplex: boolean };
  vertex: { x: number; y: number };
  steps: QuadraticStep[];
}

export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  if (a === 0) {
    throw new Error("Kvadrat tenglamada a koeffitsiyent 0 bo'lishi mumkin emas!");
  }

  const d = b * b - 4 * a * c;
  const steps: QuadraticStep[] = [];

  // Step 1: Equation form
  const signB = b >= 0 ? `+ ${formatNumber(b)}` : `- ${formatNumber(Math.abs(b))}`;
  const signC = c >= 0 ? `+ ${formatNumber(c)}` : `- ${formatNumber(Math.abs(c))}`;
  steps.push({
    title: '1-qadam: Tenglamaning standart ko\'rinishi',
    latex: `${formatNumber(a)}x^2 ${signB}x ${signC} = 0`,
    explanation: `Koeffitsiyentlar: a = ${a}, b = ${b}, c = ${c}`,
  });

  // Step 2: Discriminant
  steps.push({
    title: '2-qadam: Diskriminant (D) ni hisoblash',
    latex: `D = b^2 - 4ac = (${formatNumber(b)})^2 - 4 \\cdot (${formatNumber(a)}) \\cdot (${formatNumber(c)}) = ${formatNumber(d)}`,
    explanation: d > 0
      ? 'D > 0: Tenglama ikkita turli haqiqiy ildizga ega.'
      : d === 0
      ? 'D = 0: Tenglama ikkita teng (bitta karrali) haqiqiy ildizga ega.'
      : 'D < 0: Tenglama haqiqiy sonlar to\'plamida ildizga ega emas (kompleks ildizlar mavjud).',
  });

  // Step 3: Roots
  let r1 = '';
  let r2 = '';
  const isComplex = d < 0;

  if (d > 0) {
    const sqrtD = Math.sqrt(d);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    r1 = formatNumber(x1);
    r2 = formatNumber(x2);

    steps.push({
      title: '3-qadam: Ildizlar formulasini qo\'llash',
      latex: `x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{${formatNumber(-b)} \\pm \\sqrt{${formatNumber(d)}}}{2 \\cdot ${formatNumber(a)}}`,
      explanation: `Ildizlar: x_1 = ${r1}, x_2 = ${r2}`,
    });
  } else if (d === 0) {
    const x = -b / (2 * a);
    r1 = formatNumber(x);
    r2 = r1;
    steps.push({
      title: '3-qadam: Yagona karrali ildiz',
      latex: `x = \\frac{-b}{2a} = \\frac{${formatNumber(-b)}}{2 \\cdot ${formatNumber(a)}} = ${r1}`,
      explanation: `x_1 = x_2 = ${r1}`,
    });
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-d) / (2 * Math.abs(a));
    const realStr = formatNumber(realPart);
    const imagStr = formatNumber(imagPart);
    r1 = `${realStr} + ${imagStr}i`;
    r2 = `${realStr} - ${imagStr}i`;

    steps.push({
      title: '3-qadam: Kompleks ildizlar',
      latex: `x_{1,2} = \\frac{-b \\pm i\\sqrt{|D|}}{2a} = ${realStr} \\pm ${imagStr}i`,
      explanation: `Kompleks ildizlar: x_1 = ${r1}, x_2 = ${r2}`,
    });
  }

  // Parabola vertex
  const vx = -b / (2 * a);
  const vy = c - (b * b) / (4 * a);
  steps.push({
    title: '4-qadam: Parabola uchi koordinatalari',
    latex: `x_0 = -\\frac{b}{2a} = ${formatNumber(vx)}, \\quad y_0 = -\\frac{D}{4a} = ${formatNumber(vy)}`,
    explanation: `Parabola uchi: (${formatNumber(vx)}, ${formatNumber(vy)}). Tarmoqlari ${a > 0 ? "yuqoriga" : "pastga"} qaragan.`,
  });

  return { a, b, c, discriminant: d, roots: { r1, r2, isComplex }, vertex: { x: vx, y: vy }, steps };
}

/** Linear equation: a*x + b = c */
export interface LinearResult {
  a: number;
  b: number;
  c: number;
  x: number | null;
  infiniteRoots: boolean;
  noRoots: boolean;
  steps: { title: string; latex: string; explanation: string }[];
}

export function solveLinear(a: number, b: number, c: number): LinearResult {
  const steps = [];
  const signB = b >= 0 ? `+ ${formatNumber(b)}` : `- ${formatNumber(Math.abs(b))}`;
  steps.push({
    title: '1-qadam: Boshlang\'ich tenglama',
    latex: `${formatNumber(a)}x ${signB} = ${formatNumber(c)}`,
    explanation: `Noma'lum x ni topish uchun ozod sonni o'ng tomonga o'tkazamiz.`,
  });

  const rhs = c - b;
  steps.push({
    title: '2-qadam: O\'zgarmaslarni o\'ng tomonga o\'tkazish',
    latex: `${formatNumber(a)}x = ${formatNumber(c)} - (${formatNumber(b)}) = ${formatNumber(rhs)}`,
    explanation: `Chap tomonda faqat ${a}x qoldi.`,
  });

  if (a === 0) {
    if (rhs === 0) {
      steps.push({
        title: '3-qadam: Xulosa',
        latex: `0 \\cdot x = 0`,
        explanation: 'Cheksiz ko\'p yechimga ega (x ning har qanday qiymati to\'g\'ri keladi).',
      });
      return { a, b, c, x: null, infiniteRoots: true, noRoots: false, steps };
    } else {
      steps.push({
        title: '3-qadam: Xulosa',
        latex: `0 \\cdot x = ${formatNumber(rhs)}`,
        explanation: 'Yechimga ega emas (bo\'sh to\'plam $\\emptyset$).',
      });
      return { a, b, c, x: null, infiniteRoots: false, noRoots: true, steps };
    }
  }

  const x = rhs / a;
  steps.push({
    title: '3-qadam: x ni topish',
    latex: `x = \\frac{${formatNumber(rhs)}}{${formatNumber(a)}} = ${formatNumber(x)}`,
    explanation: `Yagona yechim: x = ${formatNumber(x)}`,
  });

  return { a, b, c, x, infiniteRoots: false, noRoots: false, steps };
}

/** 2x2 System of Linear Equations:
 * a1*x + b1*y = c1
 * a2*x + b2*y = c2
 * Solved via Cramer's rule
 */
export interface System2x2Result {
  delta: number;
  deltaX: number;
  deltaY: number;
  x: number | null;
  y: number | null;
  status: 'unique' | 'infinite' | 'none';
  steps: { title: string; latex: string; explanation: string }[];
}

export function solveSystem2x2(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): System2x2Result {
  const steps = [];

  const delta = a1 * b2 - a2 * b1;
  const deltaX = c1 * b2 - c2 * b1;
  const deltaY = a1 * c2 - a2 * c1;

  steps.push({
    title: '1-qadam: Kramer usuli asosiy determinanti (\\Delta)',
    latex: `\\Delta = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1})(${b2}) - (${a2})(${b1}) = ${delta}`,
    explanation: `Asosiy determinant: \\Delta = ${delta}`,
  });

  steps.push({
    title: '2-qadam: \\Delta_x va \\Delta_y determinantlarini hisoblash',
    latex: `\\Delta_x = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = ${deltaX}, \\quad \\Delta_y = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = ${deltaY}`,
    explanation: 'Ozod hadlar ustuni bilan almashtirish orqali topiladi.',
  });

  if (Math.abs(delta) < 1e-12) {
    if (Math.abs(deltaX) < 1e-12 && Math.abs(deltaY) < 1e-12) {
      steps.push({
        title: '3-qadam: Xulosa',
        latex: `\\Delta = 0, \\Delta_x = 0, \\Delta_y = 0`,
        explanation: 'Sistema cheksiz ko\'p yechimga ega.',
      });
      return { delta, deltaX, deltaY, x: null, y: null, status: 'infinite', steps };
    } else {
      steps.push({
        title: '3-qadam: Xulosa',
        latex: `\\Delta = 0, \\text{ ammo } \\Delta_x \\neq 0 \\text{ yoki } \\Delta_y \\neq 0`,
        explanation: 'Sistema yechimga ega emas (chiziqlar parallel).',
      });
      return { delta, deltaX, deltaY, x: null, y: null, status: 'none', steps };
    }
  }

  const x = deltaX / delta;
  const y = deltaY / delta;

  steps.push({
    title: '3-qadam: Noma\'lumlarni topish',
    latex: `x = \\frac{\\Delta_x}{\\Delta} = \\frac{${deltaX}}{${delta}} = ${formatNumber(x)}, \\quad y = \\frac{\\Delta_y}{\\Delta} = \\frac{${deltaY}}{${delta}} = ${formatNumber(y)}`,
    explanation: `Yagona yechim nuqtasi: (${formatNumber(x)}, ${formatNumber(y)})`,
  });

  return { delta, deltaX, deltaY, x, y, status: 'unique', steps };
}

/** Matrix Operations */
export function matrixDet2x2(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function matrixDet3x3(m: number[][]): number {
  const [ [a, b, c], [d, e, f], [g, h, i] ] = m;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

export function matrixInverse2x2(m: number[][]): number[][] | null {
  const det = matrixDet2x2(m);
  if (Math.abs(det) < 1e-12) return null;
  return [
    [m[1][1] / det, -m[0][1] / det],
    [-m[1][0] / det, m[0][0] / det],
  ];
}

export function matrixTranspose(m: number[][]): number[][] {
  const rows = m.length;
  const cols = m[0].length;
  const res: number[][] = [];
  for (let c = 0; c < cols; c++) {
    res[c] = [];
    for (let r = 0; r < rows; r++) {
      res[c][r] = m[r][c];
    }
  }
  return res;
}

export function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error(`Matritsalar o'lchami mos kelmaydi: A (${rowsA}x${colsA}) va B (${rowsB}x${colsB})`);
  }

  const result: number[][] = [];
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

export function matrixAdd(A: number[][], B: number[][], subtract = false): number[][] {
  const rows = A.length;
  const cols = A[0].length;
  const res: number[][] = [];
  for (let i = 0; i < rows; i++) {
    res[i] = [];
    for (let j = 0; j < cols; j++) {
      res[i][j] = subtract ? A[i][j] - B[i][j] : A[i][j] + B[i][j];
    }
  }
  return res;
}

export function matrixToLatex(m: number[][]): string {
  const rows = m.map(row => row.map(v => formatNumber(v)).join(' & ')).join(' \\\\ ');
  return `\\begin{pmatrix} ${rows} \\end{pmatrix}`;
}

/** Calculus: Numerical definite integral using Simpson's Rule */
export function integrateSimpsons(fn: (x: number) => number, a: number, b: number, n = 100): number {
  if (n % 2 !== 0) n++; // Must be even
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += i % 2 === 0 ? 2 * fn(x) : 4 * fn(x);
  }

  return (h / 3) * sum;
}

/** Calculus: Numerical derivative using Central Difference formula */
export function derivativeAt(fn: (x: number) => number, x: number, h = 1e-5): number {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

/** Geometry triangle solver: Given 3 sides a, b, c */
export interface TriangleResult {
  a: number;
  b: number;
  c: number;
  perimeter: number;
  semiPerimeter: number;
  area: number;
  anglesDeg: { A: number; B: number; C: number };
  inradius: number;
  circumradius: number;
  type: string;
}

export function solveTriangle(a: number, b: number, c: number): TriangleResult {
  if (a <= 0 || b <= 0 || c <= 0) {
    throw new Error("Uchburchak tomonlari musbat son bo'lishi kerak!");
  }
  if (a + b <= c || a + c <= b || b + c <= a) {
    throw new Error("Uchburchak tengsizligi bajarilmaydi: ixtiyoriy ikki tomon yig'indisi uchinchisidan katta bo'lishi shart!");
  }

  const p = a + b + c;
  const s = p / 2;
  // Heron formula
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  // Law of Cosines for angles
  const cosA = (b * b + c * c - a * a) / (2 * b * c);
  const cosB = (a * a + c * c - b * b) / (2 * a * c);
  const cosC = (a * a + b * b - c * c) / (2 * a * b);

  const radToDeg = 180 / Math.PI;
  const angleA = Math.acos(Math.max(-1, Math.min(1, cosA))) * radToDeg;
  const angleB = Math.acos(Math.max(-1, Math.min(1, cosB))) * radToDeg;
  const angleC = Math.acos(Math.max(-1, Math.min(1, cosC))) * radToDeg;

  // Inradius & circumradius
  const inradius = area / s;
  const circumradius = (a * b * c) / (4 * area);

  // Triangle type
  let type = "Turli tomonli";
  if (Math.abs(a - b) < 1e-6 && Math.abs(b - c) < 1e-6) {
    type = "Teng tomonli (muntazam)";
  } else if (Math.abs(a - b) < 1e-6 || Math.abs(a - c) < 1e-6 || Math.abs(b - c) < 1e-6) {
    type = "Teng yonli";
  }

  if (Math.abs(angleA - 90) < 0.01 || Math.abs(angleB - 90) < 0.01 || Math.abs(angleC - 90) < 0.01) {
    type += ", To'g'ri burchakli";
  } else if (angleA > 90 || angleB > 90 || angleC > 90) {
    type += ", O'tmas burchakli";
  } else {
    type += ", O'tkir burchakli";
  }

  return {
    a, b, c,
    perimeter: p,
    semiPerimeter: s,
    area,
    anglesDeg: { A: angleA, B: angleB, C: angleC },
    inradius,
    circumradius,
    type,
  };
}

/** Unit and base conversion */
export function convertAngle(value: number, from: 'deg' | 'rad' | 'grad', to: 'deg' | 'rad' | 'grad'): number {
  let inDeg = value;
  if (from === 'rad') inDeg = value * (180 / Math.PI);
  else if (from === 'grad') inDeg = value * 0.9;

  if (to === 'deg') return inDeg;
  if (to === 'rad') return inDeg * (Math.PI / 180);
  if (to === 'grad') return inDeg / 0.9;
  return value;
}

export function convertBase(value: string, fromBase: number, toBase: number): string {
  const clean = value.trim();
  if (!clean) return '';
  const parsed = parseInt(clean, fromBase);
  if (Number.isNaN(parsed)) return 'Noto\'g\'ri kiritish';
  return parsed.toString(toBase).toUpperCase();
}
