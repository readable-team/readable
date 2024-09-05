import { expect, test } from 'vitest';
import { buildStoreSchema } from '../../tests/utils';
import { rootFieldKey } from './const';
import { denormalize } from './denormalize';
import { normalize } from './normalize';

test('기본 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        author {
          __typename
          id
          name
        }
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Book:book1",
      "Author:author1",
    }
  `);
});

test('중첩 객체와 리스트 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!) {
      author(id: $authorId) {
        __typename
        id
        name
        books {
          __typename
          id
          title
          reviews {
            __typename
            id
            comment
            rating
          }
        }
      }
    }
  `);

  const variables = { authorId: 'author1' };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: 'Jane Doe',
      books: [
        {
          __typename: 'Book',
          id: 'book1',
          title: 'GraphQL Mastery',
          reviews: [
            { __typename: 'Review', id: 'review1', comment: 'Great book!', rating: 5 },
            { __typename: 'Review', id: 'review2', comment: 'Very informative', rating: 4 },
          ],
        },
        {
          __typename: 'Book',
          id: 'book2',
          title: 'Advanced TypeScript',
          reviews: [{ __typename: 'Review', id: 'review3', comment: 'Excellent resource', rating: 5 }],
        },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Author:author1",
      "Book:book1",
      "Review:review1",
      "Review:review2",
      "Book:book2",
      "Review:review3",
    }
  `);
});

test('프래그먼트와 인라인 프래그먼트 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    fragment BookDetails on Book {
      isbn
      publishDate
    }

    query T($searchQuery: String!) {
      search(query: $searchQuery) {
        __typename
        ... on Book {
          id
          title
          ...BookDetails
        }
        ... on Author {
          id
          name
          searchTerms
        }
      }
    }
  `);

  const variables = { searchQuery: 'GraphQL' };
  const data = {
    search: [
      {
        __typename: 'Book',
        id: 'book1',
        title: 'GraphQL in Action',
        isbn: '978-1617295317',
        publishDate: '2021-03-30',
      },
      {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        searchTerms: ['GraphQL', 'API', 'Web Development'],
      },
    ],
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Book:book1",
      "Author:author1",
    }
  `);
});

test('순환 참조 데이터 구조 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!) {
      author(id: $authorId) {
        __typename
        id
        name
        books {
          __typename
          id
          title
          author {
            __typename
            id
            name
          }
        }
      }
    }
  `);

  const variables = { authorId: 'author1' };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: '작가 1',
      books: [
        {
          __typename: 'Book',
          id: 'book1',
          title: '책 1',
          author: {
            __typename: 'Author',
            id: 'author1',
            name: '작가 1',
          },
        },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Author:author1",
      "Book:book1",
    }
  `);
});

test('nullable 필드와 빈 리스트 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!) {
      author(id: $authorId) {
        __typename
        id
        name
        books {
          __typename
          id
          title
          publisher {
            __typename
            id
            name
          }
        }
      }
    }
  `);

  const variables = { authorId: 'author1' };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: '작가 1',
      books: [
        {
          __typename: 'Book',
          id: 'book1',
          title: '책 1',
          publisher: null,
        },
        {
          __typename: 'Book',
          id: 'book2',
          title: '책 2',
          publisher: {
            __typename: 'Publisher',
            id: 'publisher1',
            name: '출판사 1',
          },
        },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Author:author1",
      "Book:book1",
      "Book:book2",
      "Publisher:publisher1",
    }
  `);
});

test('인자가 있는 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!, $bookLimit: Int!) {
      author(id: $authorId) {
        __typename
        id
        name
        books(limit: $bookLimit) {
          __typename
          id
          title
        }
      }
    }
  `);

  const variables = { authorId: 'author1', bookLimit: 2 };
  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: '작가 1',
      books: [
        { __typename: 'Book', id: 'book1', title: '책 1' },
        { __typename: 'Book', id: 'book2', title: '책 2' },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Author:author1",
      "Book:book1",
      "Book:book2",
    }
  `);
});

test('복잡한 인자와 변수를 사용한 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($authorId: ID!, $bookFilters: BookFilters!) {
      author(id: $authorId) {
        __typename
        id
        name
        books(filters: $bookFilters) {
          __typename
          id
          title
          price
          category
        }
      }
    }
  `);

  const variables = {
    authorId: 'author1',
    bookFilters: {
      minPrice: 10,
      maxPrice: 50,
      categories: ['FICTION', 'SCIENCE'],
    },
  };

  const data = {
    author: {
      __typename: 'Author',
      id: 'author1',
      name: 'Jane Doe',
      books: [
        { __typename: 'Book', id: 'book1', title: 'GraphQL Mastery', price: 39.99, category: 'SCIENCE' },
        { __typename: 'Book', id: 'book2', title: 'Sci-Fi Adventures', price: 29.99, category: 'FICTION' },
      ],
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Author:author1",
      "Book:book1",
      "Book:book2",
    }
  `);
});

test('부분적으로 누락된 데이터 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        author {
          __typename
          id
          name
          books {
            __typename
            id
            title
          }
        }
        publisher {
          __typename
          id
          name
        }
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        books: [
          { __typename: 'Book', id: 'book1', title: 'GraphQL in Action' },
          { __typename: 'Book', id: 'book2', title: 'GraphQL Advanced' },
        ],
      },
      publisher: {
        __typename: 'Publisher',
        id: 'publisher1',
        name: 'Tech Books',
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalized: any = normalize(schema, variables, data);

  delete normalized.data['Book:book2'].title;
  delete normalized.data['Publisher:publisher1'].name;

  const denormalized = denormalize(schema, variables, normalized.data);

  const expected = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        books: [
          { __typename: 'Book', id: 'book1', title: 'GraphQL in Action' },
          { __typename: 'Book', id: 'book2', title: undefined },
        ],
      },
      publisher: {
        __typename: 'Publisher',
        id: 'publisher1',
        name: undefined,
      },
    },
  };

  expect(denormalized.data).toStrictEqual(expected);
  expect(denormalized.partial).toBe(true);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Book:book1",
      "Author:author1",
      "Book:book2",
      "Publisher:publisher1",
    }
  `);
});

