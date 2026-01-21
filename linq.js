class Enumerable {
  constructor(data) {
    this.data = Array.isArray(data) ? data : [data];
  }

  // 필터링
  where(predicate) {
    this.data = this.data.filter(predicate);
    return this;
  }

  // 변환
  select(selector) {
    this.data = this.data.map(selector);
    return this;
  }

  // 처음 N개 가져오기
  take(count) {
    this.data = this.data.slice(0, count);
    return this;
  }

  // 처음 N개 스킵
  skip(count) {
    this.data = this.data.slice(count);
    return this;
  }

  // 정렬
  orderBy(selector, desc = false) {
    this.data.sort((a, b) => {
      const valA = selector(a);
      const valB = selector(b);
      if (valA < valB) return desc ? 1 : -1;
      if (valA > valB) return desc ? -1 : 1;
      return 0;
    });
    return this;
  }

  // 내림차순 정렬
  orderByDescending(selector) {
    return this.orderBy(selector, true);
  }

  // 중복 제거
  distinct(selector = x => x) {
    const seen = new Set();
    this.data = this.data.filter(item => {
      const key = selector(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return this;
  }

  // 그룹화
  groupBy(selector) {
    const groups = new Map();
    this.data.forEach(item => {
      const key = selector(item);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(item);
    });
    this.data = Array.from(groups, ([key, values]) => ({ key, values }));
    return this;
  }

  // 조인
  join(other, outerKey, innerKey, selector) {
    const innerMap = new Map();
    other.forEach(item => {
      const key = innerKey(item);
      if (!innerMap.has(key)) {
        innerMap.set(key, []);
      }
      innerMap.get(key).push(item);
    });

    this.data = this.data.flatMap(outer => {
      const key = outerKey(outer);
      const matches = innerMap.get(key) || [];
      return matches.map(inner => selector(outer, inner));
    });
    return this;
  }

  // 선택적으로 여러 배열 연결
  concat(...others) {
    this.data = this.data.concat(...others);
    return this;
  }

  // 첫 번째 요소 가져오기
  first(predicate = null) {
    if (predicate) {
      return this.data.find(predicate);
    }
    return this.data[0];
  }

  // 마지막 요소 가져오기
  last(predicate = null) {
    if (predicate) {
      const arr = this.data.filter(predicate);
      return arr[arr.length - 1];
    }
    return this.data[this.data.length - 1];
  }

  // 개수
  count(predicate = null) {
    if (predicate) {
      return this.data.filter(predicate).length;
    }
    return this.data.length;
  }

  // 조건을 만족하는 요소가 있는지 확인
  any(predicate = null) {
    if (predicate) {
      return this.data.some(predicate);
    }
    return this.data.length > 0;
  }

  // 모든 요소가 조건을 만족하는지 확인
  all(predicate) {
    return this.data.every(predicate);
  }

  // 합계
  sum(selector = x => x) {
    return this.data.reduce((acc, item) => acc + selector(item), 0);
  }

  // 평균
  average(selector = x => x) {
    if (this.data.length === 0) return 0;
    return this.sum(selector) / this.data.length;
  }

  // 최댓값
  max(selector = x => x) {
    return Math.max(...this.data.map(selector));
  }

  // 최솟값
  min(selector = x => x) {
    return Math.min(...this.data.map(selector));
  }

  // 조건에 따라 두 그룹으로 분할
  partition(predicate) {
    const trueArr = [];
    const falseArr = [];
    this.data.forEach(item => {
      if (predicate(item)) {
        trueArr.push(item);
      } else {
        falseArr.push(item);
      }
    });
    return [new Enumerable(trueArr), new Enumerable(falseArr)];
  }

  // 최종 배열로 변환
  toArray() {
    return this.data;
  }

  // JSON으로 변환
  toJson() {
    return JSON.stringify(this.data);
  }
}

// 사용 예제
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = new Enumerable(numbers)
  .where(x => x % 2 === 0)      // 짝수만
  .select(x => x * x)            // 제곱
  .take(3)                        // 처음 3개
  .toArray();

console.log(result); // [4, 16, 36]

// 더 복잡한 예제
const products = [
  { id: 1, name: 'Laptop', price: 1000, category: 'Electronics' },
  { id: 2, name: 'Mouse', price: 25, category: 'Electronics' },
  { id: 3, name: 'Desk', price: 300, category: 'Furniture' },
  { id: 4, name: 'Chair', price: 150, category: 'Furniture' }
];

const expensiveProducts = new Enumerable(products)
  .where(p => p.price > 100)
  .orderBy(p => p.price)
  .select(p => ({ name: p.name, price: p.price }))
  .toArray();

console.log(expensiveProducts);

// 그룹화 예제
const grouped = new Enumerable(products)
  .groupBy(p => p.category)
  .toArray();

console.log(grouped);

module.exports = Enumerable;