test('별칭을 사용한 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        customTitle: title
        author {
          __typename
          id
          name
          customName: name
        }
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      customTitle: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
        customName: 'Eve Waltz',
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Book:book1",
      "Author:author1",
    }
  `);
});

test('인터페이스 타입 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($nodeId: ID!) {
      node(id: $nodeId) {
        __typename
        id
        ... on Book {
          title
          author {
            __typename
            id
            name
          }
        }
        ... on Author {
          name
          books {
            __typename
            id
            title
          }
        }
      }
    }
  `);

  const variables = { nodeId: 'book1' };
  const data = {
    node: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Book:book1",
      "Author:author1",
    }
  `);
});

test('변수와 지시어를 사용한 쿼리 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!, $includeAuthor: Boolean!, $skipPublisher: Boolean!) {
      book(id: $bookId) {
        __typename
        id
        title
        author @include(if: $includeAuthor) {
          __typename
          id
          name
        }
        publisher @skip(if: $skipPublisher) {
          __typename
          id
          name
        }
      }
    }
  `);

  const variables = { bookId: 'book1', includeAuthor: true, skipPublisher: false };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      author: {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
      },
      publisher: {
        __typename: 'Publisher',
        id: 'publisher1',
        name: 'Manning Publications',
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Book:book1",
      "Author:author1",
      "Publisher:publisher1",
    }
  `);
});

test('유니언 타입 필드 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($searchQuery: String!) {
      search(query: $searchQuery) {
        __typename
        ... on Book {
          id
          title
        }
        ... on Author {
          id
          name
        }
      }
    }
  `);

  const variables = { searchQuery: 'GraphQL' };
  const data = {
    search: [
      {
        __typename: 'Book',
        id: 'book1',
        title: 'GraphQL in Action',
      },
      {
        __typename: 'Author',
        id: 'author1',
        name: 'Eve Waltz',
      },
    ],
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Book:book1",
      "Author:author1",
    }
  `);
});

test('임베디드 타입 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
        dimensions {
          __typename
          width
          height
          depth
        }
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const data = {
    book: {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
      dimensions: {
        __typename: 'Dimensions',
        width: 152.4,
        height: 228.6,
        depth: 25.4,
      },
    },
  };

  const normalized = normalize(schema, variables, data);
  const denormalized = denormalize(schema, variables, normalized.data);

  expect(denormalized.data).toStrictEqual(data);
  expect(denormalized.partial).toBe(false);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`
    Set {
      "Book:book1",
    }
  `);
});

test('루트 필드 누락 시 역정규화', () => {
  const schema = buildStoreSchema(/* GraphQL */ `
    query T($bookId: ID!) {
      book(id: $bookId) {
        __typename
        id
        title
      }
    }
  `);

  const variables = { bookId: 'book1' };
  const storage = {
    [rootFieldKey]: {},
    'Book:book1': {
      __typename: 'Book',
      id: 'book1',
      title: 'GraphQL in Action',
    },
  };

  const denormalized = denormalize(schema, variables, storage);

  expect(denormalized.data).toStrictEqual({ book: undefined });
  expect(denormalized.partial).toBe(true);

  expect(denormalized.dependencies).toMatchInlineSnapshot(`Set {}`);
});
